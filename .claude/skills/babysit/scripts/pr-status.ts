#!/usr/bin/env bun
/* eslint-disable @typescript-eslint/naming-convention -- GitHub's REST API names these fields in snake_case */
// Usage: bun pr-status.ts [pr number or URL] [--repo owner/name] [--watch] [--interval <s>] [--timeout <s>] [--ack <id>... | --ack-all]

import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname, join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

type Verdict = 'READY' | 'WAITING' | 'ACTION' | 'CLOSED';

/** A CheckRun carries `status`; a legacy commit status carries only `state`. */
type Check = {
    name?: string;
    context?: string;
    status?: string;
    conclusion?: string | null;
    state?: string;
    startedAt?: string | null;
    detailsUrl?: string | null;
    targetUrl?: string | null;
};

type PullRequest = {
    number: number;
    url: string;
    state: string;
    headRefOid: string;
    baseRefName: string;
    isDraft: boolean;
    mergeable: string;
    commits: Array<{committedDate: string}>;
    statusCheckRollup?: Check[] | null;
};

/** GitHub nulls the author of a comment or review whose account was deleted. */
type Author = {login: string} | null;

type ThreadComment = {
    databaseId?: number;
    author: Author;
    body: string;
    url: string;
};

type Thread = {
    id: string;
    isResolved: boolean;
    isOutdated: boolean;
    path: string;
    line: number | null;
    /** The first and newest comment, however long the thread. */
    root: {nodes: ThreadComment[]};
    latest: {nodes: ThreadComment[]};
};

type ThreadPage = {
    pageInfo: {hasNextPage: boolean; endCursor: string};
    nodes: Thread[];
};

type IssueComment = {
    id: number;
    user: Author;
    created_at: string;
    html_url: string;
    body: string;
    acknowledged?: boolean;
};

type Review = {
    id: number;
    user: Author;
    state: string;
    body: string | null;
    html_url: string;
    /** Null for the viewer's own unsubmitted draft. */
    submitted_at: string | null;
};

type SummaryInput = {
    pr: PullRequest;
    threads: Thread[];
    comments: IssueComment[];
    reviews?: Review[];
    viewer?: string;
    now?: number;
};

type ReadMarkers = Record<string, number[]>;

// STALE: GitHub expired a result nobody refreshed, so it needs a rerun, not trust.
const FAILED = new Set(['FAILURE', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'STALE', 'ERROR']);

// Only a human can turn these green, so they're notes instead of blockers.
const HUMAN_GATED = new Set(['checklist', 'Check independent approval']);

// GitHub exposes no push time, so the head's first check start stands in for it.
const SETTLE_MS = 120_000;

// Only these replace a reviewer's earlier verdict, matching GitHub's review decision.
const VERDICTS = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);

const PREVIEW_LENGTH = 600;

const DEFAULT_REPO = 'Expensify/App';

const READ_MARKERS_FILE = join(process.env.XDG_STATE_HOME ?? join(homedir(), '.local', 'state'), 'pr-status', 'read-comments.json');

function summarize({pr, threads, comments, reviews = [], viewer, now = Date.now()}: SummaryInput) {
    const rollup = pr.statusCheckRollup ?? [];
    const failing: Array<{name: string | undefined; link: string | null}> = [];
    const pending: Array<string | undefined> = [];
    const humanGated: Array<string | undefined> = [];
    for (const check of rollup) {
        const name = check.name ?? check.context;
        const link = check.detailsUrl ?? check.targetUrl ?? null;
        const outcome = check.conclusion ?? check.state;
        if (check.status !== undefined && check.status !== 'COMPLETED') {
            pending.push(name);
        } else if (outcome === 'PENDING' || outcome === 'EXPECTED') {
            pending.push(name);
        } else if (outcome !== undefined && FAILED.has(outcome)) {
            if (name !== undefined && HUMAN_GATED.has(name)) {
                humanGated.push(name);
            } else {
                failing.push({name, link});
            }
        }
    }
    if (rollup.length === 0) {
        pending.push('checks not reported yet');
    }
    // `gh` writes a check that has not started as 0001-01-01T00:00:00Z, not null.
    const checkStarts = rollup
        .map((check) => check.startedAt)
        .filter((startedAt): startedAt is string => typeof startedAt === 'string' && Date.parse(startedAt) > 0)
        .toSorted();
    const headPushedAt = checkStarts.at(0) ?? pr.commits.at(-1)?.committedDate ?? null;
    if (headPushedAt !== null && now - Date.parse(headPushedAt) < SETTLE_MS) {
        pending.push('checks settling after push');
    }
    if (pr.mergeable === 'UNKNOWN') {
        pending.push('mergeability');
    }

    const unresolved = threads
        .filter((thread) => !thread.isResolved)
        .map((thread) => {
            const first = thread.root.nodes.at(0);
            const last = thread.latest.nodes.at(0);
            return {
                id: thread.id,
                commentId: first?.databaseId ?? null,
                author: first?.author?.login ?? null,
                lastAuthor: last?.author?.login ?? null,
                path: thread.path,
                line: thread.line,
                outdated: thread.isOutdated,
                // You replied last and left it open, so the next move is the reviewer's.
                awaitingReviewer: viewer !== undefined && last?.author?.login === viewer,
                url: first?.url ?? null,
                body: (first?.body ?? '').slice(0, PREVIEW_LENGTH),
            };
        });
    const open = unresolved.filter((thread) => !thread.awaitingReviewer);

    const unacknowledged = comments
        .filter((comment) => comment.acknowledged !== true && (viewer === undefined || comment.user?.login !== viewer))
        .map((comment) => ({
            id: comment.id,
            author: comment.user?.login ?? null,
            url: comment.html_url,
            body: comment.body.slice(0, PREVIEW_LENGTH),
        }));

    const blockers: string[] = [];
    if (pr.mergeable === 'CONFLICTING') {
        blockers.push('conflict');
    }
    if (failing.length > 0) {
        blockers.push(`failing:${failing.map((check) => check.name).join(',')}`);
    }
    if (open.length > 0) {
        blockers.push(`threads:${open.length}`);
    }
    if (unacknowledged.length > 0) {
        blockers.push(`comments:${unacknowledged.length}`);
    }

    const submitted = reviews.filter((review): review is Review & {submitted_at: string} => review.submitted_at !== null);
    const verdicts = new Map<string, Review>();
    for (const review of submitted.toSorted((a, b) => a.submitted_at.localeCompare(b.submitted_at))) {
        if (VERDICTS.has(review.state)) {
            verdicts.set(review.user?.login ?? `deleted:${review.id}`, review);
        }
    }
    const changesRequested = [...verdicts.values()]
        .filter((review) => review.state === 'CHANGES_REQUESTED')
        .map((review) => ({id: review.id, author: review.user?.login ?? null, url: review.html_url}));
    if (changesRequested.length > 0) {
        blockers.push(`changes-requested:${changesRequested.length}`);
    }
    const newReviews = submitted
        .filter((review) => headPushedAt === null || review.submitted_at > headPushedAt)
        .filter((review) => review.state === 'CHANGES_REQUESTED' || (review.body ?? '').trim() !== '')
        .map((review) => ({
            id: review.id,
            author: review.user?.login ?? null,
            state: review.state,
            url: review.html_url,
            body: (review.body ?? '').slice(0, PREVIEW_LENGTH),
        }));

    const notes: string[] = [];
    if (pr.isDraft) {
        notes.push('draft: claude-review and Codex skip drafts, so expect their findings after the PR is marked ready');
    }
    if (humanGated.length > 0) {
        notes.push(`waiting on a human: ${humanGated.join(',')}`);
    }

    // Nothing can land on a merged or closed PR, so leftover threads and comments aren't work anymore.
    const isOpen = pr.state === 'OPEN';

    return {
        verdict: verdictOf(pr.state, blockers, pending),
        blockers: isOpen ? blockers : [],
        notes,
        pr: pr.number,
        url: pr.url,
        head: pr.headRefOid,
        headPushedAt,
        base: pr.baseRefName,
        checks: {failing, pending, humanGated},
        threads: open,
        awaitingReviewer: unresolved.filter((thread) => thread.awaitingReviewer),
        comments: unacknowledged,
        reviews: newReviews,
        changesRequested,
    };
}

function verdictOf(state: string, blockers: string[], pending: unknown[]): Verdict {
    if (state !== 'OPEN') {
        return 'CLOSED';
    }
    if (blockers.length > 0) {
        return 'ACTION';
    }
    if (pending.length > 0) {
        return 'WAITING';
    }
    return 'READY';
}

function gh(args: string[]): string {
    return execFileSync('gh', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
}

function ghJson<T>(args: string[]): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the caller names the shape it requested from GitHub; a wrong shape surfaces as an undefined field in a developer-run script.
    return JSON.parse(gh(args)) as T;
}

function ghPages<T>(path: string): T[] {
    return ghJson<T[][]>(['api', '--paginate', '--slurp', path]).flat();
}

function readMarkers(): ReadMarkers {
    if (!existsSync(READ_MARKERS_FILE)) {
        return {};
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- this script is the only writer of the file.
    return JSON.parse(readFileSync(READ_MARKERS_FILE, 'utf8')) as ReadMarkers;
}

function writeMarkers(markers: ReadMarkers) {
    mkdirSync(dirname(READ_MARKERS_FILE), {recursive: true});
    writeFileSync(READ_MARKERS_FILE, `${JSON.stringify(markers, null, 2)}\n`);
}

// --author because forks often reuse branch names.
function resolvePrNumber(selector: string | null, repo: string): number {
    if (selector !== null) {
        return Number(selector);
    }
    const branch = execFileSync('git', ['branch', '--show-current'], {encoding: 'utf8'}).trim();
    const found = ghJson<Array<{number: number}>>(['pr', 'list', '--repo', repo, '--head', branch, '--author', '@me', '--state', 'all', '--json', 'number', '--limit', '1']);
    const number = found.at(0)?.number;
    if (number === undefined) {
        throw new Error(`no PR of yours in ${repo} for branch "${branch}", pass the PR number`);
    }
    return number;
}

function fetchStatus(repo: string, number: number) {
    const pr = ghJson<PullRequest>(['pr', 'view', String(number), '--repo', repo, '--json', 'number,url,state,headRefOid,baseRefName,isDraft,mergeable,commits,statusCheckRollup']);
    const [owner, name] = repo.split('/');
    const query = `query($owner:String!,$name:String!,$number:Int!,$after:String){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100,after:$after){pageInfo{hasNextPage endCursor} nodes{id isResolved isOutdated path line root:comments(first:1){nodes{databaseId author{login} body url}} latest:comments(last:1){nodes{author{login} body url}}}}}}}`;
    const threads: Thread[] = [];
    let after: string | null = null;
    do {
        const response: {data: {repository: {pullRequest: {reviewThreads: ThreadPage}}}} = ghJson([
            'api',
            'graphql',
            '-f',
            `query=${query}`,
            '-F',
            `owner=${owner}`,
            '-F',
            `name=${name}`,
            '-F',
            `number=${number}`,
            ...(after === null ? [] : ['-f', `after=${after}`]),
        ]);
        const page = response.data.repository.pullRequest.reviewThreads;
        threads.push(...page.nodes);
        after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    } while (after !== null);
    const viewer = ghJson<{login: string}>(['api', 'user']).login;
    const read = new Set(readMarkers()[`${repo}#${number}`] ?? []);
    const comments = ghPages<IssueComment>(`repos/${repo}/issues/${number}/comments?per_page=100`).map((comment) => ({...comment, acknowledged: read.has(comment.id)}));
    const reviews = ghPages<Review>(`repos/${repo}/pulls/${number}/reviews?per_page=100`);
    return summarize({pr, threads, comments, reviews, viewer});
}

function seconds(flag: string, value: string | undefined): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${flag} needs a positive number of seconds`);
    }
    return parsed;
}

function parseArgs(argv: string[]) {
    const options = {selector: null as string | null, repo: DEFAULT_REPO, watch: false, interval: 60, timeout: 1800, ack: [] as number[], ackAll: false};
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv.at(index) ?? '';
        if (arg === '--watch') {
            options.watch = true;
        } else if (arg === '--interval') {
            index += 1;
            options.interval = seconds(arg, argv.at(index));
        } else if (arg === '--timeout') {
            index += 1;
            options.timeout = seconds(arg, argv.at(index));
        } else if (arg === '--repo') {
            index += 1;
            options.repo = argv.at(index) ?? '';
        } else if (arg === '--ack-all') {
            options.ackAll = true;
        } else if (arg === '--ack') {
            while (/^\d+$/.test(argv.at(index + 1) ?? '')) {
                index += 1;
                options.ack.push(Number(argv.at(index)));
            }
        } else if (!arg.startsWith('--') && options.selector === null) {
            options.selector = arg;
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    // A PR URL carries its own repo, so `/babysit <url>` works for forks too.
    const fromUrl = options.selector?.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
    if (fromUrl) {
        options.repo = fromUrl.at(1) ?? options.repo;
        options.selector = fromUrl.at(2) ?? null;
    }
    if (!/^[^/]+\/[^/]+$/.test(options.repo)) {
        throw new Error('--repo needs owner/name');
    }
    return options;
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    const number = resolvePrNumber(options.selector, options.repo);

    if (options.ackAll || options.ack.length > 0) {
        const ids = options.ackAll ? fetchStatus(options.repo, number).comments.map((comment) => comment.id) : options.ack;
        const key = `${options.repo}#${number}`;
        const markers = readMarkers();
        markers[key] = [...new Set([...(markers[key] ?? []), ...ids])];
        writeMarkers(markers);
        console.log(JSON.stringify({pr: number, acknowledged: ids}, null, 2));
        return;
    }

    const deadline = Date.now() + options.timeout * 1000;
    let status = fetchStatus(options.repo, number);
    while (options.watch && status.verdict === 'WAITING' && Date.now() < deadline) {
        await delay(options.interval * 1000);
        status = fetchStatus(options.repo, number);
    }
    console.log(JSON.stringify(status, null, 2));
}

if (import.meta.main) {
    await main();
}

export default summarize;
