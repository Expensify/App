import Onyx from 'react-native-onyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {addPolicyAIRule, clearPolicyAIRuleErrors, clearPolicyCodingRuleErrors, deletePolicyAIRule, updatePolicyAIRule} from '@libs/actions/Policy/Rules';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {AIRule, CodingRule} from '@src/types/onyx/Policy';
import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

const ERROR_KEY = 'error123';

function getPolicy(policyID: string): Promise<Policy | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            waitForCollectionCallback: false,
            callback: (policy) => {
                Onyx.disconnect(connection);
                resolve(policy);
            },
        });
    });
}

describe('actions/PolicyRules', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('addPolicyAIRule', () => {
        it('optimistically adds the AI rule with a pending ADD action, then clears it on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const prompt = 'Flag any expense over $1000';

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            addPolicyAIRule(fakePolicy.id, aiRuleID, prompt);
            await waitForBatchedUpdates();

            let policy = await getPolicy(fakePolicy.id);
            const optimisticRule = policy?.rules?.aiRules?.[aiRuleID];
            expect(optimisticRule?.ruleID).toBe(aiRuleID);
            expect(optimisticRule?.prompt).toBe(prompt);
            expect(optimisticRule?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(optimisticRule?.errors).toBeFalsy();

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            policy = await getPolicy(fakePolicy.id);
            const finalRule = policy?.rules?.aiRules?.[aiRuleID];
            expect(finalRule?.prompt).toBe(prompt);
            expect(finalRule?.pendingAction).toBeFalsy();
            expect(finalRule?.errors).toBeFalsy();
        });

        it('sets an error on the AI rule when the request fails', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule2';
            const prompt = 'Reject duplicates';

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            mockFetch?.fail?.();

            addPolicyAIRule(fakePolicy.id, aiRuleID, prompt);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const failedRule = policy?.rules?.aiRules?.[aiRuleID];
            expect(failedRule?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(Object.keys(failedRule?.errors ?? {}).length).toBeGreaterThan(0);
        });

        it('is a no-op when required params are missing', async () => {
            const fakePolicy = createRandomPolicy(0);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            addPolicyAIRule('', 'id', 'p');
            addPolicyAIRule(fakePolicy.id, '', 'p');
            addPolicyAIRule(fakePolicy.id, 'id', '');
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules).toBeFalsy();
        });
    });

    describe('updatePolicyAIRule', () => {
        it('optimistically updates the prompt and clears the pending action on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const previousPrompt = 'Old prompt';
            const newPrompt = 'New prompt';

            const seededRule: AIRule = {
                ruleID: aiRuleID,
                prompt: previousPrompt,
                created: '2026-06-08T00:00:00.000Z',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: seededRule}},
            });

            mockFetch?.pause?.();
            updatePolicyAIRule(fakePolicy.id, aiRuleID, newPrompt, previousPrompt);
            await waitForBatchedUpdates();

            let policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.prompt).toBe(newPrompt);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.prompt).toBe(newPrompt);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.pendingAction).toBeFalsy();
            expect(policy?.rules?.aiRules?.[aiRuleID]?.errors).toBeFalsy();
        });

        it('reverts the prompt to the previous value and sets an error on failure', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const previousPrompt = 'Original';
            const newPrompt = 'Attempted';

            const seededRule: AIRule = {
                ruleID: aiRuleID,
                prompt: previousPrompt,
                created: '2026-06-08T00:00:00.000Z',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: seededRule}},
            });

            mockFetch?.fail?.();
            updatePolicyAIRule(fakePolicy.id, aiRuleID, newPrompt, previousPrompt);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const rule = policy?.rules?.aiRules?.[aiRuleID];
            expect(rule?.prompt).toBe(previousPrompt);
            expect(rule?.pendingAction).toBeFalsy();
            expect(Object.keys(rule?.errors ?? {}).length).toBeGreaterThan(0);
        });

        it('is a no-op when required params are missing', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const seededRule: AIRule = {
                ruleID: aiRuleID,
                prompt: 'Original',
                created: '2026-06-08T00:00:00.000Z',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: seededRule}},
            });

            updatePolicyAIRule(fakePolicy.id, aiRuleID, '', 'Original');
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.prompt).toBe('Original');
            expect(policy?.rules?.aiRules?.[aiRuleID]?.pendingAction).toBeFalsy();
        });
    });

    describe('deletePolicyAIRule', () => {
        it('optimistically marks DELETE then removes the rule on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const seededRule: AIRule = {
                ruleID: aiRuleID,
                prompt: 'p',
                created: '2026-06-08T00:00:00.000Z',
            };
            const policyWithRule: Policy = {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: seededRule}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, policyWithRule);

            mockFetch?.pause?.();
            deletePolicyAIRule(policyWithRule, aiRuleID);
            await waitForBatchedUpdates();

            let policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]).toBeFalsy();
        });

        it('restores the rule and sets an error on failure', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const seededRule: AIRule = {
                ruleID: aiRuleID,
                prompt: 'keep me',
                created: '2026-06-08T00:00:00.000Z',
            };
            const policyWithRule: Policy = {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: seededRule}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, policyWithRule);

            mockFetch?.fail?.();
            deletePolicyAIRule(policyWithRule, aiRuleID);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const rule = policy?.rules?.aiRules?.[aiRuleID];
            expect(rule?.prompt).toBe('keep me');
            expect(rule?.pendingAction).toBeFalsy();
            expect(Object.keys(rule?.errors ?? {}).length).toBeGreaterThan(0);
        });

        it('is a no-op when required params are missing', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const policyWithRule: Policy = {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: {ruleID: aiRuleID, prompt: 'p', created: '2026-06-08T00:00:00.000Z'}}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, policyWithRule);

            deletePolicyAIRule(policyWithRule, '');
            deletePolicyAIRule({...policyWithRule, id: ''}, aiRuleID);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]?.pendingAction).toBeFalsy();
        });
    });

    describe('clearPolicyAIRuleErrors', () => {
        it('removes the rule entirely when its pendingAction was ADD', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const rule: AIRule = {
                ruleID: aiRuleID,
                prompt: 'p',
                created: '2026-06-08T00:00:00.000Z',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errors: {[ERROR_KEY]: 'boom'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: rule}},
            });

            clearPolicyAIRuleErrors(fakePolicy.id, aiRuleID, rule);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules?.[aiRuleID]).toBeFalsy();
        });

        it('clears only the errors when the rule has a non-ADD pending action', async () => {
            const fakePolicy = createRandomPolicy(0);
            const aiRuleID = 'aiRule1';
            const rule: AIRule = {
                ruleID: aiRuleID,
                prompt: 'p',
                created: '2026-06-08T00:00:00.000Z',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: {[ERROR_KEY]: 'boom'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {aiRules: {[aiRuleID]: rule}},
            });

            clearPolicyAIRuleErrors(fakePolicy.id, aiRuleID, rule);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const cleared = policy?.rules?.aiRules?.[aiRuleID];
            expect(cleared?.errors).toBeFalsy();
            expect(cleared?.prompt).toBe('p');
            expect(cleared?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('does nothing when no rule is passed', async () => {
            const fakePolicy = createRandomPolicy(0);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            clearPolicyAIRuleErrors(fakePolicy.id, 'missing', undefined);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.aiRules).toBeFalsy();
        });
    });

    describe('clearPolicyCodingRuleErrors', () => {
        it('removes the coding rule entirely when its pendingAction was ADD', async () => {
            const fakePolicy = createRandomPolicy(0);
            const ruleID = 'codingRule1';
            const rule: CodingRule = {
                ruleID,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errors: {[ERROR_KEY]: 'boom'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {codingRules: {[ruleID]: rule}},
            });

            clearPolicyCodingRuleErrors(fakePolicy.id, ruleID, rule);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.codingRules?.[ruleID]).toBeFalsy();
        });

        it('clears only the errors when the coding rule has a non-ADD pending action', async () => {
            const fakePolicy = createRandomPolicy(0);
            const ruleID = 'codingRule1';
            const rule: CodingRule = {
                ruleID,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: {[ERROR_KEY]: 'boom'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {codingRules: {[ruleID]: rule}},
            });

            clearPolicyCodingRuleErrors(fakePolicy.id, ruleID, rule);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const cleared = policy?.rules?.codingRules?.[ruleID];
            expect(cleared?.errors).toBeFalsy();
            expect(cleared?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('does nothing when no rule is passed', async () => {
            const fakePolicy = createRandomPolicy(0);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            clearPolicyCodingRuleErrors(fakePolicy.id, 'missing', undefined);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.codingRules).toBeFalsy();
        });
    });
});
