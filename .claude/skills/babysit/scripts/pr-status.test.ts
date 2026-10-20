/* eslint-disable @typescript-eslint/naming-convention -- fixtures mirror GitHub's snake_case REST fields */
import {describe, expect, test} from 'bun:test';

import summarize from './pr-status';

type Input = Parameters<typeof summarize>[0];

const pushedAt = '2026-09-28T10:00:00Z';
const later = Date.parse('2026-09-28T11:00:00Z');

function pr(overrides: Partial<Input['pr']> = {}): Input['pr'] {
    return {
        number: 7,
        url: 'https://github.com/Expensify/App/pull/7',
        state: 'OPEN',
        headRefOid: 'abc123',
        baseRefName: 'main',
        isDraft: false,
        mergeable: 'MERGEABLE',
        commits: [{committedDate: '2026-09-28T09:00:00Z'}, {committedDate: pushedAt}],
        statusCheckRollup: [
            {name: 'typecheck', status: 'COMPLETED', conclusion: 'SUCCESS'},
            {name: 'review', status: 'COMPLETED', conclusion: 'SKIPPED'},
            {context: 'codecov/patch', state: 'SUCCESS'},
        ],
        ...overrides,
    };
}

function thread(isResolved: boolean, author = 'github-actions', replier?: string): Input['threads'][number] {
    const first = {databaseId: 11, author: {login: author}, body: 'finding', url: 'u'};
    return {
        id: `thread-${author}-${isResolved}`,
        isResolved,
        isOutdated: false,
        path: 'src/libs/ReportUtils.ts',
        line: 4,
        root: {nodes: [first]},
        latest: {nodes: [replier === undefined ? first : {author: {login: replier}, body: 'reply', url: 'u'}]},
    };
}

function comment(id: number, login: string, body = 'review', acknowledged = false): Input['comments'][number] {
    return {id, user: {login}, created_at: pushedAt, html_url: 'u', body, acknowledged};
}

function review(login: string, state: string, body: string | null, submittedAt: string | null): NonNullable<Input['reviews']>[number] {
    return {id: 3, user: {login}, state, body, html_url: 'u', submitted_at: submittedAt};
}

describe('summarize', () => {
    test('green checks, no threads, and a mergeable PR are READY', () => {
        // Given a PR whose only thread is resolved and whose checks passed or were skipped
        const status = summarize({now: later, pr: pr(), threads: [thread(true)], comments: []});

        // Then nothing is left for an agent, so the PR can go to a human
        expect(status.verdict).toBe('READY');
        expect(status.blockers).toEqual([]);
    });

    test('a running check or unknown mergeability is WAITING', () => {
        // Given a check still running, a legacy status still pending, and GitHub not done computing mergeability
        const running = pr({statusCheckRollup: [{name: 'test (job 1)', status: 'IN_PROGRESS'}]});
        const legacy = pr({statusCheckRollup: [{context: 'codecov/patch', state: 'PENDING'}]});

        // Then each one waits, because a green verdict on unfinished data would hand the human a red PR
        expect(summarize({now: later, pr: running, threads: [], comments: []}).verdict).toBe('WAITING');
        expect(summarize({now: later, pr: legacy, threads: [], comments: []}).checks.pending).toEqual(['codecov/patch']);
        expect(summarize({now: later, pr: pr({mergeable: 'UNKNOWN'}), threads: [], comments: []}).verdict).toBe('WAITING');
    });

    test('conflicts, failures, and unresolved threads are ACTION even while checks run', () => {
        // Given a conflicting PR with one failed check, one queued check, and one open thread
        const status = summarize({
            now: later,
            pr: pr({
                mergeable: 'CONFLICTING',
                statusCheckRollup: [
                    {name: 'ESLint check', status: 'COMPLETED', conclusion: 'FAILURE'},
                    {name: 'test (job 1)', status: 'QUEUED'},
                ],
            }),
            threads: [thread(false), thread(true, 'MelvinBot')],
            comments: [],
        });

        // Then the agent has work now, so it doesn't wait for the queued check to finish first
        expect(status.verdict).toBe('ACTION');
        expect(status.blockers).toEqual(['conflict', 'failing:ESLint check', 'threads:1']);
        expect(status.threads.at(0)?.author).toBe('github-actions');
    });

    test('unread comments block whenever they were posted, except your own', () => {
        // Given an unread bot comment, one already marked read, and one you wrote
        const status = summarize({
            now: later,
            pr: pr(),
            threads: [],
            comments: [comment(1, 'MelvinBot'), comment(2, 'OSBotify', 'translations', true), comment(3, 'owner', 'my reply')],
            viewer: 'owner',
        });

        // Then only the unread bot comment needs reading, since you post your own replies yourself
        expect(status.comments.map((entry) => entry.id)).toEqual([1]);
        expect(status.blockers).toEqual(['comments:1']);
    });

    test('a merged PR is CLOSED', () => {
        // Given a merged PR
        const status = summarize({now: later, pr: pr({state: 'MERGED'}), threads: [thread(false)], comments: []});

        // Then the loop stops with no blockers listed, because nothing more can land on it
        expect(status.verdict).toBe('CLOSED');
        expect(status.blockers).toEqual([]);
    });

    test('a thread you replied to last waits for the reviewer instead of blocking', () => {
        // Given an open thread where your reply is the newest comment
        const status = summarize({now: later, pr: pr(), threads: [thread(false, 'github-actions', 'owner')], comments: [], viewer: 'owner'});

        // Then it's listed for the handoff but doesn't block, because the next move is the reviewer's
        expect(status.verdict).toBe('READY');
        expect(status.threads).toHaveLength(0);
        expect(status.awaitingReviewer).toHaveLength(1);
    });

    test('a reply by someone else does not hand the thread back to the reviewer', () => {
        // Given an open thread where another reviewer replied last
        const status = summarize({now: later, pr: pr(), threads: [thread(false, 'github-actions', 'MelvinBot')], comments: [], viewer: 'owner'});

        // Then it still needs you
        expect(status.verdict).toBe('ACTION');
        expect(status.awaitingReviewer).toHaveLength(0);
    });

    test('no checks yet, or a push under two minutes old, is WAITING', () => {
        // Given a PR with no checks reported, and a PR pushed 30 seconds ago
        const noChecks = summarize({now: later, pr: pr({statusCheckRollup: []}), threads: [], comments: []});
        const justPushed = summarize({now: Date.parse(pushedAt) + 30_000, pr: pr(), threads: [], comments: []});

        // Then both wait, because GitHub registers checks a moment after the push
        expect(noChecks.verdict).toBe('WAITING');
        expect(justPushed.verdict).toBe('WAITING');
    });

    test('every failed conclusion blocks the PR', () => {
        // Given each way GitHub reports a failed check run, and a legacy status that errored
        for (const conclusion of ['FAILURE', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE', 'STALE']) {
            const status = summarize({now: later, pr: pr({statusCheckRollup: [{name: 'ci', status: 'COMPLETED', conclusion}]}), threads: [], comments: []});

            // Then each one is a failure the agent has to read
            expect(status.blockers).toEqual(['failing:ci']);
        }
        const errored = summarize({now: later, pr: pr({statusCheckRollup: [{context: 'deploy', state: 'ERROR'}]}), threads: [], comments: []});
        expect(errored.blockers).toEqual(['failing:deploy']);
    });

    test('a draft and checks only a human can fix are notes, not blockers', () => {
        // Given a draft whose author checklist and independent approval checks fail
        const status = summarize({
            now: later,
            pr: pr({
                isDraft: true,
                statusCheckRollup: [
                    {name: 'checklist', status: 'COMPLETED', conclusion: 'FAILURE'},
                    {name: 'Check independent approval', status: 'COMPLETED', conclusion: 'FAILURE'},
                ],
            }),
            threads: [],
            comments: [],
        });

        // Then neither blocks, so --watch keeps waiting for the real CI instead of exiting on work only the human can do
        expect(status.verdict).toBe('READY');
        expect(status.checks.humanGated).toEqual(['checklist', 'Check independent approval']);
        expect(status.notes).toHaveLength(2);
    });

    test('the head push time is the first check start, not the commit date', () => {
        // Given a check that started at 10:30, after a commit dated 10:00
        const started = {name: 'ci', status: 'COMPLETED', conclusion: 'SUCCESS', startedAt: '2026-09-28T10:30:00Z'};
        const status = summarize({now: Date.parse('2026-09-28T10:31:00Z'), pr: pr({statusCheckRollup: [started]}), threads: [], comments: []});

        // Then the push is dated by the check, because a commit can be pushed long after it was made
        expect(status.headPushedAt).toBe('2026-09-28T10:30:00Z');
        expect(status.verdict).toBe('WAITING');
    });

    test('a queued check, which gh dates to year 1, is not the push time', () => {
        // Given a queued check that gh reports as starting at 0001-01-01
        const queued = {name: 'test (job 1)', status: 'QUEUED', conclusion: '', startedAt: '0001-01-01T00:00:00Z'};
        const started = {name: 'ci', status: 'COMPLETED', conclusion: 'SUCCESS', startedAt: '2026-09-28T10:30:00Z'};
        const status = summarize({now: later, pr: pr({statusCheckRollup: [queued, started]}), threads: [], comments: []});

        // Then the placeholder date is ignored
        expect(status.headPushedAt).toBe('2026-09-28T10:30:00Z');
        expect(status.checks.pending).toEqual(['test (job 1)']);
    });

    test("review summaries since the push are listed, and a reviewer's standing change request blocks", () => {
        // Given reviewers whose latest verdicts differ, before and after the push
        const before = '2026-09-28T09:00:00Z';
        const after = '2026-09-28T10:20:00Z';
        const status = summarize({
            now: later,
            pr: pr(),
            threads: [],
            comments: [],
            reviews: [
                review('alice', 'CHANGES_REQUESTED', 'please split this', before),
                review('bob', 'APPROVED', '', after),
                review('bob', 'CHANGES_REQUESTED', 'rename it', before),
                review('carol', 'CHANGES_REQUESTED', 'missing tests', before),
                review('carol', 'COMMENTED', 'found 2 issues', after),
                review('dave', 'DISMISSED', 'wrong file', before),
                review('erin', 'APPROVED', null, after),
                review('owner', 'PENDING', 'draft', null),
            ],
        });

        // Then a later approval or dismissal clears a change request and a comment review doesn't, as in GitHub's review decision
        expect(status.blockers).toEqual(['changes-requested:2']);
        expect(status.changesRequested.map((entry) => entry.author)).toEqual(['alice', 'carol']);
        expect(status.reviews.map((entry) => entry.author)).toEqual(['carol']);
    });

    test('a comment or review by a deleted account still counts', () => {
        // Given a comment and two change requests whose authors deleted their accounts
        const status = summarize({
            now: later,
            pr: pr(),
            threads: [],
            comments: [{id: 2, user: null, created_at: pushedAt, html_url: 'u', body: 'orphaned'}],
            reviews: [
                {id: 4, user: null, state: 'CHANGES_REQUESTED', body: 'x', html_url: 'u', submitted_at: pushedAt},
                {id: 5, user: null, state: 'CHANGES_REQUESTED', body: 'y', html_url: 'u', submitted_at: pushedAt},
            ],
            viewer: 'owner',
        });

        // Then they still block, and the two deleted reviewers aren't merged into one
        expect(status.blockers).toEqual(['comments:1', 'changes-requested:2']);
    });
});
