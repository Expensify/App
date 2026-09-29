import {describe, expect, test} from 'bun:test';

import CONST from '@github/libs/CONST';

import {buildEditCheckInput} from '@prompts/proposalPolice/input';
import {buildEditCheckInstructions} from '@prompts/proposalPolice/instructions';
import {EDIT_CHECK_RESPONSE_FORMAT, isEditCheckResponse} from '@prompts/proposalPolice/schema';
import type {EditCheckResponse} from '@prompts/proposalPolice/schema';

import fixtures from './fixtures/editCheck.json';
import {majority, PROPOSAL_POLICE_MODEL, RUNS_PER_FIXTURE, sampleFixture} from './runFixture';

/**
 * The fixtures record what the edit was, which the action turns into an action: a substantial edit gets
 * the banner, a minor one is left alone.
 */
const EXPECTED_ACTION: Record<string, string> = {
    SUBSTANTIAL: CONST.ACTION_EDIT,
    MINOR: CONST.NO_ACTION,
};

describe('edit check', () => {
    for (const fixture of fixtures) {
        test(
            `${fixture.id} → ${fixture.expectedAction}`,
            async () => {
                const samples = await sampleFixture(async (openAI) => {
                    const response = await openAI.promptResponses({
                        instructions: buildEditCheckInstructions(),
                        input: buildEditCheckInput(fixture.before, fixture.after),
                        model: PROPOSAL_POLICE_MODEL,
                        promptCacheKey: 'proposal-police-edit-check',
                        textFormat: EDIT_CHECK_RESPONSE_FORMAT,
                    });
                    return openAI.parseJSONResponse<EditCheckResponse>(response.text, isEditCheckResponse)?.action ?? 'UNPARSEABLE';
                });

                const {value, agreed} = majority(samples);
                const expected = EXPECTED_ACTION[fixture.expectedAction];
                console.log(`${fixture.id}: ${agreed}/${RUNS_PER_FIXTURE} → ${value} (expected ${expected}) — ${fixture.note}`);

                expect(value).toBe(expected);
            },
            {timeout: 120_000},
        );
    }
});
