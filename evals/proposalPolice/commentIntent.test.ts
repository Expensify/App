import {describe, expect, test} from 'bun:test';

import CONST from '@github/libs/CONST';

import {buildCommentIntentInput} from '@prompts/proposalPolice/input';
import {buildCommentIntentInstructions} from '@prompts/proposalPolice/instructions';
import {COMMENT_INTENT_RESPONSE_FORMAT, isCommentIntentResponse} from '@prompts/proposalPolice/schema';
import type {CommentIntentResponse} from '@prompts/proposalPolice/schema';

import fixtures from './fixtures/commentIntent.json';
import {majority, PROPOSAL_POLICE_MODEL, RUNS_PER_FIXTURE, sampleFixture} from './runFixture';

describe('comment intent', () => {
    for (const fixture of fixtures) {
        test(
            `${fixture.id} → ${fixture.expectedIntent}`,
            async () => {
                const samples = await sampleFixture(async (openAI) => {
                    const response = await openAI.promptResponses({
                        instructions: buildCommentIntentInstructions(),
                        input: buildCommentIntentInput(fixture.body),
                        model: PROPOSAL_POLICE_MODEL,
                        promptCacheKey: 'proposal-police-comment-intent',
                        textFormat: COMMENT_INTENT_RESPONSE_FORMAT,
                    });
                    return openAI.parseJSONResponse<CommentIntentResponse>(response.text, isCommentIntentResponse)?.intent ?? 'UNPARSEABLE';
                });

                const {value, agreed} = majority(samples);
                console.log(`${fixture.id}: ${agreed}/${RUNS_PER_FIXTURE} → ${value} (expected ${fixture.expectedIntent}) — ${fixture.note}`);

                // Minimizing a real contributor's comment is the one outcome here that can't be walked back
                // by the next run, so a comment that is not even an attempt must never be called spam —
                // not on a majority, not on a single sample.
                if (fixture.expectedIntent === CONST.INTENT.NOT_AN_ATTEMPT) {
                    expect(samples).not.toContain(CONST.INTENT.SPAM);
                }

                expect(value).toBe(fixture.expectedIntent);
            },
            {timeout: 120_000},
        );
    }
});
