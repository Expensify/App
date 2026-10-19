import assert from 'node:assert/strict';
import {test} from 'node:test';

import buildStatus from './pr-status.mjs';

const NOW = Date.parse('2026-10-19T12:00:00Z');
const LAST_COMMIT = '2026-10-19T11:00:00Z';

function input(overrides = {}, prOverrides = {}) {
    return {
        pr: {
            number: 1,
            url: 'https://github.com/Expensify/App/pull/1',
            state: 'OPEN',
            isDraft: false,
            mergeable: 'MERGEABLE',
            headRefOid: 'abc',
            baseRefName: 'main',
            commits: [{committedDate: LAST_COMMIT}],
            statusCheckRollup: [{name: 'typecheck', status: 'COMPLETED', conclusion: 'SUCCESS'}],
            ...prOverrides,
        },
        threads: [],
        comments: [],
        reviews: [],
        viewer: 'me',
        readCommentIDs: new Set(),
        now: NOW,
        ...overrides,
    };
}

function thread(id, firstAuthor, lastAuthor, isResolved = false) {
    return {
        id,
        isResolved,
        isOutdated: false,
        path: 'src/a.ts',
        line: 1,
        first: {nodes: [{databaseId: 10, author: {login: firstAuthor}, body: 'finding', url: 'u'}]},
        last: {nodes: [{databaseId: 11, author: {login: lastAuthor}, body: 'reply', url: 'u'}]},
    };
}

function review(id, login, state, submittedAt, body = '') {
    return {id, user: {login}, state, body, html_url: 'u', submitted_at: submittedAt};
}

test('a green PR with nothing open is READY', () => {
    // Given an open PR whose only check passed and that has no review activity
    // When the status is built
    const status = buildStatus(input());
    // Then nothing is left for an agent, so the PR can go to a human
    assert.equal(status.verdict, 'READY');
    assert.deepEqual(status.blockers, []);
});

test('a failing check is ACTION, a human-gated check is only a note', () => {
    // Given one check the agent can fix and one that turns green only after human approval
    const status = buildStatus(
        input(
            {},
            {
                statusCheckRollup: [
                    {name: 'ESLint check', status: 'COMPLETED', conclusion: 'FAILURE', detailsUrl: 'lint-url'},
                    {name: 'Check independent approval', status: 'COMPLETED', conclusion: 'FAILURE'},
                ],
            },
        ),
    );
    // Then only the fixable check blocks, so the loop doesn't chase approvals it can't produce
    assert.equal(status.verdict, 'ACTION');
    assert.deepEqual(status.checks.failing, [{name: 'ESLint check', url: 'lint-url'}]);
    assert.deepEqual(status.checks.humanGated, ['Check independent approval']);
    assert.ok(status.notes.some((note) => note.includes('Check independent approval')));
});

test('running checks and a missing rollup are WAITING', () => {
    // Given a check still in progress, and separately a PR with no checks reported
    const running = buildStatus(input({}, {statusCheckRollup: [{name: 'test (job 1)', status: 'IN_PROGRESS', conclusion: null}]}));
    const empty = buildStatus(input({}, {statusCheckRollup: []}));
    // Then both wait instead of reporting READY on incomplete data
    assert.equal(running.verdict, 'WAITING');
    assert.deepEqual(running.checks.pending, ['test (job 1)']);
    assert.equal(empty.verdict, 'WAITING');
    assert.ok(empty.waiting.includes('checks not reported yet'));
});

test('a commit pushed seconds ago is WAITING even when old checks are green', () => {
    // Given a head commit from 30 seconds ago, before its checks register
    const status = buildStatus(input({}, {commits: [{committedDate: new Date(NOW - 30_000).toISOString()}]}));
    // Then the green rollup is not trusted yet
    assert.equal(status.verdict, 'WAITING');
    assert.ok(status.waiting.includes('checks settling after push'));
});

test('a draft PR is not blocked, but the missing claude-review is noted', () => {
    // Given a draft PR, which is how we open PRs, and claude-review skips drafts
    const status = buildStatus(input({}, {isDraft: true}));
    // Then draft alone does not block, and the note explains why no bot review exists yet
    assert.equal(status.verdict, 'READY');
    assert.ok(status.notes.some((note) => note.startsWith('draft')));
});

test('a merge conflict is ACTION and unknown mergeability is WAITING', () => {
    // Given one PR GitHub reports as conflicting and one it has not computed yet
    const conflict = buildStatus(input({}, {mergeable: 'CONFLICTING'}));
    const unknown = buildStatus(input({}, {mergeable: 'UNKNOWN'}));
    // Then the conflict needs a merge of main, and the unknown one needs another poll
    assert.equal(conflict.verdict, 'ACTION');
    assert.deepEqual(conflict.blockers, ['conflict']);
    assert.equal(unknown.verdict, 'WAITING');
});

test('a thread you replied to last waits for the reviewer instead of blocking', () => {
    // Given an unanswered thread, a thread you answered, and a resolved thread
    const status = buildStatus(input({threads: [thread('t1', 'bot', 'bot'), thread('t2', 'bot', 'me'), thread('t3', 'bot', 'bot', true)]}));
    // Then only the unanswered one is work, and the resolved one disappears
    assert.deepEqual(
        status.threads.map((item) => item.id),
        ['t1'],
    );
    assert.deepEqual(
        status.awaitingReviewer.map((item) => item.id),
        ['t2'],
    );
    assert.deepEqual(status.blockers, ['threads:1']);
});

test('read and own comments are not listed as unread', () => {
    // Given a comment you marked read, your own comment, and a new bot comment
    const comments = [
        {id: 1, user: {login: 'OSBotify'}, body: 'translations', html_url: 'u', created_at: LAST_COMMIT},
        {id: 2, user: {login: 'me'}, body: 'mine', html_url: 'u', created_at: LAST_COMMIT},
        {id: 3, user: {login: 'MelvinBot'}, body: 'review', html_url: 'u', created_at: LAST_COMMIT},
    ];
    const status = buildStatus(input({comments, readCommentIDs: new Set([1])}));
    // Then only the new bot comment needs reading
    assert.deepEqual(
        status.comments.map((comment) => comment.id),
        [3],
    );
});

test('a later approval clears a change request, a later comment review does not', () => {
    // Given one reviewer who requested changes then approved, and one who requested changes then only commented
    const reviews = [
        review(1, 'alice', 'CHANGES_REQUESTED', '2026-10-19T09:00:00Z'),
        review(2, 'alice', 'APPROVED', '2026-10-19T10:00:00Z'),
        review(3, 'bob', 'CHANGES_REQUESTED', '2026-10-19T09:00:00Z'),
        review(4, 'bob', 'COMMENTED', '2026-10-19T10:00:00Z', 'one more thing'),
    ];
    const status = buildStatus(input({reviews}));
    // Then only bob's request still stands, matching how GitHub computes the review decision
    assert.deepEqual(
        status.changesRequested.map((item) => item.author),
        ['bob'],
    );
});

test('review summaries from before the last commit are not listed again', () => {
    // Given one review body posted before the latest push and one after it
    const reviews = [review(1, 'carol', 'COMMENTED', '2026-10-19T10:00:00Z', 'old'), review(2, 'carol', 'COMMENTED', '2026-10-19T11:30:00Z', 'new')];
    const status = buildStatus(input({reviews}));
    // Then only the review written against the current head is shown
    assert.deepEqual(
        status.reviews.map((item) => item.id),
        [2],
    );
});

test('a merged PR is CLOSED whatever else is open', () => {
    // Given a merged PR that still has an unanswered thread
    const status = buildStatus(input({threads: [thread('t1', 'bot', 'bot')]}, {state: 'MERGED'}));
    // Then the loop stops, because nothing more can land on it
    assert.equal(status.verdict, 'CLOSED');
});
