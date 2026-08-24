/* eslint-disable @typescript-eslint/naming-convention */
import {describe, expect, it} from 'bun:test';

import {
    buildSeedItems,
    buildTrackingCommentBody,
    chunkArray,
    findConversationItemIDForComment,
    findTrackedConversationID,
    findVerdictItemIDs,
} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

import type {ConversationItem} from 'openai/resources/conversations/items';

import {makeComment} from './proposalPoliceFixtures';

describe('ProposalPoliceConversation', () => {
    describe('buildTrackingCommentBody / findTrackedConversationID', () => {
        it('round-trips a conversation ID through the tracking comment body', () => {
            const body = buildTrackingCommentBody('conv_abc123');
            const comment = makeComment({body, login: 'github-actions[bot]', type: 'Bot'});

            expect(findTrackedConversationID([comment])).toBe('conv_abc123');
        });

        it('ignores a matching marker posted by a non-bot author', () => {
            const body = buildTrackingCommentBody('conv_abc123');
            const comment = makeComment({body, login: 'a-contributor', type: 'User'});

            expect(findTrackedConversationID([comment])).toBeUndefined();
        });

        it('returns undefined when no tracking comment exists', () => {
            const comment = makeComment({login: 'github-actions[bot]', type: 'Bot', body: 'just a regular comment'});

            expect(findTrackedConversationID([comment])).toBeUndefined();
        });
    });

    describe('buildSeedItems', () => {
        it('includes only valid, non-bot proposals created before the cutoff', () => {
            const beforeCutoff = new Date('2026-01-01T00:00:00Z').getTime();
            const comments = [
                makeComment({id: 1, created_at: '2025-12-31T00:00:00Z'}), // valid proposal, before cutoff
                makeComment({id: 2, created_at: '2025-12-31T00:00:00Z', body: 'not a proposal at all'}), // not a proposal
                makeComment({id: 3, created_at: '2025-12-31T00:00:00Z', login: 'github-actions[bot]', type: 'Bot'}), // bot author
                makeComment({id: 4, created_at: '2026-01-02T00:00:00Z'}), // after cutoff
            ];

            const items = buildSeedItems(comments, beforeCutoff);

            expect(items).toHaveLength(1);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
            expect(items.at(0)).toEqual({role: 'user', content: expect.stringContaining('comment_id="1"')});
        });

        it("tags each seed item with its own author, so the model can skip a contributor's own prior proposals", () => {
            const beforeCutoff = new Date('2026-01-01T00:00:00Z').getTime();
            const comments = [
                makeComment({id: 1, created_at: '2025-12-31T00:00:00Z', login: 'first-author'}),
                makeComment({id: 2, created_at: '2025-12-31T00:00:00Z', login: 'second-author'}),
            ];

            const items = buildSeedItems(comments, beforeCutoff);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
            expect(items.at(0)).toMatchObject({content: expect.stringContaining('author="first-author"')});
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.stringContaining is typed as `any`
            expect(items.at(1)).toMatchObject({content: expect.stringContaining('author="second-author"')});
        });
    });

    describe('findConversationItemIDForComment / findVerdictItemIDs', () => {
        function message(itemID: string, role: 'user' | 'assistant', text: string): ConversationItem {
            return {id: itemID, type: 'message', role, status: 'completed', content: [{type: 'input_text', text}]};
        }

        const items: ConversationItem[] = [
            message('item_a', 'user', '<proposal comment_id="11" author="first-author">\nfirst\n</proposal>'),
            message('item_verdict', 'assistant', '{"similarity":95,"duplicateCommentID":11}'),
            message('item_b', 'user', '<proposal comment_id="12" author="second-author">\nsecond\n</proposal>'),
        ];

        it('finds the item holding a given comment', () => {
            expect(findConversationItemIDForComment(items, 11)).toBe('item_a');
            expect(findConversationItemIDForComment(items, 12)).toBe('item_b');
        });

        it('returns undefined for a comment with nothing stored', () => {
            expect(findConversationItemIDForComment(items, 999)).toBeUndefined();
        });

        it('never matches a verdict that happens to name the comment ID', () => {
            // The verdict above contains `duplicateCommentID: 11`, so a match on text alone would delete the
            // model's answer instead of the proposal it refers to.
            expect(findConversationItemIDForComment(items.slice(1, 2), 11)).toBeUndefined();
        });

        it("finds the model's verdicts and nothing else", () => {
            expect(findVerdictItemIDs(items)).toEqual(['item_verdict']);
        });

        it('finds no verdicts in a conversation of proposals alone', () => {
            expect(findVerdictItemIDs([...items.slice(0, 1), ...items.slice(2, 3)])).toEqual([]);
        });
    });

    describe('chunkArray', () => {
        it('splits an array into chunks of the given size', () => {
            expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        });

        it('returns an empty array for empty input', () => {
            expect(chunkArray([], 20)).toEqual([]);
        });

        it('returns a single chunk when input is smaller than the chunk size', () => {
            expect(chunkArray([1, 2], 20)).toEqual([[1, 2]]);
        });
    });
});
