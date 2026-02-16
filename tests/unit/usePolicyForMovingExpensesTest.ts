import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const USER_EMAIL = 'user@example.com';

function createValidPolicyForMovingExpenses(id: string, overrides: Partial<Policy> = {}): Policy {
    return {
        id,
        name: `Workspace ${id}`,
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        pendingAction: undefined,
        employeeList: {},
        isPolicyExpenseChatEnabled: true,
        customUnits: {},
        outputCurrency: 'USD',
        ...overrides,
    } as Policy;
}

describe('usePolicyForMovingExpenses', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('should return default values when no policies and no session', () => {
        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.policyForMovingExpenses).toBeUndefined();
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should return undefined policy when isTrackDistanceRequest is true and isMovingFromTrackExpense is false', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy = createValidPolicyForMovingExpenses('1');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(false, undefined, true, false), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.policyForMovingExpenses).toBeUndefined();
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should return single valid policy when user is member of one policy', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy = createValidPolicyForMovingExpenses('policy1');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBe('policy1');
        expect(result.current.policyForMovingExpenses?.id).toBe('policy1');
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should return shouldSelectPolicy true when user is member of more than one valid policy', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy1 = createValidPolicyForMovingExpenses('policy1');
        const policy2 = createValidPolicyForMovingExpenses('policy2');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy1.id}`, policy1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy2.id}`, policy2);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.policyForMovingExpenses).toBeUndefined();
        expect(result.current.shouldSelectPolicy).toBe(true);
    });

    it('should prefer expensePolicyID when provided and valid', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'activePolicy');
        const activePolicy = createValidPolicyForMovingExpenses('activePolicy');
        const expensePolicy = createValidPolicyForMovingExpenses('expensePolicy');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`, activePolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${expensePolicy.id}`, expensePolicy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(false, 'expensePolicy'), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBe('expensePolicy');
        expect(result.current.policyForMovingExpenses?.id).toBe('expensePolicy');
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should return active policy when expensePolicyID not provided and active policy is valid', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'activePolicy');
        const activePolicy = createValidPolicyForMovingExpenses('activePolicy');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`, activePolicy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBe('activePolicy');
        expect(result.current.policyForMovingExpenses?.id).toBe('activePolicy');
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should not return policy with pendingAction DELETE', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy = createValidPolicyForMovingExpenses('policy1', {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.policyForMovingExpenses).toBeUndefined();
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should not return personal policy as valid for moving expenses', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy = createValidPolicyForMovingExpenses('policy1', {
            type: CONST.POLICY.TYPE.PERSONAL,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.policyForMovingExpenses).toBeUndefined();
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should return single policy when only one of two policies is valid', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const validPolicy = createValidPolicyForMovingExpenses('valid');
        const invalidPolicy = createValidPolicyForMovingExpenses('invalid', {
            type: CONST.POLICY.TYPE.PERSONAL,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${validPolicy.id}`, validPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${invalidPolicy.id}`, invalidPolicy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBe('valid');
        expect(result.current.shouldSelectPolicy).toBe(false);
    });

    it('should return undefined when expensePolicyID is provided but policy is invalid', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy = createValidPolicyForMovingExpenses('policy1', {
            type: CONST.POLICY.TYPE.PERSONAL,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(false, 'policy1'), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBeUndefined();
        expect(result.current.policyForMovingExpenses).toBeUndefined();
    });

    it('should return policy when isTrackDistanceRequest is true but isMovingFromTrackExpense is true', async () => {
        await Onyx.set(ONYXKEYS.SESSION, {email: USER_EMAIL});
        const policy = createValidPolicyForMovingExpenses('policy1');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => usePolicyForMovingExpenses(false, undefined, true, true), {
            wrapper: OnyxListItemProvider,
        });

        expect(result.current.policyForMovingExpensesID).toBe('policy1');
        expect(result.current.shouldSelectPolicy).toBe(false);
    });
});
