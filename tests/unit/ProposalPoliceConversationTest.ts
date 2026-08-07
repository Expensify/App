/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @jest-environment node
 */
import {buildSeedItems, buildTrackingCommentBody, chunkArray, findTrackedConversationID} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';
import type {ProposalComment} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

const VALID_PROPOSAL_BODY = [
    '## Proposal',
    '',
    '### What is the root cause of that problem?',
    'Some root cause',
    '',
    '### What changes do you think we should make in order to solve the problem?',
    'Some solution',
].join('\n');

function makeComment(overrides: Partial<{id: number; body: string; login: string; type: string; created_at: string}> = {}): ProposalComment {
    return {
        id: overrides.id ?? 1,
        body: overrides.body ?? VALID_PROPOSAL_BODY,
        user: {login: overrides.login ?? 'contributor', type: overrides.type ?? 'User'},
        created_at: overrides.created_at ?? '2026-01-01T00:00:00Z',
    };
}

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
