#!/usr/bin/env bun

import isBotUser from '@github/libs/isBotUser';
import isProposal from '@github/libs/isProposal';

/**
 * Harvests real ProposalPolice cases out of Expensify/App into candidate fixtures for the offline
 * evals in `evals/proposalPolice`.
 *
 * Run it with:
 *
 *   bun ./scripts/harvestProposalPoliceEvals.ts
 *   bun ./scripts/harvestProposalPoliceEvals.ts --set=duplicateCheck --issues=40
 *   bun ./scripts/harvestProposalPoliceEvals.ts --set=commentIntent --issueNumbers=98504,78241
 *
 * It shells out to an authenticated `gh`, so no token plumbing is needed. `--issueNumbers` skips the
 * search and walks exactly the issues named, which is how a case spotted by hand gets pulled in — the
 * canonical bid-spam fixture lives on an issue that never carried the `Help Wanted` label, so no search
 * this script runs would ever have found it.
 *
 * WHERE THE ORIGINAL TEXT COMES FROM
 *
 * The text these fixtures need is not in the REST API. When ProposalPolice withdraws a duplicate it
 * *replaces* the comment body with the withdraw message, and when it flags a substantive edit it
 * *prepends* a banner to the body, so `body` on a harvested comment is the bot's text rather than the
 * contributor's.
 *
 * Both originals come back from the GraphQL `userContentEdits` connection on `IssueComment`, which was
 * verified against live data before this script was written. Despite the field name, `diff` is **not** a
 * unified diff: it is the **full comment body as of that revision**. Two more properties of the
 * connection that this script relies on, also verified against live data:
 *
 *   - Nodes come back newest-first.
 *   - The oldest node's `editedAt` equals the comment's `createdAt`, i.e. GitHub records the body the
 *     comment was created with as the first revision. A comment that was never edited has no nodes at
 *     all, so a comment with revisions always has at least two.
 *
 * So for a comment whose revision N is the bot's withdraw message, revision N+1 holds the proposal the
 * contributor actually posted; and for a comment whose revision N carries the substantive-edit banner,
 * revision N+1 is the body the contributor edited *to* and revision N+2 the body they edited *from*.
 *
 * RE-RUNNING
 *
 * Harvesting is separate from labelling, because the expected outcome on a fixture is a hand-applied
 * judgement that a re-harvest must never clobber. This script only ever writes to
 * `evals/proposalPolice/fixtures/harvested/`, which is gitignored. The labelled fixtures the evals
 * actually read — `commentIntent.json`, `duplicateCheck.json`, `editCheck.json` — are checked in beside
 * that directory and are edited by hand. After each run the script reports which harvested candidates
 * are not yet represented in the labelled files, matched on `sourceHash`, so growing a fixture set is a
 * matter of copying a candidate across, replacing `sourceUrl` with its `sourceHash`, and filling in the
 * expected outcome.
 *
 * ANONYMIZATION
 *
 * This repository is public and the intent labels include SPAM, so a labelled fixture must never read as
 * an accusation against a named contributor. Checked-in fixtures therefore carry no `sourceUrl` and no
 * real GitHub comment IDs — the duplicate-check sets renumber theirs to small synthetic values, since
 * nothing depends on the originals beyond matching `expectedDuplicateCommentID`.
 *
 * Author logins are replaced with obviously-fictional stand-ins. Assignment is per-fixture rather than
 * global, so a login appearing in two fixtures can be `snorkmaiden` in one and `little-my` in the other.
 * What matters is that same-author and different-author relationships survive *within* a fixture, because
 * the duplicate check must never report a contributor's own earlier proposal. @-mentions inside bodies
 * are rewritten the same way, and mentions of anyone not otherwise in the fixture become `@user`, so
 * replaying a fixture can never ping a real person. Profile links, email addresses, and the login spelt
 * into a link to the author's own fork are neutralized the same way, since contributors paste all three.
 *
 * The rest of a github.com URL — repository, issue number, permalink, line range — is left intact. That
 * is the technical substance of a proposal, and blanking it would change what the model is being asked to
 * judge.
 */
import {SUBSTANTIVE_EDIT_MESSAGE_REGEX} from '@prompts/proposalPolice/messages';

import CLI from 'expensify-common/CLI';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const REPO = 'Expensify/App';
const FIXTURES_DIR = path.resolve(__dirname, '../evals/proposalPolice/fixtures');
const HARVEST_DIR = path.join(FIXTURES_DIR, 'harvested');

/** The bot's own text, matched against comment bodies to recognize the cases worth harvesting. */
const WITHDRAW_MESSAGE = '#### 🚫 Duplicated proposal withdrawn by 🤖 ProposalPolice.';
const EDIT_BANNER_PREFIX = '🚨 Edited by **proposal-police**:';

/** The notice the bot posts alongside a withdrawal, which names the proposal it considered the original. */
const DUPLICATE_NOTICE_REGEX = /Your proposal is a duplicate of an already \[existing proposal]\(https:\/\/github\.com\/Expensify\/App\/issues\/\d+#issuecomment-(\d+)\)/;

/** GitHub caps `search/issues` at 100 results per page. */
const SEARCH_PAGE_SIZE = 100;

/** GitHub caps connection page sizes at 100. */
const COMMENTS_PAGE_SIZE = 100;

/** Deep enough for the busiest proposal comments observed, which sit in the low tens of revisions. */
const EDITS_PAGE_SIZE = 50;

const COMMENTS_QUERY = `
query($owner: String!, $repo: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $repo) {
    issue(number: $number) {
      comments(first: ${COMMENTS_PAGE_SIZE}, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          databaseId
          body
          createdAt
          author { login typename: __typename }
          userContentEdits(first: ${EDITS_PAGE_SIZE}) { nodes { editedAt diff } }
        }
      }
    }
  }
}`;

type FixtureSetName = 'commentIntent' | 'duplicateCheck' | 'editCheck';

type Comment = {
    commentID: number;
    /** The body as it stands today, which for a harvested case is usually the bot's text. */
    body: string;
    /** Revision bodies, newest-first. Empty for a comment that was never edited. */
    revisions: string[];
    author: string;
    isBot: boolean;
    createdAt: string;
    sourceUrl: string;
};

type CommentIntentCandidate = {
    body: string;
    id: string;
    origin: 'harvested';
    sourceUrl: string;
};

type DuplicateCheckProposal = {
    author: string;
    body: string;
    commentID: number;
    sourceUrl: string;
};

type DuplicateCheckCandidate = {
    id: string;
    newProposal: DuplicateCheckProposal;
    origin: 'harvested';
    priorProposals: DuplicateCheckProposal[];
    /** The prior proposal ProposalPolice linked in its notice, i.e. what production decided. */
    withdrawnAgainstCommentID: number | null;
};

type EditCheckCandidate = {
    after: string;
    before: string;
    id: string;
    origin: 'harvested';
    sourceUrl: string;
};

/**
 * Runs `gh` without a shell (so a search query can't be word-split or expanded) and parses its JSON.
 */
function gh<T>(args: string[]): T {
    const result = spawnSync('gh', args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
    if (result.status !== 0) {
        throw new Error(`gh ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
    }
    const parsed: unknown = JSON.parse(result.stdout);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the caller names the shape it asked GitHub for; a bad shape surfaces as an undefined field on a developer-run script, not in production.
    return parsed as T;
}

/**
 * Obviously-fictional stand-in logins, so nobody reading a fixture mistakes one for a real contributor.
 * Assigned in order within a fixture; a fixture needing more authors than this wraps with a numeric suffix.
 */
const STAND_IN_LOGINS = ['snorkmaiden', 'hemulen', 'little-my', 'sniff', 'too-ticky', 'stinky', 'mymble', 'hodgkins', 'fillyjonk', 'whomper'];

/**
 * Rewrites author logins to stand-in logins and neutralizes every @-mention in the given bodies, so a
 * fixture carries the same author relationships as the real thread without naming anyone. The caller
 * passes the logins whose identity the fixture depends on; anyone else mentioned in the text collapses
 * to `@user`.
 */
function anonymize(logins: string[], bodies: string[]): {aliases: Map<string, string>; bodies: string[]} {
    const aliases = new Map<string, string>();
    for (const login of logins) {
        if (aliases.has(login)) {
            continue;
        }
        const index = aliases.size;
        const suffix = index >= STAND_IN_LOGINS.length ? `-${Math.floor(index / STAND_IN_LOGINS.length)}` : '';
        aliases.set(login, `${STAND_IN_LOGINS.at(index % STAND_IN_LOGINS.length)}${suffix}`);
    }

    const anonymizedBodies = bodies.map((body) => {
        let anonymized = body
            // GitHub logins are alphanumerics and hyphens, and a mention is only a mention at a word boundary.
            .replaceAll(/(^|[^\w/])@([A-Za-z\d](?:[A-Za-z\d-]*[A-Za-z\d])?)/g, (match, prefix: string, login: string) => `${prefix}@${aliases.get(login) ?? 'user'}`)
            // A github.com URL with a single path segment is a profile link, so it names someone the same way a mention does.
            .replaceAll(/https:\/\/github\.com\/([A-Za-z\d](?:[A-Za-z\d-]*[A-Za-z\d])?)(?![\w/-])/g, (match, login: string) => `https://github.com/${aliases.get(login) ?? 'user'}`)
            .replaceAll(/[\w.+-]+@[\w-]+\.[\w.]+/g, 'user@example.com');

        // Contributors routinely link a branch on their own fork, which spells their login into a URL path
        // (`github.com/<login>/App/tree/…`) or a compare ref (`compare/main...<login>:App:…`) rather than
        // into a mention. Those are exactly the logins already in the alias map, so replace them wherever
        // they appear as a whole word.
        for (const [login, alias] of aliases) {
            anonymized = anonymized.replaceAll(new RegExp(`(^|[^\\w-])${login}(?![\\w-])`, 'g'), `$1${alias}`);
        }
        return anonymized;
    });

    return {aliases, bodies: anonymizedBodies};
}

/**
 * Fetches every comment on an issue along with its revision history.
 */
function fetchComments(issueNumber: number): Comment[] {
    type CommentsPage = {
        data: {
            repository: {
                issue: {
                    comments: {
                        pageInfo: {hasNextPage: boolean; endCursor: string | null};
                        nodes: Array<{
                            databaseId: number;
                            body: string;
                            createdAt: string;
                            author: {login: string; typename: string} | null;
                            userContentEdits: {nodes: Array<{editedAt: string; diff: string | null}>};
                        } | null>;
                    };
                } | null;
            };
        };
    };

    const comments: Comment[] = [];
    let after: string | null = null;
    do {
        const args = ['api', 'graphql', '-f', `query=${COMMENTS_QUERY}`, '-f', 'owner=Expensify', '-f', 'repo=App', '-F', `number=${issueNumber}`];
        if (after) {
            args.push('-f', `after=${after}`);
        }
        const page: CommentsPage = gh<CommentsPage>(args);
        const connection = page.data.repository.issue?.comments;
        if (!connection) {
            break;
        }
        for (const node of connection.nodes) {
            // A comment whose author deleted their account comes back with a null author and is unusable
            // for a fixture, since same-author relationships can no longer be established for it.
            if (!node?.author) {
                continue;
            }
            comments.push({
                commentID: node.databaseId,
                body: node.body,
                revisions: node.userContentEdits.nodes.map((edit) => edit.diff ?? ''),
                author: node.author.login,
                isBot: isBotUser(node.author.login, node.author.typename),
                createdAt: node.createdAt,
                sourceUrl: `https://github.com/${REPO}/issues/${issueNumber}#issuecomment-${node.databaseId}`,
            });
        }
        after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
    } while (after);

    return comments;
}

/**
 * Searches issues by comment text and returns their numbers, newest first.
 */
function searchIssueNumbers(query: string, limit: number): number[] {
    type SearchPage = {items: Array<{number: number}>};

    const numbers: number[] = [];
    for (let page = 1; numbers.length < limit; page++) {
        const results = gh<SearchPage>([
            'api',
            '-X',
            'GET',
            'search/issues',
            '-f',
            `q=${query}`,
            '-f',
            'sort=created',
            '-f',
            'order=desc',
            '-F',
            `per_page=${Math.min(SEARCH_PAGE_SIZE, limit - numbers.length)}`,
            '-F',
            `page=${page}`,
        ]);
        if (results.items.length === 0) {
            break;
        }
        numbers.push(...results.items.map((item) => item.number));
    }
    return numbers.slice(0, limit);
}

/**
 * Ordinary contributor comments, which is what the intent classifier sees in production. Comments the
 * bot has touched are skipped: a withdrawn or bannered body is the bot's text, and a comment matching
 * the template never reaches the classifier because the deterministic template check catches it first.
 */
function harvestCommentIntentCandidates(comments: Comment[]): CommentIntentCandidate[] {
    const candidates: CommentIntentCandidate[] = [];
    for (const comment of comments) {
        if (comment.isBot || isProposal(comment.body) || comment.body.startsWith(WITHDRAW_MESSAGE) || comment.body.startsWith(EDIT_BANNER_PREFIX)) {
            continue;
        }
        const {bodies} = anonymize([comment.author], [comment.body]);
        candidates.push({
            body: bodies.at(0) ?? '',
            id: `commentIntent-${comment.commentID}`,
            origin: 'harvested',
            sourceUrl: comment.sourceUrl,
        });
    }
    return candidates;
}

/**
 * Withdrawn duplicates, reassembled into what the duplicate check saw: the proposal as posted, plus
 * every proposal that predates it in the same issue.
 */
function harvestDuplicateCheckCandidates(comments: Comment[]): DuplicateCheckCandidate[] {
    const candidates: DuplicateCheckCandidate[] = [];
    for (const comment of comments) {
        const withdrawnAt = comment.revisions.findIndex((revision) => revision.startsWith(WITHDRAW_MESSAGE));
        const originalBody = withdrawnAt === -1 ? undefined : comment.revisions.at(withdrawnAt + 1);
        if (!originalBody || !isProposal(originalBody)) {
            continue;
        }

        // The bot's notice names the proposal it withdrew against, which is the outcome to compare an eval
        // run to. It's posted right after the withdrawal and addresses the withdrawn proposal's author.
        const notice = comments.find((other) => other.isBot && other.createdAt > comment.createdAt && other.body.includes(`@${comment.author} `) && DUPLICATE_NOTICE_REGEX.test(other.body));
        const withdrawnAgainstCommentID = Number(DUPLICATE_NOTICE_REGEX.exec(notice?.body ?? '')?.at(1) ?? '') || null;

        // Only proposals that existed when the bot ran were candidates, and each is taken as it read then
        // rather than as it reads now, since a later withdrawal or edit would have rewritten its body.
        const priors = comments
            .filter((other) => other.commentID !== comment.commentID && other.createdAt < comment.createdAt && !other.isBot)
            .map((other) => ({...other, body: other.revisions.at(-1) ?? other.body}))
            .filter((other) => isProposal(other.body));
        if (priors.length === 0) {
            continue;
        }

        const {aliases, bodies} = anonymize([comment.author, ...priors.map((prior) => prior.author)], [originalBody, ...priors.map((prior) => prior.body)]);
        candidates.push({
            id: `duplicateCheck-${comment.commentID}`,
            newProposal: {
                author: aliases.get(comment.author) ?? '',
                body: bodies.at(0) ?? '',
                commentID: comment.commentID,
                sourceUrl: comment.sourceUrl,
            },
            origin: 'harvested',
            priorProposals: priors.map((prior, index) => ({
                author: aliases.get(prior.author) ?? '',
                body: bodies.at(index + 1) ?? '',
                commentID: prior.commentID,
                sourceUrl: prior.sourceUrl,
            })),
            withdrawnAgainstCommentID,
        });
    }
    return candidates;
}

/**
 * Real edits to proposals, as `(before, after)` pairs. Edits the bot flagged are recovered from the
 * revision either side of the banner it prepended; edits it left alone are the plain revision pairs on
 * a proposal comment it never touched.
 */
function harvestEditCheckCandidates(comments: Comment[]): EditCheckCandidate[] {
    const candidates: EditCheckCandidate[] = [];
    for (const comment of comments) {
        const bannerAt = comment.revisions.findIndex((revision) => revision.startsWith(EDIT_BANNER_PREFIX));
        const [before, after] = bannerAt === -1 ? [comment.revisions.at(1), comment.revisions.at(0)] : [comment.revisions.at(bannerAt + 2), comment.revisions.at(bannerAt + 1)];

        // An earlier run's banner survives into later revisions, and the edit check is fed the proposal
        // rather than the banner, so strip any that made it into the pair.
        const beforeBody = before?.replace(SUBSTANTIVE_EDIT_MESSAGE_REGEX, '');
        const afterBody = after?.replace(SUBSTANTIVE_EDIT_MESSAGE_REGEX, '');
        if (!beforeBody || !afterBody || beforeBody === afterBody || !isProposal(beforeBody) || !isProposal(afterBody)) {
            continue;
        }

        const {bodies} = anonymize([comment.author], [beforeBody, afterBody]);
        candidates.push({
            after: bodies.at(1) ?? '',
            before: bodies.at(0) ?? '',
            id: `editCheck-${comment.commentID}`,
            origin: 'harvested',
            sourceUrl: comment.sourceUrl,
        });
    }
    return candidates;
}

/**
 * The key a labelled fixture is matched on when reporting which candidates are new. Fixtures carry this
 * rather than the source URL, so a checked-in file can't be read as a public accusation against a named
 * contributor — this repository is public, and the intent labels include SPAM.
 */
function sourceHash(sourceUrl: string): string {
    return createHash('sha256').update(sourceUrl).digest('hex').slice(0, 12);
}

/**
 * Writes a candidate file and reports how much of it is new against the hand-labelled fixture set.
 */
function writeCandidates(set: FixtureSetName, candidates: Array<{sourceUrl?: string; newProposal?: {sourceUrl: string}}>): void {
    fs.mkdirSync(HARVEST_DIR, {recursive: true});
    fs.writeFileSync(path.join(HARVEST_DIR, `${set}.json`), `${JSON.stringify(candidates, null, 4)}\n`);

    const labelledPath = path.join(FIXTURES_DIR, `${set}.json`);
    const parsedLabelled: unknown = fs.existsSync(labelledPath) ? JSON.parse(fs.readFileSync(labelledPath, 'utf8')) : [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only sourceHash is read, and a fixture file missing it just reports the candidate as unlabelled.
    const labelled = parsedLabelled as Array<{sourceHash?: string}>;
    const labelledSourceHashes = new Set(labelled.map((fixture) => fixture.sourceHash));
    const unlabelled = candidates.filter((candidate) => !labelledSourceHashes.has(sourceHash(candidate.sourceUrl ?? candidate.newProposal?.sourceUrl ?? '')));

    console.log(`${set}: harvested ${candidates.length} candidates, ${labelled.length} already labelled in ${set}.json, ${unlabelled.length} not yet labelled.`);
    console.log(`  → ${path.relative(process.cwd(), path.join(HARVEST_DIR, `${set}.json`))}`);
}

const cli = new CLI({
    namedArgs: {
        issues: {
            description: 'How many issues to walk per fixture set',
            default: 25,
            parse: (value: string) => Number(value),
        },
        issueNumbers: {
            description: 'Comma-separated issue numbers to walk instead of searching, for pulling in a specific case by hand',
            default: '',
            supersedes: ['issues'],
        },
        set: {
            description: 'Harvest only one of: commentIntent, duplicateCheck, editCheck',
            default: 'all',
        },
    },
} as const);

const issueLimit = cli.namedArgs.issues;
const requestedSet = cli.namedArgs.set;
const explicitIssueNumbers = cli.namedArgs.issueNumbers
    .split(',')
    .filter(Boolean)
    .map((issueNumber) => Number(issueNumber));

if (requestedSet === 'all' || requestedSet === 'commentIntent') {
    // Sampled from Help Wanted issues rather than from anything the bot acted on, because the intent
    // classifier's real population is ordinary discussion: almost none of it mentions "Proposal" at all.
    //
    // Note that the comments the bot answered with a template reminder are *not* a useful second
    // population here: every one sampled so far already satisfies `isProposal`, since the reminder fires
    // on proposals that the stale dashboard prompt judged against sections the template no longer has.
    // The deterministic template check now catches all of those before the classifier ever runs.
    const issueNumbers = explicitIssueNumbers.length > 0 ? explicitIssueNumbers : searchIssueNumbers(`repo:${REPO} is:issue label:"Help Wanted"`, issueLimit);
    console.log(`commentIntent: walking ${issueNumbers.length} issues…`);
    writeCandidates(
        'commentIntent',
        issueNumbers.flatMap((issueNumber) => harvestCommentIntentCandidates(fetchComments(issueNumber))),
    );
}

if (requestedSet === 'all' || requestedSet === 'duplicateCheck') {
    const issueNumbers = explicitIssueNumbers.length > 0 ? explicitIssueNumbers : searchIssueNumbers(`repo:${REPO} "${WITHDRAW_MESSAGE.replaceAll('#### ', '')}" in:comments`, issueLimit);
    console.log(`duplicateCheck: walking ${issueNumbers.length} issues with a withdrawn duplicate…`);
    writeCandidates(
        'duplicateCheck',
        issueNumbers.flatMap((issueNumber) => harvestDuplicateCheckCandidates(fetchComments(issueNumber))),
    );
}

if (requestedSet === 'all' || requestedSet === 'editCheck') {
    const issueNumbers = explicitIssueNumbers.length > 0 ? explicitIssueNumbers : searchIssueNumbers(`repo:${REPO} "${EDIT_BANNER_PREFIX}" in:comments`, issueLimit);
    console.log(`editCheck: walking ${issueNumbers.length} issues with a flagged edit…`);
    writeCandidates(
        'editCheck',
        issueNumbers.flatMap((issueNumber) => harvestEditCheckCandidates(fetchComments(issueNumber))),
    );
}
