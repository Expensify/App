#!/usr/bin/env node
/**
 * Prints one JSON snapshot of what still stands between an Expensify/App PR and human review:
 * merge conflicts, failing and pending checks, open review threads, unread comments, and
 * standing change requests.
 *
 * Usage:
 *   node pr-status.mjs [pr] [--repo owner/name] [--watch] [--interval <s>] [--timeout <s>]
 *   node pr-status.mjs [pr] --ack <commentId>...   mark issue comments as read
 *   node pr-status.mjs [pr] --ack-all              mark every unread issue comment as read
 *
 * Without a PR number it finds your PR for the current branch. Read markers live in a local
 * file, not in 👍 reactions, so reading a bot comment leaves nothing on the upstream PR.
 */

import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname, join} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';

const FAILED_OUTCOMES = new Set(['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'STALE']);

// These checks turn green only when a human reviewer acts, so an agent can't fix them.
const HUMAN_GATED_CHECKS = new Set(['Check independent approval']);

// A review in one of these states replaces the reviewer's earlier verdict. A COMMENTED review leaves it standing.
const VERDICT_STATES = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);

// GitHub exposes no push time, and checks take a moment to register after a push.
const SETTLE_MS = 2 * 60 * 1000;

const PREVIEW_LENGTH = 600;

const DEFAULT_REPO = 'Expensify/App';

const READ_COMMENTS_FILE = join(process.env.XDG_STATE_HOME ?? join(homedir(), '.local', 'state'), 'pr-status', 'read-comments.json');

function preview(body) {
    return (body ?? '').slice(0, PREVIEW_LENGTH);
}

/** Reduces raw GitHub data to a verdict plus everything that still needs someone. */
function buildStatus({pr, threads, comments, reviews, viewer, readCommentIDs, now}) {
    const rollup = pr.statusCheckRollup ?? [];
    const failing = [];
    const pending = [];
    const humanGated = [];
    for (const check of rollup) {
        const name = check.name ?? check.context ?? 'unnamed check';
        const outcome = check.conclusion ?? check.state;
        const isRunning = check.status !== undefined && check.status !== 'COMPLETED';
        if (isRunning || outcome === 'PENDING' || outcome === 'EXPECTED') {
            pending.push(name);
        } else if (outcome !== undefined && FAILED_OUTCOMES.has(outcome)) {
            if (HUMAN_GATED_CHECKS.has(name)) {
                humanGated.push(name);
            } else {
                failing.push({name, url: check.detailsUrl ?? check.targetUrl ?? null});
            }
        }
    }

    const lastCommitAt = pr.commits.at(-1)?.committedDate ?? null;
    const waiting = [];
    if (pending.length > 0) {
        waiting.push('checks pending');
    }
    if (rollup.length === 0) {
        waiting.push('checks not reported yet');
    }
    if (lastCommitAt !== null && now - Date.parse(lastCommitAt) < SETTLE_MS) {
        waiting.push('checks settling after push');
    }
    if (pr.mergeable === 'UNKNOWN') {
        waiting.push('mergeability');
    }

    const openThreads = threads
        .filter((thread) => !thread.isResolved)
        .map((thread) => {
            const first = thread.first.nodes.at(0);
            const last = thread.last.nodes.at(0);
            return {
                id: thread.id,
                commentId: first?.databaseId ?? null,
                author: first?.author?.login ?? null,
                path: thread.path,
                line: thread.line,
                outdated: thread.isOutdated,
                url: first?.url ?? null,
                body: preview(first?.body),
                // You replied last and left it open, so the next move is the reviewer's.
                awaitingReviewer: last?.author?.login === viewer,
            };
        });
    const threadsToHandle = openThreads.filter((thread) => !thread.awaitingReviewer);

    const unreadComments = comments
        .filter((comment) => comment.user?.login !== viewer && !readCommentIDs.has(comment.id))
        .map((comment) => ({id: comment.id, author: comment.user?.login ?? null, url: comment.html_url, body: preview(comment.body)}));

    const submitted = reviews.filter((review) => review.submitted_at !== null && review.user?.login !== viewer).toSorted((a, b) => a.submitted_at.localeCompare(b.submitted_at));
    const latestVerdicts = new Map();
    for (const review of submitted) {
        if (VERDICT_STATES.has(review.state)) {
            latestVerdicts.set(review.user?.login ?? `deleted:${review.id}`, review);
        }
    }
    const changesRequested = [...latestVerdicts.values()]
        .filter((review) => review.state === 'CHANGES_REQUESTED')
        .map((review) => ({id: review.id, author: review.user?.login ?? null, url: review.html_url}));
    const newReviews = submitted
        .filter((review) => lastCommitAt === null || review.submitted_at > lastCommitAt)
        .filter((review) => (review.body ?? '').trim() !== '')
        .map((review) => ({id: review.id, author: review.user?.login ?? null, state: review.state, url: review.html_url, body: preview(review.body)}));

    const blockers = [];
    if (pr.mergeable === 'CONFLICTING') {
        blockers.push('conflict');
    }
    if (failing.length > 0) {
        blockers.push(`failing:${failing.map((check) => check.name).join(',')}`);
    }
    if (threadsToHandle.length > 0) {
        blockers.push(`threads:${threadsToHandle.length}`);
    }
    if (unreadComments.length > 0) {
        blockers.push(`comments:${unreadComments.length}`);
    }
    if (changesRequested.length > 0) {
        blockers.push(`changes-requested:${changesRequested.length}`);
    }

    const notes = [];
    if (pr.isDraft) {
        notes.push('draft: claude-review has not run yet, it starts when the PR is marked ready');
    }
    if (humanGated.length > 0) {
        notes.push(`waiting on a human reviewer: ${humanGated.join(',')}`);
    }

    let verdict = 'READY';
    if (pr.state !== 'OPEN') {
        verdict = 'CLOSED';
    } else if (blockers.length > 0) {
        verdict = 'ACTION';
    } else if (waiting.length > 0) {
        verdict = 'WAITING';
    }

    return {
        verdict,
        blockers,
        waiting,
        notes,
        pr: pr.number,
        url: pr.url,
        head: pr.headRefOid,
        base: pr.baseRefName,
        draft: pr.isDraft,
        checks: {failing, pending, humanGated},
        threads: threadsToHandle,
        awaitingReviewer: openThreads.filter((thread) => thread.awaitingReviewer).map((thread) => ({id: thread.id, author: thread.author, url: thread.url})),
        comments: unreadComments,
        reviews: newReviews,
        changesRequested,
    };
}

function gh(args) {
    return execFileSync('gh', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
}

function ghJson(args) {
    return JSON.parse(gh(args));
}

function ghAllPages(path) {
    return ghJson(['api', '--paginate', '--slurp', path]).flat();
}

function resolvePrNumber(selector, repo) {
    if (selector !== null) {
        return Number(selector);
    }
    const branch = execFileSync('git', ['branch', '--show-current'], {encoding: 'utf8'}).trim();
    // --author narrows it to your PR, because forks often reuse branch names.
    const found = ghJson(['pr', 'list', '--repo', repo, '--head', branch, '--author', '@me', '--state', 'all', '--json', 'number', '--limit', '1']);
    const number = found.at(0)?.number;
    if (number === undefined) {
        throw new Error(`no PR of yours in ${repo} for branch "${branch}", pass the PR number`);
    }
    return number;
}

const THREADS_QUERY = `query($owner:String!,$name:String!,$number:Int!,$after:String){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100,after:$after){pageInfo{hasNextPage endCursor} nodes{id isResolved isOutdated path line first:comments(first:1){nodes{databaseId author{login} body url}} last:comments(last:1){nodes{databaseId author{login} body url}}}}}}}`;

function fetchThreads(repo, number) {
    const [owner, name] = repo.split('/');
    const threads = [];
    let after = null;
    do {
        const response = ghJson([
            'api',
            'graphql',
            '-f',
            `query=${THREADS_QUERY}`,
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
    return threads;
}

function readReadComments() {
    try {
        return JSON.parse(readFileSync(READ_COMMENTS_FILE, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

function writeReadComments(store) {
    mkdirSync(dirname(READ_COMMENTS_FILE), {recursive: true});
    writeFileSync(READ_COMMENTS_FILE, `${JSON.stringify(store, null, 2)}\n`);
}

function fetchStatus(repo, number) {
    const pr = ghJson(['pr', 'view', String(number), '--repo', repo, '--json', 'number,url,state,isDraft,mergeable,headRefOid,baseRefName,commits,statusCheckRollup']);
    return buildStatus({
        pr,
        threads: fetchThreads(repo, number),
        comments: ghAllPages(`repos/${repo}/issues/${number}/comments?per_page=100`),
        reviews: ghAllPages(`repos/${repo}/pulls/${number}/reviews?per_page=100`),
        viewer: ghJson(['api', 'user']).login,
        readCommentIDs: new Set(readReadComments()[`${repo}#${number}`] ?? []),
        now: Date.now(),
    });
}

function positiveSeconds(flag, value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${flag} needs a positive number of seconds`);
    }
    return parsed;
}

function parseArgs(argv) {
    const options = {selector: null, repo: DEFAULT_REPO, watch: false, interval: 60, timeout: 1800, ack: [], ackAll: false};
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index] ?? '';
        if (arg === '--watch') {
            options.watch = true;
        } else if (arg === '--interval') {
            options.interval = positiveSeconds(arg, argv[++index]);
        } else if (arg === '--timeout') {
            options.timeout = positiveSeconds(arg, argv[++index]);
        } else if (arg === '--repo') {
            options.repo = argv[++index] ?? '';
        } else if (arg === '--ack-all') {
            options.ackAll = true;
        } else if (arg === '--ack') {
            while (/^\d+$/.test(argv[index + 1] ?? '')) {
                options.ack.push(Number(argv[++index]));
            }
        } else if (!arg.startsWith('--') && options.selector === null) {
            options.selector = arg;
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    if (!/^[^/]+\/[^/]+$/.test(options.repo)) {
        throw new Error('--repo needs owner/name');
    }
    return options;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const number = resolvePrNumber(options.selector, options.repo);

    if (options.ackAll || options.ack.length > 0) {
        const ids = options.ackAll ? fetchStatus(options.repo, number).comments.map((comment) => comment.id) : options.ack;
        const key = `${options.repo}#${number}`;
        const store = readReadComments();
        store[key] = [...new Set([...(store[key] ?? []), ...ids])];
        writeReadComments(store);
        console.log(JSON.stringify({pr: number, acknowledged: ids}, null, 2));
        return;
    }

    const deadline = Date.now() + options.timeout * 1000;
    let status = fetchStatus(options.repo, number);
    while (options.watch && status.verdict === 'WAITING' && Date.now() < deadline) {
        // eslint-disable-next-line no-await-in-loop -- polling: each snapshot has to wait out the interval before the next one
        await sleep(options.interval * 1000);
        status = fetchStatus(options.repo, number);
    }
    console.log(JSON.stringify(status, null, 2));
}

export default buildStatus;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await main();
}
