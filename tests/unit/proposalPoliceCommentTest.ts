/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @jest-environment node
 */
import run, {DUPLICATE_SIMILARITY_THRESHOLD, PROPOSAL_POLICE_MODEL} from '@github/actions/javascript/proposalPoliceComment/proposalPoliceComment';
import GithubUtils from '@github/libs/GithubUtils';

import {buildTemplateReminderMessage, DUPLICATE_CHECK_WITHDRAW_MESSAGE, SUBSTANTIVE_EDIT_MESSAGE_PREFIX} from '@prompts/proposalPolice/messages';

import OpenAIUtils from '@scripts/utils/OpenAIUtils';
import type {ProposalComment} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

import type {ConversationItem} from 'openai/resources/conversations/items';

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

function duplicateCheckResult(overrides: Partial<{similarity: number; duplicateCommentID: number | null}> = {}) {
    return JSON.stringify({similarity: 0, duplicateCommentID: null, ...overrides});
}

/**
 * A stored Conversation item holding the proposal from `commentID`, shaped like what the API returns
 * when listing items (content split into parts) rather than the plain string used when writing them.
 */
function conversationMessage(itemID: string, commentID: number): ConversationItem {
    return {
        id: itemID,
        type: 'message',
        role: 'user',
        status: 'completed',
        content: [{type: 'input_text', text: `<proposal comment_id="${commentID}">\nsome proposal\n</proposal>`}],
    };
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
        MockedOpenAIUtils.prototype.listConversationItems.mockResolvedValue([]);
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
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('uses PROPOSAL_POLICE_MODEL for the duplicate-check, template-check, and edit-check calls', async () => {
        mockComments([makeComment({id: 2, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});
        await run();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(2, expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));

        jest.clearAllMocks();
        setPayload({action: 'edited', comment: makeComment({body: `${VALID_PROPOSAL_BODY}\nedited`}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_edit'});
        await run();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledWith(expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));
    });

    it('posts a template-required comment when a mandatory section is missing', async () => {
        mockComments([makeComment({id: 2, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created'});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_REQUIRED'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, buildTemplateReminderMessage('contributor'));
    });

    it('does not run the edit check on an edited comment that is not a proposal', async () => {
        // The edit check only grades how much a proposal changed, so a reworded discussion comment that
        // merely mentions "Proposal" must not reach the model and come back as a substantial edit.
        const discussion = '## Proposal Feedback\n@someone your proposal looks good, but could you clarify the testing strategy?';
        setPayload({action: 'edited', comment: makeComment({body: `${discussion} Rewritten entirely.`}), changes: {body: {from: discussion}}});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('does not run the edit check when the edit left the comment body unchanged', async () => {
        // Without a previous body there is nothing to compare against, and an empty original would
        // read as a full rewrite and get flagged as substantial.
        setPayload({action: 'edited', comment: makeComment(), changes: {}});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('edits the comment when a proposal edit is classified as substantial', async () => {
        const editedComment = makeComment({body: `${VALID_PROPOSAL_BODY}\nedited`});
        setPayload({action: 'edited', comment: editedComment, changes: {body: {from: VALID_PROPOSAL_BODY}}});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({
            text: JSON.stringify({action: 'ACTION_EDIT'}),
            responseID: 'resp_edit',
        });

        await run();

        // Only the edit check runs for edited events - never the duplicate check
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(1);
        // The flagged body is the bot's message followed by the comment it was applied to
        expect(mockUpdateComment).toHaveBeenCalledWith(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
            expect.objectContaining({comment_id: 1, body: expect.stringContaining(SUBSTANTIVE_EDIT_MESSAGE_PREFIX)}),
        );
    });

    it('replaces the recorded proposal after a substantial edit so later duplicate checks see the new text', async () => {
        const editedBody = `${VALID_PROPOSAL_BODY}\ncompletely different solution`;
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'edited', comment: makeComment({id: 7, body: editedBody}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        MockedOpenAIUtils.prototype.listConversationItems.mockResolvedValue([conversationMessage('item_7', 7), conversationMessage('item_9', 9)]);
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_EDIT'}), responseID: 'resp_edit'});

        await run();

        // The stale copy is removed before the refreshed one is added, so the Conversation never holds two
        // versions of the same comment
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.deleteConversationItem).toHaveBeenCalledWith('conv_existing', 'item_7');
        const [, items] = MockedOpenAIUtils.prototype.addConversationItems.mock.calls.at(0) ?? [];
        expect(items).toHaveLength(1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(items?.at(0)).toEqual(expect.objectContaining({content: expect.stringContaining('completely different solution')}));
    });

    it('leaves the Conversation untouched when the edited proposal is not recorded in it', async () => {
        // Adding without a matching removal would leave two versions of the same comment_id behind
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'edited', comment: makeComment({id: 7, body: `${VALID_PROPOSAL_BODY}\nedited`}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        MockedOpenAIUtils.prototype.listConversationItems.mockResolvedValue([conversationMessage('item_9', 9)]);
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_EDIT'}), responseID: 'resp_edit'});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.deleteConversationItem).not.toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.addConversationItems).not.toHaveBeenCalled();
    });

    it('withdraws and flags a duplicate proposal without ever running the template check', async () => {
        mockComments([makeComment({id: 42, created_at: '2025-12-31T00:00:00Z', html_url: 'https://github.com/Expensify/App/issues/1#issuecomment-42'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({
            text: duplicateCheckResult({similarity: 95, duplicateCommentID: 42}),
            responseID: 'resp_dup',
        });

        await run();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: expect.stringContaining('withdrawn')}));
        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, expect.stringContaining('https://github.com/Expensify/App/issues/1#issuecomment-42'));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(1);
    });

    it('does not withdraw when the reported duplicate is no longer a live proposal', async () => {
        // Comment 42 was itself withdrawn earlier, so its body is the withdrawal notice rather than a
        // proposal. Trusting the model's ID here would destroy a proposal that nothing live duplicates.
        mockComments([
            makeComment({id: 42, body: DUPLICATE_CHECK_WITHDRAW_MESSAGE, created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 99, duplicateCommentID: 42}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
        // Falls through to the template check rather than returning early as a duplicate
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(2);
    });

    it('does not withdraw when the model invents a duplicate comment ID', async () => {
        mockComments([
            makeComment({id: 42, created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 99, duplicateCommentID: 123456}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('drops a withdrawn proposal from the Conversation so it cannot shadow the live original', async () => {
        mockComments([
            makeComment({id: 42, created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.listConversationItems.mockResolvedValue([conversationMessage('item_42', 42), conversationMessage('item_99', 99)]);
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: duplicateCheckResult({similarity: 95, duplicateCommentID: 42}), responseID: 'resp_dup'});

        await run();

        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: DUPLICATE_CHECK_WITHDRAW_MESSAGE}));
        // The withdrawn proposal is removed; the one it duplicated stays
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.deleteConversationItem).toHaveBeenCalledWith('conv_existing', 'item_99');
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.deleteConversationItem).toHaveBeenCalledTimes(1);
    });

    it('does not withdraw a proposal scoring just below the similarity threshold', async () => {
        // Uses an already-tracked Conversation so the only comment activity under test is (or isn't) the withdrawal.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: DUPLICATE_SIMILARITY_THRESHOLD - 1, duplicateCommentID: 42}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('withdraws a proposal scoring exactly at the similarity threshold', async () => {
        mockComments([makeComment({id: 42, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({
            text: duplicateCheckResult({similarity: DUPLICATE_SIMILARITY_THRESHOLD, duplicateCommentID: 42}),
            responseID: 'resp_dup',
        });

        await run();

        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: DUPLICATE_CHECK_WITHDRAW_MESSAGE}));
    });

    it('creates and seeds a new Conversation when the issue has no tracked one yet', async () => {
        mockComments([makeComment({id: 7, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created', comment: makeComment({id: 8, created_at: '2026-01-02T00:00:00Z'})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

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
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

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
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

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
        MockedOpenAIUtils.prototype.promptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl_1'});
        await run();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).toHaveBeenCalledTimes(1);

        // Second proposal on the same issue: the tracking comment now exists, so the Conversation is reused
        // and the duplicate-check call runs (proving the first proposal wasn't silently lost).
        jest.clearAllMocks();
        mockComments([
            makeComment({id: 1, created_at: '2026-01-01T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_new -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 2, created_at: '2026-01-02T00:00:00Z'})});
        MockedOpenAIUtils.prototype.promptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 96, duplicateCommentID: 1}), responseID: 'resp_dup_2'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl_2'});
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
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).not.toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_existing'}));
    });
});
