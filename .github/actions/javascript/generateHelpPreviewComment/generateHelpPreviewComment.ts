import * as core from '@actions/core';
import {context, getOctokit} from '@actions/github';

type OctokitClient = ReturnType<typeof getOctokit>;

const DOCS_DIRECTORY_PREFIX = 'docs/';
const MARKDOWN_EXTENSION = '.md';
const INCLUDED_STATUSES = new Set(['added', 'modified', 'renamed']);

function normalizeAlias(alias: string): string {
    return alias.endsWith('/') ? alias : `${alias}/`;
}

function toRoutePath(filename: string): string {
    return filename.slice(DOCS_DIRECTORY_PREFIX.length).replaceAll(/\.md$/g, '');
}

async function getUpdatedDocRoutes(octokit: OctokitClient, owner: string, repo: string, prNumber: number): Promise<string[]> {
    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: prNumber,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: 100,
    });

    const routes = new Set<string>();

    for (const file of files) {
        const filename = file.filename ?? '';
        const status = file.status ?? '';

        if (!INCLUDED_STATUSES.has(status)) {
            continue;
        }

        if (!filename.startsWith(DOCS_DIRECTORY_PREFIX) || !filename.endsWith(MARKDOWN_EXTENSION)) {
            continue;
        }

        routes.add(toRoutePath(filename));
    }

    return [...routes].sort((a, b) => a.localeCompare(b));
}

async function run(): Promise<void> {
    const token = core.getInput('GITHUB_TOKEN', {required: true});
    const rootURL = core.getInput('ROOT_URL', {required: true}).trim();
    const pullRequestNumber = core.getInput('PULL_REQUEST_NUMBER', {required: true}).trim();

    const prNumber = Number(pullRequestNumber);
    if (Number.isNaN(prNumber)) {
        throw new Error(`Invalid PULL_REQUEST_NUMBER input: ${pullRequestNumber}`);
    }

    const octokit = getOctokit(token);
    const {owner, repo} = context.repo;

    const routes = await getUpdatedDocRoutes(octokit, owner, repo, prNumber);
    const normalizedRootURL = normalizeAlias(rootURL);

    const displayRootURL = normalizedRootURL.replaceAll(/\/$/g, '');
    let body = `A preview of your ExpensifyHelp changes have been deployed to ${displayRootURL} ⚡️`;

    if (routes.length > 0) {
        const listItems = routes.map((route) => `- [${route}](${normalizedRootURL}${route})`).join('\n');
        body += `\n\n**Updated articles:**\n${listItems}`;
    }

    core.setOutput('BODY', body);

    core.startGroup('Updated ExpensifyHelp routes');
    for (const route of routes) {
        console.log(route);
    }
    core.endGroup();

    console.log(`Generated preview comment with ${routes.length} updated article(s)`);
}

if (require.main === module) {
    run();
}

export default run;
