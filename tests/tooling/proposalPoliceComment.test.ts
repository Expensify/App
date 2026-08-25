/* eslint-disable @typescript-eslint/naming-convention */
import {beforeEach, describe, expect, it, jest, mock} from 'bun:test';

import {
    buildJobClaimReminderMessage,
    buildSubstantiveEditMessage,
    buildTemplateReminderMessage,
    DUPLICATE_CHECK_WITHDRAW_MESSAGE,
    SUBSTANTIVE_EDIT_MESSAGE_PREFIX,
} from '@prompts/proposalPolice/messages';

import type {ProposalComment} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

import type {Conversation} from 'openai/resources/conversations/conversations';
import type {ConversationItem} from 'openai/resources/conversations/items';
import type {ResponseInputItem} from 'openai/resources/responses/responses';

import {makeComment, VALID_PROPOSAL_BODY} from './proposalPoliceFixtures';

// Typed to the shape each caller actually uses. bun:test's jest.fn() is otherwise `any`, which makes every
// use of `.mock.calls` and every argument these are handed unsafe to the type-aware lint rules.
const mockGetAllCommentDetails = jest.fn<(issueNumber: number) => Promise<ProposalComment[]>>();
const mockCreateComment = jest.fn<(repo: string, issueNumber: number, body: string) => Promise<void>>();
const mockMinimizeCommentAsSpam = jest.fn<(commentNodeID: string) => Promise<void>>();
const mockUpdateComment = jest.fn<(params: {comment_id: number; body: string}) => Promise<void>>();

const mockPromptResponses = jest.fn<(params: {input: string}) => Promise<{text: string; responseID: string}>>();
const mockCreateConversation = jest.fn<(items?: ResponseInputItem[]) => Promise<Conversation>>();
const mockAddConversationItems = jest.fn<(conversationID: string, items: ResponseInputItem[]) => Promise<void>>();
const mockListConversationItems = jest.fn<(conversationID: string) => Promise<ConversationItem[]>>();
const mockDeleteConversationItem = jest.fn<(conversationID: string, itemID: string) => Promise<void>>();
const mockParseJSONResponse = jest.fn<(response: string) => unknown>();

// `context` is a singleton the action reads at call time, so tests mutate `context.payload` directly
// rather than re-importing per scenario.
const context = {
    eventName: 'issue_comment',
    repo: {owner: 'Expensify', repo: 'App'},
    payload: {} as Record<string, unknown>,
};

// Every mock.module() call has to run before the action is imported below, since that import is what pulls
// these modules into the registry.
await mock.module('@github/libs/GithubUtils', () => ({
    __esModule: true,
    default: {
        getAllCommentDetails: mockGetAllCommentDetails,
        createComment: mockCreateComment,
        minimizeCommentAsSpam: mockMinimizeCommentAsSpam,
        octokit: {issues: {updateComment: mockUpdateComment}},
    },
}));

// A real class rather than a jest.fn() constructor: several tests call jest.clearAllMocks() partway
// through, which would strip a mock constructor's implementation and leave `new OpenAIUtils()` undefined.
await mock.module('@scripts/utils/OpenAIUtils', () => ({
    __esModule: true,
    default: class {
        promptResponses = mockPromptResponses;

        createConversation = mockCreateConversation;

        addConversationItems = mockAddConversationItems;

        listConversationItems = mockListConversationItems;

        deleteConversationItem = mockDeleteConversationItem;

        parseJSONResponse = mockParseJSONResponse;
    },
}));

await mock.module('@actions/github', () => ({context}));

const {default: run, DUPLICATE_SIMILARITY_THRESHOLD, PROPOSAL_POLICE_MODEL} = await import('@github/actions/javascript/proposalPoliceComment/proposalPoliceComment');

/**
 * `GithubUtils.getAllCommentDetails` really returns Octokit's full comment schema, but this suite only
 * ever reads the fields captured by `ProposalComment`, so its test fixtures omit the rest (avatar URLs,
 * reaction counts, etc.).
 */
function mockComments(comments: ProposalComment[]) {
    mockGetAllCommentDetails.mockResolvedValue(comments);
}

function setPayload(overrides: {action: 'created' | 'edited'; comment?: ProposalComment; changes?: {body?: {from?: string}}}) {
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

/**
 * Resets each mock by name rather than via resetAllMocks(), which under bun:test leaves these module-level
 * mocks' queued mockResolvedValueOnce values in place to be consumed by whichever test runs next.
 */
function resetMocks() {
    for (const mockFn of [
        mockGetAllCommentDetails,
        mockCreateComment,
        mockMinimizeCommentAsSpam,
        mockUpdateComment,
        mockPromptResponses,
        mockCreateConversation,
        mockAddConversationItems,
        mockListConversationItems,
        mockDeleteConversationItem,
        mockParseJSONResponse,
    ]) {
        mockFn.mockReset();
    }

    mockGetAllCommentDetails.mockResolvedValue([]);
    mockCreateConversation.mockResolvedValue({id: 'conv_new', created_at: 0, metadata: null, object: 'conversation'});
    mockListConversationItems.mockResolvedValue([]);
    // Bypass the real JSON-schema validators here; OpenAIUtils.test.ts already covers parseJSONResponse itself.
    mockParseJSONResponse.mockImplementation((text) => JSON.parse(text));
}

describe('proposalPoliceComment', () => {
    beforeEach(() => {
        resetMocks();
        process.env.INPUT_PROPOSAL_POLICE_API_KEY = 'test-api-key';
        process.env.INPUT_TRUSTED_COMMENTER = 'false';
    });

    it('does nothing at all for a bot-authored comment', async () => {
        setPayload({action: 'created', comment: makeComment({login: 'github-actions[bot]', type: 'Bot'})});

        await run();

        expect(mockGetAllCommentDetails).not.toHaveBeenCalled();
        expect(mockPromptResponses).not.toHaveBeenCalled();
    });

    it('does nothing when a valid proposal is not a duplicate', async () => {
        // Use an already-tracked Conversation so the only comments under test are the nag/notice ones,
        // not the one-time tracking comment created alongside a brand-new Conversation.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created'});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('uses PROPOSAL_POLICE_MODEL for the comment-intent, duplicate-check, and edit-check calls', async () => {
        mockComments([makeComment({id: 2, login: 'other-contributor', created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created'});
        mockPromptResponses.mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'});
        await run();
        expect(mockPromptResponses).toHaveBeenCalledWith(expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));

        resetMocks();
        setPayload({action: 'created', comment: makeComment({body: 'I would like to work on this issue.'})});
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({intent: 'NOT_AN_ATTEMPT'}), responseID: 'resp_intent'});
        await run();
        expect(mockPromptResponses).toHaveBeenCalledWith(expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));

        resetMocks();
        setPayload({action: 'edited', comment: makeComment({body: `${VALID_PROPOSAL_BODY}\nedited`}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_edit'});
        await run();
        expect(mockPromptResponses).toHaveBeenCalledWith(expect.objectContaining({model: PROPOSAL_POLICE_MODEL}));
    });

    it('never classifies a comment that already follows the template', async () => {
        // Template conformance is decided in code, so a valid proposal costs no intent call at all.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created'});
        mockPromptResponses.mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'});

        await run();

        // The single call is the duplicate check, against the Conversation - never an intent classification
        expect(mockPromptResponses).toHaveBeenCalledTimes(1);
        expect(mockPromptResponses).toHaveBeenCalledWith(expect.objectContaining({conversation: 'conv_existing'}));
        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockMinimizeCommentAsSpam).not.toHaveBeenCalled();
    });

    it('reminds the author about the template but leaves a genuine attempt visible', async () => {
        setPayload({action: 'created', comment: makeComment({body: 'The root cause is that lastReadTime is updated before the unread marker is computed.'})});
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({intent: 'GENUINE_ATTEMPT'}), responseID: 'resp_intent'});

        await run();

        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, buildTemplateReminderMessage('contributor'));
        expect(mockMinimizeCommentAsSpam).not.toHaveBeenCalled();
        // No Conversation work: the comment isn't a proposal, so it never enters duplicate detection
        expect(mockCreateConversation).not.toHaveBeenCalled();
    });

    it('minimizes a content-free claim on the issue as spam, and still explains the template', async () => {
        setPayload({action: 'created', comment: makeComment({id: 77, body: 'I would like to take on this issue. Please see my Upwork application.'})});
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({intent: 'SPAM'}), responseID: 'resp_intent'});

        await run();

        expect(mockMinimizeCommentAsSpam).toHaveBeenCalledWith('IC_node_77');
        // Copy for a claim on the job, not the proposal reminder: they proposed nothing to update
        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, buildJobClaimReminderMessage('contributor'));
        // Minimizing collapses the comment; the body is never rewritten
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('does not minimize a content-free claim from a trusted commenter', async () => {
        process.env.INPUT_TRUSTED_COMMENTER = 'true';
        setPayload({action: 'created', comment: makeComment({body: 'I can take this.'})});
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({intent: 'NOT_AN_ATTEMPT'}), responseID: 'resp_intent'});

        await run();

        expect(mockPromptResponses.mock.calls[0]?.[0].input).toContain('<author_context>trusted:');
        expect(mockMinimizeCommentAsSpam).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('leaves ordinary discussion alone', async () => {
        setPayload({action: 'created', comment: makeComment({body: 'Retested on staging 9.1.42, still reproducible on iOS but not on web.'})});
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({intent: 'NOT_AN_ATTEMPT'}), responseID: 'resp_intent'});

        await run();

        expect(mockCreateComment).not.toHaveBeenCalled();
        expect(mockMinimizeCommentAsSpam).not.toHaveBeenCalled();
    });

    it('leaves the comment alone when the intent response cannot be parsed', async () => {
        setPayload({action: 'created', comment: makeComment({body: 'I would like to take on this issue.'})});
        mockParseJSONResponse.mockReturnValue(null);
        mockPromptResponses.mockResolvedValueOnce({text: 'not json', responseID: 'resp_intent'});

        await run();

        expect(mockMinimizeCommentAsSpam).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('does not run the edit check on an edited comment that is not a proposal', async () => {
        // The edit check only grades how much a proposal changed, so a reworded discussion comment that
        // merely mentions "Proposal" must not reach the model and come back as a substantial edit.
        const discussion = '## Proposal Feedback\n@someone your proposal looks good, but could you clarify the testing strategy?';
        setPayload({action: 'edited', comment: makeComment({body: `${discussion} Rewritten entirely.`}), changes: {body: {from: discussion}}});

        await run();

        expect(mockPromptResponses).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('does not run the edit check when the edit left the comment body unchanged', async () => {
        // Without a previous body there is nothing to compare against, and an empty original would
        // read as a full rewrite and get flagged as substantial.
        setPayload({action: 'edited', comment: makeComment(), changes: {}});

        await run();

        expect(mockPromptResponses).not.toHaveBeenCalled();
        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('edits the comment when a proposal edit is classified as substantial', async () => {
        const editedComment = makeComment({body: `${VALID_PROPOSAL_BODY}\nedited`});
        setPayload({action: 'edited', comment: editedComment, changes: {body: {from: VALID_PROPOSAL_BODY}}});
        mockPromptResponses.mockResolvedValueOnce({
            text: JSON.stringify({action: 'ACTION_EDIT'}),
            responseID: 'resp_edit',
        });

        await run();

        // Only the edit check runs for edited events - never the duplicate check
        expect(mockPromptResponses).toHaveBeenCalledTimes(1);
        // The flagged body is the bot's message followed by the comment it was applied to
        expect(mockUpdateComment).toHaveBeenCalledWith(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
            expect.objectContaining({comment_id: 1, body: expect.stringContaining(SUBSTANTIVE_EDIT_MESSAGE_PREFIX)}),
        );
    });

    it('refreshes the recorded proposal when an already-bannered comment is edited again', async () => {
        // The banner means this comment was flagged on a previous run. It must not be flagged twice, but
        // the proposal underneath it can still have changed, and the stored copy would otherwise be stuck
        // at whatever it said before this edit.
        const bannered = (proposal: string) => `${buildSubstantiveEditMessage('2026-01-01 00:00:00 UTC')}\n\n${proposal}`;
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({
            action: 'edited',
            comment: makeComment({id: 7, body: bannered(`${VALID_PROPOSAL_BODY}\nyet another solution`)}),
            changes: {body: {from: bannered(VALID_PROPOSAL_BODY)}},
        });
        mockListConversationItems.mockResolvedValue([conversationMessage('item_7', 7)]);

        await run();

        // No second banner, and no model call - the edit check only decides whether to banner
        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockPromptResponses).not.toHaveBeenCalled();

        expect(mockDeleteConversationItem).toHaveBeenCalledWith('conv_existing', 'item_7');
        const [, items] = mockAddConversationItems.mock.calls.at(0) ?? [];
        const storedItem = items?.at(0);
        const storedContent = storedItem && 'content' in storedItem && typeof storedItem.content === 'string' ? storedItem.content : '';
        expect(storedContent).toContain('yet another solution');
        // The banner is ours, not the contributor's proposal, so it must not pollute future comparisons
        expect(storedContent).not.toContain(SUBSTANTIVE_EDIT_MESSAGE_PREFIX);
    });

    it('replaces the recorded proposal after a substantial edit so later duplicate checks see the new text', async () => {
        const editedBody = `${VALID_PROPOSAL_BODY}\ncompletely different solution`;
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'edited', comment: makeComment({id: 7, body: editedBody}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        mockListConversationItems.mockResolvedValue([conversationMessage('item_7', 7), conversationMessage('item_9', 9)]);
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_EDIT'}), responseID: 'resp_edit'});

        await run();

        // The stale copy is removed before the refreshed one is added, so the Conversation never holds two
        // versions of the same comment
        expect(mockDeleteConversationItem).toHaveBeenCalledWith('conv_existing', 'item_7');
        const [, items] = mockAddConversationItems.mock.calls.at(0) ?? [];
        expect(items).toHaveLength(1);
        const storedItem = items?.at(0);
        const storedContent = storedItem && 'content' in storedItem && typeof storedItem.content === 'string' ? storedItem.content : '';
        expect(storedContent).toContain('completely different solution');
    });

    it('records a comment that only became a proposal on this edit', async () => {
        // It was not a proposal when posted, so the created path never recorded it. Nothing else will
        // ever add it, and duplicate checks only read the Conversation, so it has to be added here.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'edited', comment: makeComment({id: 7, body: VALID_PROPOSAL_BODY}), changes: {body: {from: 'Proposal: I might write one later'}}});
        mockListConversationItems.mockResolvedValue([conversationMessage('item_9', 9)]);
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_EDIT'}), responseID: 'resp_edit'});

        await run();

        // Nothing stored for this comment yet, so there is nothing to remove
        expect(mockDeleteConversationItem).not.toHaveBeenCalled();
        expect(mockAddConversationItems).toHaveBeenCalledWith('conv_existing', [
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
            expect.objectContaining({content: expect.stringContaining('comment_id="7"')}),
        ]);
    });

    it('drops the stored copy when a proposal is edited into something that is no longer one', async () => {
        // A retracted proposal must not go on matching future proposals from the Conversation
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'edited', comment: makeComment({id: 7, body: 'Proposal withdrawn, disregard this.'}), changes: {body: {from: VALID_PROPOSAL_BODY}}});
        mockListConversationItems.mockResolvedValue([conversationMessage('item_7', 7)]);
        mockPromptResponses.mockResolvedValueOnce({text: JSON.stringify({action: 'ACTION_EDIT'}), responseID: 'resp_edit'});

        await run();

        expect(mockDeleteConversationItem).toHaveBeenCalledWith('conv_existing', 'item_7');
        expect(mockAddConversationItems).not.toHaveBeenCalled();
    });

    it('withdraws and flags a duplicate proposal without ever running the template check', async () => {
        mockComments([makeComment({id: 42, login: 'other-contributor', created_at: '2025-12-31T00:00:00Z', html_url: 'https://github.com/Expensify/App/issues/1#issuecomment-42'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockPromptResponses.mockResolvedValueOnce({
            text: duplicateCheckResult({similarity: 95, duplicateCommentID: 42}),
            responseID: 'resp_dup',
        });

        await run();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: expect.stringContaining('withdrawn')}));
        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, expect.stringContaining('https://github.com/Expensify/App/issues/1#issuecomment-42'));
        expect(mockPromptResponses).toHaveBeenCalledTimes(1);
    });

    it("does not withdraw a proposal as a duplicate of the same author's earlier one", async () => {
        // The prompt tells the model to skip same-author proposals, but a contributor revising their own
        // thinking must not be withdrawn even when the model reports the self-match anyway.
        mockComments([
            makeComment({id: 42, created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 100, duplicateCommentID: 42}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('does not withdraw when the reported duplicate is no longer a live proposal', async () => {
        // Comment 42 was itself withdrawn earlier, so its body is the withdrawal notice rather than a
        // proposal. Trusting the model's ID here would destroy a proposal that nothing live duplicates.
        mockComments([
            makeComment({id: 42, body: DUPLICATE_CHECK_WITHDRAW_MESSAGE, created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 99, duplicateCommentID: 42}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('does not withdraw when the model invents a duplicate comment ID', async () => {
        mockComments([
            makeComment({id: 42, created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 99, duplicateCommentID: 123456}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
    });

    it('drops a withdrawn proposal from the Conversation so it cannot shadow the live original', async () => {
        mockComments([
            makeComment({id: 42, login: 'other-contributor', created_at: '2025-12-31T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockListConversationItems.mockResolvedValue([conversationMessage('item_42', 42), conversationMessage('item_99', 99)]);
        mockPromptResponses.mockResolvedValueOnce({text: duplicateCheckResult({similarity: 95, duplicateCommentID: 42}), responseID: 'resp_dup'});

        await run();

        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: DUPLICATE_CHECK_WITHDRAW_MESSAGE}));
        // The withdrawn proposal is removed; the one it duplicated stays
        expect(mockDeleteConversationItem).toHaveBeenCalledWith('conv_existing', 'item_99');
        expect(mockDeleteConversationItem).toHaveBeenCalledTimes(1);
    });

    it('does not withdraw a proposal scoring just below the similarity threshold', async () => {
        // Uses an already-tracked Conversation so the only comment activity under test is (or isn't) the withdrawal.
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: DUPLICATE_SIMILARITY_THRESHOLD - 1, duplicateCommentID: 42}), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockUpdateComment).not.toHaveBeenCalled();
        expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('withdraws a proposal scoring exactly at the similarity threshold', async () => {
        mockComments([makeComment({id: 42, login: 'other-contributor', created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created', comment: makeComment({id: 99})});
        mockPromptResponses.mockResolvedValueOnce({
            text: duplicateCheckResult({similarity: DUPLICATE_SIMILARITY_THRESHOLD, duplicateCommentID: 42}),
            responseID: 'resp_dup',
        });

        await run();

        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 99, body: DUPLICATE_CHECK_WITHDRAW_MESSAGE}));
    });

    it('creates and seeds a new Conversation when the issue has no tracked one yet', async () => {
        mockComments([makeComment({id: 7, created_at: '2025-12-31T00:00:00Z'})]);
        setPayload({action: 'created', comment: makeComment({id: 8, created_at: '2026-01-02T00:00:00Z'})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateConversation).toHaveBeenCalledTimes(1);
        expect(mockCreateComment).toHaveBeenCalledWith('App', 1, expect.stringContaining('proposal-police-conversation-id: conv_new'));
        expect(mockPromptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_new'}));
    });

    it('seeds a new Conversation in multiple batches when there are more than 20 prior proposals', async () => {
        const priorProposals = Array.from({length: 23}, (_unused, index) => makeComment({id: index + 1, created_at: '2025-12-31T00:00:00Z'}));
        mockComments(priorProposals);
        setPayload({action: 'created', comment: makeComment({id: 100, created_at: '2026-01-02T00:00:00Z'})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateConversation).toHaveBeenCalledTimes(1);
        const [firstBatch] = mockCreateConversation.mock.calls.at(0) ?? [];
        expect(firstBatch).toHaveLength(20);
        // The tracking comment must be posted before the remaining batch is sent, so a failure sending it
        // can't leave the Conversation untracked (see proposalPoliceComment.ts).
        const createCommentOrder = mockCreateComment.mock.invocationCallOrder.at(0);
        const addConversationItemsOrder = mockAddConversationItems.mock.invocationCallOrder.at(0);
        expect(createCommentOrder).toBeDefined();
        expect(addConversationItemsOrder).toBeDefined();
        expect(createCommentOrder).toBeLessThan(addConversationItemsOrder ?? Number.POSITIVE_INFINITY);
        expect(mockAddConversationItems).toHaveBeenCalledTimes(1);
        const [, secondBatch] = mockAddConversationItems.mock.calls.at(0) ?? [];
        expect(secondBatch).toHaveLength(3);
    });

    it('skips the duplicate-check call when the issue has no prior proposals at all', async () => {
        // mockGetAllCommentDetails already resolves [] by default (see beforeEach)
        setPayload({action: 'created'});

        await run();

        // A Conversation is still created (and tracked) so future proposals on this issue have something to attach to...
        expect(mockCreateConversation).toHaveBeenCalledTimes(1);
        // ...but with nothing yet to compare against, and the template checked in code, no model call runs at all.
        expect(mockPromptResponses).not.toHaveBeenCalled();
        // The proposal must still be recorded directly, since skipping promptResponses also skips its auto-append-to-Conversation behavior.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
        expect(mockAddConversationItems).toHaveBeenCalledWith('conv_new', [expect.objectContaining({content: expect.stringContaining('comment_id="1"')})]);
    });

    it('records the first proposal so a near-duplicate second proposal can be caught', async () => {
        // First proposal on a fresh issue: no prior proposals, so the Conversation is created but the
        // duplicate-check call is skipped (and the proposal is recorded directly instead - see above).
        setPayload({action: 'created', comment: makeComment({id: 1, created_at: '2026-01-01T00:00:00Z'})});
        await run();
        expect(mockCreateConversation).toHaveBeenCalledTimes(1);

        // Second proposal on the same issue: the tracking comment now exists, so the Conversation is reused
        // and the duplicate-check call runs (proving the first proposal wasn't silently lost).
        resetMocks();
        mockComments([
            makeComment({id: 1, created_at: '2026-01-01T00:00:00Z'}),
            makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_new -->'}),
        ]);
        setPayload({action: 'created', comment: makeComment({id: 2, login: 'other-contributor', created_at: '2026-01-02T00:00:00Z'})});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult({similarity: 96, duplicateCommentID: 1}), responseID: 'resp_dup_2'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl_2'});
        await run();

        expect(mockPromptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_new'}));
        expect(mockUpdateComment).toHaveBeenCalledWith(expect.objectContaining({comment_id: 2}));
    });

    it('reuses an already-tracked Conversation without creating a new one', async () => {
        mockComments([makeComment({id: 5, login: 'github-actions[bot]', type: 'Bot', body: '<!-- proposal-police-conversation-id: conv_existing -->'})]);
        setPayload({action: 'created'});
        mockPromptResponses
            .mockResolvedValueOnce({text: duplicateCheckResult(), responseID: 'resp_dup'})
            .mockResolvedValueOnce({text: JSON.stringify({action: 'NO_ACTION'}), responseID: 'resp_tpl'});

        await run();

        expect(mockCreateConversation).not.toHaveBeenCalled();
        expect(mockPromptResponses).toHaveBeenNthCalledWith(1, expect.objectContaining({conversation: 'conv_existing'}));
    });
});
