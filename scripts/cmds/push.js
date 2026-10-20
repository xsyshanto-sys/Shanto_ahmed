// code from goatstore
// api: https://store.agi.bd
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const ROOT = process.cwd();
const ALLOWED_DIRS = ["scripts/cmds", "scripts/events"];
const MAX_LIST = 15;

const GITHUB_TOKEN = "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";
const GITHUB_REPO = "";
const GITHUB_BRANCH = "";

const cleanRepo = value =>
	String(value || "")
		.trim()
		.replace(/^https?:\/\/github\.com\//i, "")
		.replace(/\.git$/i, "")
		.replace(/^\/+|\/+$/g, "");

const parseRepoUrl = url => {
	const m = String(url).match(/github\.com[:/]+([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/i);
	return m ? m[1] : null;
};

const readGitRemote = () => {
	try {
		const cfg = fs.readFileSync(path.join(ROOT, ".git", "config"), "utf8");
		const m = cfg.match(/\[remote "origin"\][^\[]*?url\s*=\s*(\S+)/);
		return m ? parseRepoUrl(m[1]) : null;
	}
	catch (e) {
		return null;
	}
};

const readGitBranch = () => {
	try {
		const head = fs.readFileSync(path.join(ROOT, ".git", "HEAD"), "utf8").trim();
		const m = head.match(/^ref:\s*refs\/heads\/(.+)$/);
		return m ? m[1] : null;
	}
	catch (e) {
		return null;
	}
};

const getRepoInfo = () => {
	const env = process.env;
	if (GITHUB_REPO) return { repo: cleanRepo(GITHUB_REPO), source: "hardcoded" };
	if (env.GITHUB_REPO) return { repo: cleanRepo(env.GITHUB_REPO), source: "GITHUB_REPO" };
	if (env.RENDER_GIT_REPO_SLUG) return { repo: cleanRepo(env.RENDER_GIT_REPO_SLUG), source: "Render" };
	if (env.RAILWAY_GIT_REPO_OWNER && env.RAILWAY_GIT_REPO_NAME)
		return { repo: cleanRepo(`${env.RAILWAY_GIT_REPO_OWNER}/${env.RAILWAY_GIT_REPO_NAME}`), source: "Railway" };
	const remote = readGitRemote();
	if (remote) return { repo: remote, source: ".git remote" };
	return null;
};

const createClient = token =>
	axios.create({
		baseURL: "https://api.github.com",
		timeout: 60000,
		maxBodyLength: Infinity,
		maxContentLength: Infinity,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			"User-Agent": "goatbot-push"
		}
	});

const describeError = e => {
	const status = e.response && e.response.status;
	const apiMsg = e.response && e.response.data && e.response.data.message;
	if (status === 401) return "GitHub rejected the token (401). Token is invalid or expired.";
	if (status === 403) return `GitHub denied access (403)${apiMsg ? `: ${apiMsg}` : ""}. Token needs write access to repository contents.`;
	if (status === 404) return "Repository or branch not found (404). Check GITHUB_REPO / GITHUB_BRANCH and make sure the token can access this repo.";
	if (status === 422) return `GitHub rejected the request (422)${apiMsg ? `: ${apiMsg}` : ""}`;
	return apiMsg || e.message || "Unknown error";
};

const resolveBranch = async (client, repo) => {
	const env = process.env;
	const fromEnv = GITHUB_BRANCH || env.GITHUB_BRANCH || env.RENDER_GIT_BRANCH || env.RAILWAY_GIT_BRANCH || readGitBranch();
	if (fromEnv) return fromEnv.trim();
	const res = await client.get(`/repos/${repo}`);
	return res.data.default_branch;
};

const toRelPath = input => {
	let rel = String(input).replace(/\\/g, "/").replace(/^\.?\//, "");
	if (/^(cmds|events)\//.test(rel)) rel = `scripts/${rel}`;
	if (!rel.includes("/")) rel = `scripts/cmds/${rel}`;
	if (!rel.endsWith(".js")) rel += ".js";
	rel = path.posix.normalize(rel);
	if (!ALLOWED_DIRS.includes(path.posix.dirname(rel))) return null;
	return rel;
};

const collectAll = () => {
	const out = [];
	for (const dir of ALLOWED_DIRS) {
		const abs = path.join(ROOT, dir);
		if (!fs.existsSync(abs)) continue;
		for (const file of fs.readdirSync(abs)) {
			if (!file.endsWith(".js")) continue;
			if (fs.statSync(path.join(abs, file)).isFile())
				out.push(`${dir}/${file}`);
		}
	}
	return out;
};

const commitEntries = async (client, repo, branch, entries, commitMessage) => {
	for (let attempt = 0; attempt < 3; attempt++) {
		const ref = await client.get(`/repos/${repo}/git/ref/heads/${branch}`);
		const parentSha = ref.data.object.sha;
		const parent = await client.get(`/repos/${repo}/git/commits/${parentSha}`);
		const baseTree = parent.data.tree.sha;

		const tree = await client.post(`/repos/${repo}/git/trees`, {
			base_tree: baseTree,
			tree: entries
		});

		if (tree.data.sha === baseTree)
			return { changed: false };

		const commit = await client.post(`/repos/${repo}/git/commits`, {
			message: commitMessage,
			tree: tree.data.sha,
			parents: [parentSha]
		});

		try {
			await client.patch(`/repos/${repo}/git/refs/heads/${branch}`, { sha: commit.data.sha });
		}
		catch (e) {
			if (e.response && e.response.status === 422 && attempt < 2)
				continue;
			throw e;
		}

		let files = [];
		try {
			const detail = await client.get(`/repos/${repo}/commits/${commit.data.sha}`);
			files = (detail.data.files || []).map(f => `${f.status} ${f.filename}`);
		}
		catch (e) {
			files = [];
		}

		return { changed: true, sha: commit.data.sha, files };
	}
	throw new Error("Branch kept changing while pushing. Try again.");
};

const formatFiles = files => {
	if (!files.length) return "";
	const shown = files.slice(0, MAX_LIST).map(f => `- ${f}`).join("\n");
	const extra = files.length > MAX_LIST ? `\n...and ${files.length - MAX_LIST} more` : "";
	return `\n${shown}${extra}`;
};

const usage =
	"Usage:\n" +
	"/push <file> [file2 ...]  push command files\n" +
	"/push all  push every command and event file\n" +
	"/push delete <file>  delete a file from GitHub\n" +
	"/push status  check token, repo and branch\n" +
	"Add -m <text> at the end for a custom commit message.\n" +
	"Use events/<file> for event files.";

module.exports = {
	config: {
		name: "push",
		aliases: ["gitpush", "commit"],
		version: "1.0",
		author: "EryXenX",
		countDown: 5,
		role: 2,
		description: {
			en: "Commit command files directly to GitHub so they survive restarts and redeploys"
		},
		category: "owner",
		guide: {
			en: "   {pn} <file> [file2 ...] [-m message]"
				+ "\n   {pn} all [-m message]"
				+ "\n   {pn} delete <file>"
				+ "\n   {pn} status"
		}
	},

	onStart: async function ({ args, message }) {
		const hardToken = GITHUB_TOKEN === "PASTE_YOUR_TOKEN_HERE" ? "" : GITHUB_TOKEN;
		const token = (hardToken || process.env.GITHUB_TOKEN || "").trim();

		if (!token)
			return message.reply("GitHub token is not set. Put your token in GITHUB_TOKEN at the top of scripts/cmds/push.js.");

		if (!args.length)
			return message.reply(usage);

		const repoInfo = getRepoInfo();

		if (!repoInfo)
			return message.reply("Could not detect which GitHub repo this bot is running from. Set GITHUB_REPO = \"owner/repo\" at the top of scripts/cmds/push.js.");

		const repo = repoInfo.repo;
		const client = createClient(token);
		const first = String(args[0]).toLowerCase();

		if (first === "status") {
			try {
				const info = await client.get(`/repos/${repo}`);
				const branch = await resolveBranch(client, repo);
				const canPush = info.data.permissions ? info.data.permissions.push === true : false;
				return message.reply(
					`Repo: ${info.data.full_name} (from ${repoInfo.source})\n` +
					`Branch: ${branch}\n` +
					`Write access: ${canPush ? "yes" : "no"}`
				);
			}
			catch (e) {
				return message.reply(`Status check failed.\n${describeError(e)}`);
			}
		}

		let commitMessage = "";
		let list = args.slice();
		const mIndex = list.indexOf("-m");
		if (mIndex !== -1) {
			commitMessage = list.slice(mIndex + 1).join(" ").trim();
			list = list.slice(0, mIndex);
		}

		if (!list.length)
			return message.reply(usage);

		const isDelete = String(list[0]).toLowerCase() === "delete";
		if (isDelete) list = list.slice(1);

		if (!list.length)
			return message.reply(usage);

		let branch;
		try {
			branch = await resolveBranch(client, repo);
		}
		catch (e) {
			return message.reply(`Could not read the repository.\n${describeError(e)}`);
		}

		if (isDelete) {
			const entries = [];
			const skipped = [];

			for (const name of list) {
				const rel = toRelPath(name);
				if (!rel) {
					skipped.push(`${name} (not allowed)`);
					continue;
				}
				try {
					await client.get(`/repos/${repo}/contents/${encodeURI(rel)}`, { params: { ref: branch } });
					entries.push({ path: rel, mode: "100644", type: "blob", sha: null });
				}
				catch (e) {
					if (e.response && e.response.status === 404)
						skipped.push(`${rel} (not on GitHub)`);
					else
						return message.reply(`Delete failed.\n${describeError(e)}`);
				}
			}

			if (!entries.length)
				return message.reply(`Nothing to delete.${skipped.length ? `\nSkipped:\n${skipped.map(s => `- ${s}`).join("\n")}` : ""}`);

			try {
				const result = await commitEntries(
					client, repo, branch, entries,
					commitMessage || `Delete ${entries.map(e => path.posix.basename(e.path)).join(", ")} via bot`
				);
				if (!result.changed)
					return message.reply("No changes were made.");
				return message.reply(
					`Deleted from ${repo}@${branch}\nCommit: ${result.sha.slice(0, 7)}${formatFiles(result.files)}` +
					(skipped.length ? `\nSkipped:\n${skipped.map(s => `- ${s}`).join("\n")}` : "")
				);
			}
			catch (e) {
				return message.reply(`Delete failed.\n${describeError(e)}`);
			}
		}

		let relPaths = [];
		const skipped = [];

		if (list.length === 1 && String(list[0]).toLowerCase() === "all") {
			relPaths = collectAll();
		}
		else {
			for (const name of list) {
				const rel = toRelPath(name);
				if (!rel) {
					skipped.push(`${name} (only scripts/cmds and scripts/events .js files are allowed)`);
					continue;
				}
				if (!fs.existsSync(path.join(ROOT, rel))) {
					skipped.push(`${rel} (file not found on bot)`);
					continue;
				}
				if (!relPaths.includes(rel)) relPaths.push(rel);
			}
		}

		if (!relPaths.length)
			return message.reply(`Nothing to push.${skipped.length ? `\nSkipped:\n${skipped.map(s => `- ${s}`).join("\n")}` : ""}`);

		const entries = [];
		for (const rel of relPaths) {
			const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
			if (!content.trim()) {
				skipped.push(`${rel} (empty file)`);
				continue;
			}
			entries.push({ path: rel, mode: "100644", type: "blob", content });
		}

		if (!entries.length)
			return message.reply("Nothing to push. All selected files are empty.");

		await message.reply(`Pushing ${entries.length} file(s) to ${repo}@${branch}...`);

		const defaultMessage = entries.length <= 3
			? `Update ${entries.map(e => path.posix.basename(e.path)).join(", ")} via bot`
			: `Update ${entries.length} files via bot`;

		try {
			const result = await commitEntries(client, repo, branch, entries, commitMessage || defaultMessage);

			if (!result.changed)
				return message.reply(
					"No changes. GitHub already has the same content." +
					(skipped.length ? `\nSkipped:\n${skipped.map(s => `- ${s}`).join("\n")}` : "")
				);

			return message.reply(
				`Pushed to ${repo}@${branch}\nCommit: ${result.sha.slice(0, 7)}${formatFiles(result.files)}` +
				(skipped.length ? `\nSkipped:\n${skipped.map(s => `- ${s}`).join("\n")}` : "")
			);
		}
		catch (e) {
			return message.reply(`Push failed.\n${describeError(e)}`);
		}
	}
};
