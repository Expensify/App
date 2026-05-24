import {getUnixTime, subDays} from 'date-fns';
import Onyx from 'react-native-onyx';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const TEAM_POLICY_ID = '1001';
const OWNER_ACCOUNT_ID = 1;

function makePaidGroupPolicy(overrides?: Partial<Policy>): Policy {
    return {
        ...createRandomPolicy(Number(TEAM_POLICY_ID), CONST.POLICY.TYPE.TEAM),
        id: TEAM_POLICY_ID,
        ownerAccountID: OWNER_ACCOUNT_ID,
        isPolicyExpenseChatEnabled: true,
        ...overrides,
    };
}

const billingGraceEndPeriod: BillingGraceEndPeriod = {value: 0};

describe('shouldUseDefaultExpensePolicy', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns false when iouType is not CREATE', () => {
        const policy = makePaidGroupPolicy();
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.SUBMIT, policy, undefined, undefined, undefined)).toBeFalsy();
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.TRACK, policy, undefined, undefined, undefined)).toBeFalsy();
    });

    it('returns false when defaultExpensePolicy is null', () => {
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, null, undefined, undefined, undefined)).toBeFalsy();
    });

    it('returns false when defaultExpensePolicy is not a paid group policy (personal type)', () => {
        const policy = makePaidGroupPolicy({type: CONST.POLICY.TYPE.PERSONAL});
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, undefined, undefined, undefined)).toBeFalsy();
    });

    it('returns false when isPolicyExpenseChatEnabled is false', () => {
        const policy = makePaidGroupPolicy({isPolicyExpenseChatEnabled: false});
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, undefined, undefined, undefined)).toBeFalsy();
    });

    it('returns true when all conditions are met and user is not restricted', () => {
        const policy = makePaidGroupPolicy();
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, undefined, undefined, undefined)).toBeTruthy();
    });

    it('returns false when the user is restricted (owner past due with amount owed)', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {email: '', accountID: OWNER_ACCOUNT_ID},
        });
        await waitForBatchedUpdatesWithAct();

        const policy = makePaidGroupPolicy({ownerAccountID: OWNER_ACCOUNT_ID});
        const pastDueGracePeriodEnd = getUnixTime(subDays(new Date(), 3));
        const amountOwed = 500;

        // User is the owner, past due, and owes money → shouldRestrictUserBillableActions returns true
        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, amountOwed, undefined, pastDueGracePeriodEnd)).toBeFalsy();
    });

    it('returns true when the owner is past due but amount owed is 0', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {email: '', accountID: OWNER_ACCOUNT_ID},
        });
        await waitForBatchedUpdatesWithAct();

        const policy = makePaidGroupPolicy({ownerAccountID: OWNER_ACCOUNT_ID});
        const pastDueGracePeriodEnd = getUnixTime(subDays(new Date(), 3));

        expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, 0, undefined, pastDueGracePeriodEnd)).toBeTruthy();
    });

    it('returns false when a non-owner member workspace owner is past due', async () => {
        const memberAccountID = 2;
        const workspaceOwnerAccountID = 3;

        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {email: '', accountID: memberAccountID},
        });
        await waitForBatchedUpdatesWithAct();

        const policy = makePaidGroupPolicy({ownerAccountID: workspaceOwnerAccountID});
        const pastDueGracePeriodEnd = getUnixTime(subDays(new Date(), 3));
        const gracePeriodKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END}${workspaceOwnerAccountID}` as const;

        expect(
            shouldUseDefaultExpensePolicy(
                CONST.IOU.TYPE.CREATE,
                policy,
                undefined,
                {
                    [gracePeriodKey]: {...billingGraceEndPeriod, value: pastDueGracePeriodEnd},
                },
                undefined,
            ),
        ).toBeFalsy();
    });
});
