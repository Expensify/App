import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {addPolicyAgentRule, clearPolicyAgentRuleErrors, clearPolicyCodingRuleErrors, deletePolicyAgentRule, updatePolicyAgentRule} from '@libs/actions/Policy/Rules';
import {WRITE_COMMANDS} from '@libs/API/types';
import {flush as flushSequentialQueue} from '@libs/Network/SequentialQueue';

import {getAll as getAllPersistedRequests, getOngoingRequest as getOngoingPersistedRequest, save as savePersistedRequest} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {AgentRule, CodingRule} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();

const ERROR_KEY = 'error123';

function getPolicy(policyID: string): Promise<Policy | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
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

    describe('addPolicyAgentRule', () => {
        it('optimistically adds the agent rule with a pending ADD action, then clears it on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const prompt = 'Flag any expense over $1000';

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            addPolicyAgentRule(fakePolicy.id, agentRuleID, prompt);
            await waitForBatchedUpdates();

            let policy = await getPolicy(fakePolicy.id);
            const optimisticRule = policy?.rules?.agentRules?.[agentRuleID];
            expect(optimisticRule?.ruleID).toBe(agentRuleID);
            expect(optimisticRule?.prompt).toBe(prompt);
            expect(optimisticRule?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(optimisticRule?.errors).toBeFalsy();

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            policy = await getPolicy(fakePolicy.id);
            const finalRule = policy?.rules?.agentRules?.[agentRuleID];
            expect(finalRule?.prompt).toBe(prompt);
            expect(finalRule?.pendingAction).toBeFalsy();
            expect(finalRule?.errors).toBeFalsy();
        });

        it('sets an error on the agent rule when the request fails', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule2';
            const prompt = 'Reject duplicates';

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            mockFetch?.fail?.();

            addPolicyAgentRule(fakePolicy.id, agentRuleID, prompt);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const failedRule = policy?.rules?.agentRules?.[agentRuleID];
            expect(failedRule?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(Object.keys(failedRule?.errors ?? {}).length).toBeGreaterThan(0);
        });

        it('is a no-op when required params are missing', async () => {
            const fakePolicy = createRandomPolicy(0);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            addPolicyAgentRule('', 'id', 'p');
            addPolicyAgentRule(fakePolicy.id, '', 'p');
            addPolicyAgentRule(fakePolicy.id, 'id', '');
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules).toBeFalsy();
        });

        // Regression coverage for https://github.com/Expensify/App/issues/96588.
        //
        // A rule created while offline is sent once when the queue flushes. If the user hits "Clear cache and
        // restart" while that request is still on the wire, clearOnyxAndResetApp replays it from its queue
        // snapshot — rollbackOngoingRequest can move the request back into the queue but cannot cancel the HTTP
        // call already in flight. The replay therefore sends AddPolicyAgentRule a second time with the same
        // client-generated agentRuleID. Auth is idempotent for that pair and answers with a success, which must
        // leave the already-created rule clean instead of painting an error on it. Genuine failures still surface.
        describe('replaying an ambiguous in-flight AddPolicyAgentRule', () => {
            /**
             * Creates the rule with the response held so the AddPolicyAgentRule request is captured while it is
             * still in flight — the ambiguous state clearOnyxAndResetApp snapshots via rollbackOngoingRequest()
             * followed by getAll(). The held response is then released, so the call already on the wire lands and
             * the rule really is created server-side.
             */
            async function createRuleAndCaptureInFlightRequest(policyID: string, agentRuleID: string, prompt: string) {
                mockFetch?.pause?.();
                addPolicyAgentRule(policyID, agentRuleID, prompt);
                await waitForBatchedUpdates();

                // An in-flight request lives in ongoingRequest, not in persistedRequests — that is exactly why
                // clearOnyxAndResetApp has to roll it back into the queue before snapshotting.
                const inFlightRequest = getOngoingPersistedRequest();
                expect(inFlightRequest?.command).toBe(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE);

                await mockFetch?.resume?.();
                await waitForBatchedUpdates();

                return inFlightRequest;
            }

            /** Re-saves the snapshotted request and flushes, mirroring clearOnyxAndResetApp's replay step. */
            async function replay(snapshot: ReturnType<typeof getOngoingPersistedRequest>) {
                if (!snapshot) {
                    throw new Error('Expected an in-flight AddPolicyAgentRule request to replay');
                }

                savePersistedRequest(snapshot);
                await waitForBatchedUpdates();

                flushSequentialQueue();
                await waitForBatchedUpdates();
            }

            it('leaves the rule clean and drains the queue when the replay is answered idempotently', async () => {
                const fakePolicy = createRandomPolicy(0);
                const agentRuleID = 'agentRuleReplay';
                const prompt = 'Flag anything from a blocked merchant';

                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

                const snapshot = await createRuleAndCaptureInFlightRequest(fakePolicy.id, agentRuleID, prompt);

                // Exactly one send so far, and the rule is clean because that send really created it.
                TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, 1);
                expect((await getPolicy(fakePolicy.id))?.rules?.agentRules?.[agentRuleID]?.errors).toBeFalsy();

                // Auth answers the duplicate with a success, so the replay takes the normal successData path.
                await replay(snapshot);

                // The replay actually reached the wire, and it carried the same client-generated agentRuleID as
                // the first send. Without these assertions the test would still pass if replay() did nothing at
                // all, because the rule would already be clean from the first send.
                TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, 2);
                TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, 0, {policyID: fakePolicy.id, agentRuleID, prompt});
                TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, 1, {policyID: fakePolicy.id, agentRuleID, prompt});

                const rule = (await getPolicy(fakePolicy.id))?.rules?.agentRules?.[agentRuleID];
                expect(rule?.prompt).toBe(prompt);
                expect(rule?.pendingAction).toBeFalsy();
                expect(rule?.errors).toBeFalsy();

                // The replay was drained rather than retried.
                expect(getAllPersistedRequests().filter((persistedRequest) => persistedRequest.command === WRITE_COMMANDS.ADD_POLICY_AGENT_RULE)).toHaveLength(0);
            });

            it('still surfaces an error when the replay fails for an unrelated reason', async () => {
                const fakePolicy = createRandomPolicy(0);
                const agentRuleID = 'agentRuleReplayGenericFailure';
                const prompt = 'Require a receipt over $75';

                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

                const snapshot = await createRuleAndCaptureInFlightRequest(fakePolicy.id, agentRuleID, prompt);

                mockFetch?.fail?.();
                await replay(snapshot);

                // Same guard as above: prove the replay went out before asserting on its outcome.
                TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, 2);
                TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.ADD_POLICY_AGENT_RULE, 1, {policyID: fakePolicy.id, agentRuleID, prompt});

                const rule = (await getPolicy(fakePolicy.id))?.rules?.agentRules?.[agentRuleID];
                expect(rule?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(Object.keys(rule?.errors ?? {}).length).toBeGreaterThan(0);
            });
        });
    });

    describe('updatePolicyAgentRule', () => {
        it('optimistically updates the prompt, clears the stale title, and clears the pending action on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const previousPrompt = 'Old prompt';
            const newPrompt = 'New prompt';

            const seededRule: AgentRule = {
                ruleID: agentRuleID,
                prompt: previousPrompt,
                title: 'Old title',
                created: '2026-06-08T00:00:00.000Z',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: seededRule}},
            });

            mockFetch?.pause?.();
            updatePolicyAgentRule(fakePolicy.id, agentRuleID, newPrompt, previousPrompt, seededRule.title);
            await waitForBatchedUpdates();

            let policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]?.prompt).toBe(newPrompt);
            expect(policy?.rules?.agentRules?.[agentRuleID]?.title).toBeFalsy();
            expect(policy?.rules?.agentRules?.[agentRuleID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]?.prompt).toBe(newPrompt);
            // The title stays cleared after success; the regenerated title arrives via a server Onyx update, not successData.
            expect(policy?.rules?.agentRules?.[agentRuleID]?.title).toBeFalsy();
            expect(policy?.rules?.agentRules?.[agentRuleID]?.pendingAction).toBeFalsy();
            expect(policy?.rules?.agentRules?.[agentRuleID]?.errors).toBeFalsy();
        });

        it('reverts the prompt and title to the previous values and sets an error on failure', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const previousPrompt = 'Original';
            const previousTitle = 'Original title';
            const newPrompt = 'Attempted';

            const seededRule: AgentRule = {
                ruleID: agentRuleID,
                prompt: previousPrompt,
                title: previousTitle,
                created: '2026-06-08T00:00:00.000Z',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: seededRule}},
            });

            mockFetch?.fail?.();
            updatePolicyAgentRule(fakePolicy.id, agentRuleID, newPrompt, previousPrompt, previousTitle);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const rule = policy?.rules?.agentRules?.[agentRuleID];
            expect(rule?.prompt).toBe(previousPrompt);
            expect(rule?.title).toBe(previousTitle);
            expect(rule?.pendingAction).toBeFalsy();
            expect(Object.keys(rule?.errors ?? {}).length).toBeGreaterThan(0);
        });

        it('is a no-op when required params are missing', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const seededRule: AgentRule = {
                ruleID: agentRuleID,
                prompt: 'Original',
                created: '2026-06-08T00:00:00.000Z',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: seededRule}},
            });

            updatePolicyAgentRule(fakePolicy.id, agentRuleID, '', 'Original');
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]?.prompt).toBe('Original');
            expect(policy?.rules?.agentRules?.[agentRuleID]?.pendingAction).toBeFalsy();
        });
    });

    describe('deletePolicyAgentRule', () => {
        it('optimistically marks DELETE then removes the rule on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const seededRule: AgentRule = {
                ruleID: agentRuleID,
                prompt: 'p',
                created: '2026-06-08T00:00:00.000Z',
            };
            const policyWithRule: Policy = {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: seededRule}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, policyWithRule);

            mockFetch?.pause?.();
            deletePolicyAgentRule(policyWithRule, agentRuleID);
            await waitForBatchedUpdates();

            let policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]).toBeFalsy();
        });

        it('restores the rule and sets an error on failure', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const seededRule: AgentRule = {
                ruleID: agentRuleID,
                prompt: 'keep me',
                created: '2026-06-08T00:00:00.000Z',
            };
            const policyWithRule: Policy = {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: seededRule}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, policyWithRule);

            mockFetch?.fail?.();
            deletePolicyAgentRule(policyWithRule, agentRuleID);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const rule = policy?.rules?.agentRules?.[agentRuleID];
            expect(rule?.prompt).toBe('keep me');
            expect(rule?.pendingAction).toBeFalsy();
            expect(Object.keys(rule?.errors ?? {}).length).toBeGreaterThan(0);
        });

        it('is a no-op when required params are missing', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const policyWithRule: Policy = {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: {ruleID: agentRuleID, prompt: 'p', created: '2026-06-08T00:00:00.000Z'}}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, policyWithRule);

            deletePolicyAgentRule(policyWithRule, '');
            deletePolicyAgentRule({...policyWithRule, id: ''}, agentRuleID);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]?.pendingAction).toBeFalsy();
        });
    });

    describe('clearPolicyAgentRuleErrors', () => {
        it('removes the rule entirely when its pendingAction was ADD', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const rule: AgentRule = {
                ruleID: agentRuleID,
                prompt: 'p',
                created: '2026-06-08T00:00:00.000Z',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                errors: {[ERROR_KEY]: 'boom'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: rule}},
            });

            clearPolicyAgentRuleErrors(fakePolicy.id, agentRuleID, rule);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules?.[agentRuleID]).toBeFalsy();
        });

        it('clears only the errors when the rule has a non-ADD pending action', async () => {
            const fakePolicy = createRandomPolicy(0);
            const agentRuleID = 'agentRule1';
            const rule: AgentRule = {
                ruleID: agentRuleID,
                prompt: 'p',
                created: '2026-06-08T00:00:00.000Z',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: {[ERROR_KEY]: 'boom'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {
                ...fakePolicy,
                rules: {agentRules: {[agentRuleID]: rule}},
            });

            clearPolicyAgentRuleErrors(fakePolicy.id, agentRuleID, rule);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            const cleared = policy?.rules?.agentRules?.[agentRuleID];
            expect(cleared?.errors).toBeFalsy();
            expect(cleared?.prompt).toBe('p');
            expect(cleared?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('does nothing when no rule is passed', async () => {
            const fakePolicy = createRandomPolicy(0);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            clearPolicyAgentRuleErrors(fakePolicy.id, 'missing', undefined);
            await waitForBatchedUpdates();

            const policy = await getPolicy(fakePolicy.id);
            expect(policy?.rules?.agentRules).toBeFalsy();
        });
    });

    describe('clearPolicyCodingRuleErrors', () => {
        it('removes the coding rule entirely when its pendingAction was ADD', async () => {
            const fakePolicy = createRandomPolicy(0);
            const ruleID = 'codingRule1';
            const rule: CodingRule = {
                ruleID,
                filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'},
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
                filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'},
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
