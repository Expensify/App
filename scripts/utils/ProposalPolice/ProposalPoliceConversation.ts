import isBotUser from '@github/libs/isBotUser';
import isProposal from '@github/libs/isProposal';

import {buildDuplicateCheckSeedItem} from '@prompts/proposalPolice/input';

import type {ConversationItem} from 'openai/resources/conversations/items';
import type {ResponseInputItem} from 'openai/resources/responses/responses';

/**
 * The subset of a GitHub issue comment's fields this module needs. Deliberately narrower than
 * Octokit's full comment schema so callers (and tests) don't need to fabricate every field GitHub returns.
 */
/* eslint-disable @typescript-eslint/naming-convention -- these match GitHub's REST API field names */
type ProposalComment = {
    id: number;
    body?: string;
    user: {login?: string; type?: string} | null;
    created_at: string;
    /** Linked in the withdrawal notice, so a contributor can read the proposal theirs duplicated. */
    html_url: string;
    /** The GraphQL ID, which is what `minimizeComment` takes. */
    node_id: string;
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Matches the hidden marker ProposalPolice stashes in its tracking comment on an issue, capturing the OpenAI Conversation ID.
 */
const CONVERSATION_MARKER_REGEX = /<!-- proposal-police-conversation-id: (conv_[A-Za-z0-9_-]+) -->/;

/**
 * OpenAI allows at most 20 items per conversations.create/items.create call.
 */
const MAX_ITEMS_PER_CONVERSATION_REQUEST = 20;

/**
 * Build the tracking comment body that stashes a Conversation ID for this issue.
 */
function buildTrackingCommentBody(conversationID: string): string {
    return [
        `<!-- proposal-police-conversation-id: ${conversationID} -->`,
        "🤖 ProposalPolice™ is tracking duplicate proposals for this issue using an OpenAI Conversation. This comment stores that Conversation's ID and can be safely ignored.",
    ].join('\n');
}

/**
 * Find the Conversation ID stashed in a bot-authored tracking comment, if this issue already has one.
 */
function findTrackedConversationID(comments: ProposalComment[]): string | undefined {
    for (const comment of comments) {
        if (!isBotUser(comment.user?.login ?? '', comment.user?.type ?? '')) {
            continue;
        }
        const match = comment.body?.match(CONVERSATION_MARKER_REGEX);
        if (match) {
            return match[1];
        }
    }
    return undefined;
}

/**
 * Build conversation seed items for every valid, non-bot proposal that predates `beforeCreatedAt`,
 * so a freshly created Conversation has the full duplicate-detection history for this issue.
 */
function buildSeedItems(comments: ProposalComment[], beforeCreatedAt: number): ResponseInputItem[] {
    return comments
        .filter((comment) => isProposal(comment.body) && !isBotUser(comment.user?.login ?? '', comment.user?.type ?? '') && new Date(comment.created_at).getTime() < beforeCreatedAt)
        .map((comment) => buildDuplicateCheckSeedItem(comment.body ?? '', comment.id, comment.user?.login ?? ''));
}

/**
 * Find the Conversation item holding a given comment's proposal, so it can be replaced once that
 * comment is edited. Items are matched on the comment_id attribute the seed items are tagged with.
 */
function findConversationItemIDForComment(items: ConversationItem[], commentID: number): string | undefined {
    const tag = `comment_id="${commentID}"`;
    return items.find((item) => item.type === 'message' && item.role === 'user' && item.content.some((part) => 'text' in part && part.text.includes(tag)))?.id;
}

/**
 * The model's own duplicate-check verdicts, which the Responses API persists alongside the proposals when
 * a request names a conversation. Only the proposals are worth keeping: a verdict is a JSON score naming a
 * comment ID, so left in place they pile up and go on describing proposals that have since been withdrawn
 * or edited.
 */
function findVerdictItemIDs(items: ConversationItem[]): string[] {
    const verdictItemIDs: string[] = [];
    for (const item of items) {
        if (item.type !== 'message' || item.role !== 'assistant' || !item.id) {
            continue;
        }
        verdictItemIDs.push(item.id);
    }
    return verdictItemIDs;
}

/**
 * Split an array into chunks of at most `size` items.
 */
function chunkArray<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

export {
    CONVERSATION_MARKER_REGEX,
    MAX_ITEMS_PER_CONVERSATION_REQUEST,
    buildTrackingCommentBody,
    findTrackedConversationID,
    buildSeedItems,
    findConversationItemIDForComment,
    findVerdictItemIDs,
    chunkArray,
};
export type {ProposalComment};
