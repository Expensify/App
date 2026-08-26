import {describe, expect, test} from 'bun:test';

import {DUPLICATE_SIMILARITY_THRESHOLD} from '@github/actions/javascript/proposalPoliceComment/proposalPoliceComment';

import {buildDuplicateCheckInput, buildDuplicateCheckSeedItem} from '@prompts/proposalPolice/input';
import {buildDuplicateCheckInstructions} from '@prompts/proposalPolice/instructions';
import {DUPLICATE_CHECK_RESPONSE_FORMAT, isDuplicateCheckResponse} from '@prompts/proposalPolice/schema';
import type {DuplicateCheckResponse} from '@prompts/proposalPolice/schema';

import {chunkArray, MAX_ITEMS_PER_CONVERSATION_REQUEST} from '@scripts/utils/ProposalPolice/ProposalPoliceConversation';

import fixtures from './fixtures/duplicateCheck.json';
import {majority, median, PROPOSAL_POLICE_MODEL, RUNS_PER_FIXTURE, sampleFixture} from './runFixture';

describe('duplicate check', () => {
    for (const fixture of fixtures) {
        test(
            `${fixture.id} → ${fixture.expectedDuplicate ? 'duplicate' : 'not a duplicate'}`,
            async () => {
                const samples = await sampleFixture(async (openAI) => {
                    // A throwaway Conversation per sample, seeded exactly as the action seeds a real issue's
                    const seedItems = fixture.priorProposals.map((prior) => buildDuplicateCheckSeedItem(prior.body, prior.commentID, prior.author));
                    const seedChunks = chunkArray(seedItems, MAX_ITEMS_PER_CONVERSATION_REQUEST);
                    const conversation = await openAI.createConversation(seedChunks.at(0));
                    for (const chunk of seedChunks.slice(1)) {
                        await openAI.addConversationItems(conversation.id, chunk);
                    }

                    const response = await openAI.promptResponses({
                        conversation: conversation.id,
                        instructions: buildDuplicateCheckInstructions(),
                        input: buildDuplicateCheckInput(fixture.newProposal.body, fixture.newProposal.commentID, fixture.newProposal.author),
                        model: PROPOSAL_POLICE_MODEL,
                        promptCacheKey: 'proposal-police-duplicate-check',
                        textFormat: DUPLICATE_CHECK_RESPONSE_FORMAT,
                    });
                    return openAI.parseJSONResponse<DuplicateCheckResponse>(response.text, isDuplicateCheckResponse) ?? {similarity: 0, duplicateCommentID: null};
                });

                // Assert which side of the threshold the score lands on, never an exact number: only the
                // side changes whether a proposal is withdrawn.
                const score = median(samples.map((sample) => sample.similarity));
                const withdrawn = samples.map((sample) => sample.similarity >= DUPLICATE_SIMILARITY_THRESHOLD);
                console.log(`${fixture.id}: scores ${samples.map((sample) => sample.similarity).join('/')} (median ${score}, threshold ${DUPLICATE_SIMILARITY_THRESHOLD}) — ${fixture.note}`);

                expect(majority(withdrawn).value).toBe(fixture.expectedDuplicate);

                if (!fixture.expectedDuplicate) {
                    return;
                }

                // Naming the wrong prior sends the contributor to an unrelated proposal, and the action
                // discards the match entirely if the ID doesn't resolve, so the ID matters as much as the score.
                const reported = majority(samples.map((sample) => sample.duplicateCommentID));
                console.log(`  → reported comment ${String(reported.value)} in ${reported.agreed}/${RUNS_PER_FIXTURE} runs, expected ${String(fixture.expectedDuplicateCommentID)}`);
                expect(reported.value).toBe(fixture.expectedDuplicateCommentID);
            },
            {timeout: 180_000},
        );
    }
});
