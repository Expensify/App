/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @jest-environment node
 */
import run, {PROPOSAL_POLICE_MODEL} from '@github/actions/javascript/proposalPoliceComment/proposalPoliceComment';
import GithubUtils from '@github/libs/GithubUtils';

import OpenAIUtils from '@scripts/utils/OpenAIUtils';
import type {ProposalComment} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

import {context} from '@actions/github';

const VALID_PROPOSAL_BODY = [
    '## Proposal',
    '',
    '### What is the root cause of that problem?',
    'Some root cause',
    '',
    '### What changes do you think we should make in order to solve the problem?',
    'Some solution',
].join('\n');

// Self-contained (creates its own jest.fn()s rather than referencing outer variables) since imports
// (including this mocked module's consumers) are hoisted above regular statements by the module system.
jest.mock('@github/libs/GithubUtils', () => ({
    __esModule: true,
    default: {
        getAllCommentDetails: jest.fn(),
        createComment: jest.fn(),
        octokit: {issues: {updateComment: jest.fn()}},
    },
}));

jest.mock('@scripts/utils/OpenAIUtils');

// Self-contained (references no outer variables) so both this file and the SUT above resolve the same
// mocked `context` singleton; tests mutate `context.payload` directly rather than re-importing per scenario.
jest.mock('@actions/github', () => ({
    context: {
        eventName: 'issue_comment',
        repo: {owner: 'Expensify', repo: 'App'},
        payload: {
            action: 'created',
            issue: {number: 1, state: 'open', labels: [{name: 'Help Wanted'}]},
            comment: {id: 1, body: '', user: {login: 'contributor', type: 'User'}, created_at: '2026-01-01T00:00:00Z', html_url: ''},
        },
    },
}));

const MockedGithubUtils = jest.mocked(GithubUtils);
const mockGetAllCommentDetails = MockedGithubUtils.getAllCommentDetails;
const mockCreateComment = MockedGithubUtils.createComment;
// `octokit` is a getter on the real class returning a huge Octokit surface; the mock replaces it with a
// plain object, so this one property access needs a cast that `jest.mocked()` can't infer through.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any
const mockUpdateComment = MockedGithubUtils.octokit.issues.updateComment as any as jest.Mock;

type CommentOverrides = Partial<{id: number; body: string; login: string; type: string; created_at: string; html_url: string}>;

function makeComment(overrides: CommentOverrides = {}): ProposalComment & {html_url: string} {
    return {
        id: overrides.id ?? 1,
        body: overrides.body ?? VALID_PROPOSAL_BODY,
        user: {login: overrides.login ?? 'contributor', type: overrides.type ?? 'User'},
        created_at: overrides.created_at ?? '2026-01-01T00:00:00Z',
        html_url: overrides.html_url ?? 'https://github.com/Expensify/App/issues/1#issuecomment-1',
    };
}

/**
 * `GithubUtils.getAllCommentDetails` really returns Octokit's full comment schema, but this suite only
 * ever reads the fields captured by `ProposalComment`, so its test fixtures omit the rest (avatar URLs,
 * node IDs, etc.) — hence the cast to bridge the narrower fixture shape to the mock's real return type.
 */
function mockComments(comments: Array<ProposalComment & {html_url: string}>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above
    mockGetAllCommentDetails.mockResolvedValue(comments as unknown as Awaited<ReturnType<typeof GithubUtils.getAllCommentDetails>>);
}

function setPayload(overrides: {action: 'created' | 'edited'; comment?: ProposalComment & {html_url: string}; changes?: {body?: {from?: string}}}) {
    context.payload = {
        action: overrides.action,
        issue: {number: 1, state: 'open', labels: [{name: 'Help Wanted'}]},
        comment: overrides.comment ?? makeComment(),
        changes: overrides.changes,
    };
}

function duplicateCheckResult(overrides: Partial<{action: string; similarity: number; duplicateCommentId: number | null}> = {}) {
    return JSON.stringify({action: 'NO_ACTION', similarity: 0, duplicateCommentId: null, ...overrides});
}

const MockedOpenAIUtils = jest.mocked(OpenAIUtils);

describe('proposalPoliceComment', () => {
    beforeEach(() => {
        // resetAllMocks (not clearAllMocks) so a leftover queued mockResolvedValueOnce from one test
        // can never leak into and corrupt the next.
        jest.resetAllMocks();
        process.env.INPUT_PROPOSAL_POLICE_API_KEY = 'test-api-key';
        mockGetAllCommentDetails.mockResolvedValue([]);
        MockedOpenAIUtils.prototype.createConversation.mockResolvedValue({id: 'conv_new', created_at: 0, metadata: null, object: 'conversation'});
        // Bypass the real JSON-schema validators here; OpenAIUtilsTest already covers parseJSONResponse itself.
        MockedOpenAIUtils.prototype.parseJSONResponse.mockImplementation((text) => JSON.parse(text));
    });

    it('skips duplicate/template checks and does nothing for a bot-authored comment', async () => {
        setPayload({action: 'created', comment: makeComment({login: 'github-actions[bot]', type: 'Bot'})});

        await run();

        expect(mockGetAllCommentDetails).not.toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).not.toHaveBeenCalled();
    });

    it('does nothing when both checks return NO_ACTION', async () => {
        // Use an already-tracked Conversation so the only comments under test are the nag/notice ones,
        // not the one-time tracking comment created alongside a brand-new Conversation.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('uses PROPOSAL_POLICE_MODEL for the duplicate-check, template-check, and edit-check calls', async () => {
        mockComments([makeComment({id: 2, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});
        await run();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(2, expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));

        jest.clearAllMocks();
        setPayload({action: 'edited', comment: makeComment({body: `${VALID_PROPOSAL_BODY}\nedited`}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_edit'});
        await run();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledWith(expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));
    });

    it('posts a template-required comment when a mandatory section is missing', async () => {
        mockComments([makeComment({id: 2, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_REQUIRED', message: '⚠️ {user} please fix your proposal'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, expect.stringContaining('@contributor'));
    });

    it('edits the comment when a proposal edit is classified as substantial', async () => {
        const editedComment = makeComment({body: `${VALID_PROPOSAL_BODY}\nedited`});
        setPayload({action: 'edited', comment: editedComment, changes: {body: {from: VALID_PROPOSAL_BODY}}});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({
            text: JSON.stringify({action: 'ACTION_EDIT', message: '🚨 Edited at {updated_timestamp}'}),
            responseID: 'resp_edit',
        });

        await run();

        // Duplicate-check never runs for edited events
        expect(mockGetAllCommentDetails).not.toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 1, body: expect.stringContaining('Edited at')}));
    });

    it('withdraws and flags a duplicate proposal without ever running the template check', async () => {
        mockComments([makeComment({id: 42, created_at: '2025-12-31T00:00:00Z', html_url: 'https://github.com/Expensify/App/issues/1#issuecomment-42'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({
            text: duplicateCheckResult({action: 'ACTION_HIDE_DUPLICATE', similarity: 95, duplicateCommentId: 42}),
            responseID: 'resp_dup',
        });

        await run();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: expect.stringContaining('withdrawn')}));
        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, expect.stringContaining('https://github.com/Expensify/App/issues/1#issuecomment-42'));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(1);
    });

    it('does not withdraw a proposal when similarity is high but the action disagrees', async () => {
        // Guards against the model's `action` and `similarity` fields disagreeing (e.g. schema drift) -
        // both must indicate a duplicate, not just a high similarity score in isolation. Uses an
        // already-tracked Conversation so the only comment activity under test is (or isn't) the withdrawal.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({action: 'NO_ACTION', similarity: 95, duplicateCommentId: 42}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('creates and seeds a new Conversation when the issue has no tracked one yet', async () => {
        mockComments([makeComment({id: 7, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created', comment: makeComment({id: 8, created_at: '2026-01-02T00:00:00Z'})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, expect.stringContaining('proposal-police-conversation-id: conv_new'));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_new'}));
    });

    it('seeds a new Conversation in multiple batches when there are more than 20 prior proposals', async () => {
        const priorProposals = Array.from({length: 23}, (_unused, index) => makeComment({id: index + 1, created_at: '2025-12-31T00:00:00Z'}));
        mockComments(priorProposals);
        setPayload({action: 'created', comment: makeComment({id: 100, created_at: '2026-01-02T00:00:00Z'})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).toHaveBeenCalledTimes(1);
        const [firstBatch] = MockedOpenAIUtils.prototype.createConversation.mock.calls.at(0) ?? [];
        expect(firstBatch).toHaveLength(20);
        // The tracking comment must be posted before the remaining batch is sent, so a failure sending it
        // can't leave the Conversation untracked (see proposalPoliceComment.ts).
        const createCommentOrder = mockCreateComment.mock.invocationCallOrder.at(0);
        const addConversationItemsOrder = MockedOpenAIUtils.prototype.addConversationItems.mock.invocationCallOrder.at(0);
        expect(createCommentOrder).toBeDefined();
        expect(addConversationItemsOrder).toBeDefined();
        expect(createCommentOrder).toBeLessThan(addConversationItemsOrder ?? Number.POSITIVE_INFINITY);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.addConversationItems).toHaveBeenCalledTimes(1);
        const [, secondBatch] = MockedOpenAIUtils.prototype.addConversationItems.mock.calls.at(0) ?? [];
        expect(secondBatch).toHaveLength(3);
    });

    it('skips the duplicate-check call when the issue has no prior proposals at all', async () => {
        // mockGetAllCommentDetails already resolves [] by default (see beforeEach)
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});

        await run();

        // A Conversation is still created (and tracked) so future proposals on this issue have something to attach to...
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).toHaveBeenCalledTimes(1);
        // ...but with nothing yet to compare against, only the template-check call should run.
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment -- expect.anything() is typed as `any`
        expect(MockedOpenAIUtils.prototype.promptResponses).not.toHaveBeenCalledWith(expect.objectContaining({conversation: expect.anything()}));
        // The proposal must still be recorded directly, since skipping promptResponses also skips its auto-append-to-Conversation behavior.
        // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(MockedOpenAIUtils.prototype.addConversationItems).toHaveBeenCalledWith('conv_new', [expect.objectContaining({content: expect.stringContaining('comment_id="1"')})]);
    });

    it('records the first proposal so a near-duplicate second proposal can be caught', async () => {
        // First proposal on a fresh issue: no prior proposals, so the Conversation is created but the
        // duplicate-check call is skipped (and the proposal is recorded directly instead - see above).
        setPayload({action: 'created', comment: makeComment({id: 1, created_at: '2026-01-01T00:00:00Z'})});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl_1'});
        await run();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).toHaveBeenCalledTimes(1);

        // Second proposal on the same issue: the tracking comment now exists, so the Conversation is reused
        // and the duplicate-check call runs (proving the first proposal wasn't silently lost).
        jest.clearAllMocks();
        mockComments([makeComment({id: 1, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_new -->'})]);
        setPayload({action: 'created', comment: makeComment({id: 2, created_at: '2026-01-02T00:00:00Z'})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({action: 'ACTION_HIDE_DUPLICATE', similarity: 96, duplicateCommentId: 1}), responseID: 'resp_dup_2'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl_2'});
        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_new'}));
        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 2}));
    });

    it('reuses an already-tracked Conversation without creating a new one', async () => {
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION', message: ''}), responseID: 'resp_tpl'});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).not.toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_existing'}));
    });
});
