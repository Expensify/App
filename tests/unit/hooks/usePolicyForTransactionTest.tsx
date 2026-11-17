import {renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import usePolicyForTransaction from '@hooks/usePolicyForTransaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const WORKSPACE_POLICY_ID = 'workspace-with-distance-rates';
const OTHER_POLICY_ID = 'some-other-workspace';
const WORKSPACE_CHAT_REPORT_ID = 'workspace-chat-report';

/** createRandomPolicy randomizes type/role/pendingAction, which usePolicyForMovingExpenses filters on - pin them. */
function createGroupPolicy(index: number, id: string): Policy {
    return {
        ...createRandomPolicy(index, CONST.POLICY.TYPE.TEAM),
        id,
        role: CONST.POLICY.ROLE.ADMIN,
        pendingAction: null,
    };
}

const workspacePolicy: Policy = {
    ...createGroupPolicy(1, WORKSPACE_POLICY_ID),
    customUnits: {
        unitID: {
            attributes: {unit: 'mi'},
            customUnitID: 'unitID',
            enabled: true,
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            rates: {
                rateID: {currency: 'USD', customUnitRateID: 'rateID', enabled: true, name: 'Default Rate', rate: 65.5},
            },
        },
    },
};

const otherPolicy: Policy = createGroupPolicy(2, OTHER_POLICY_ID);

/**
 * The state the Rate page is rendered with after "Track distance > Manual" and picking a workspace chat in the
 * in-place "To" picker: participants point at the workspace, the route report is still the self DM.
 */
const transactionOnWorkspaceChat: Transaction = {
    ...createRandomTransaction(1),
    reportID: WORKSPACE_CHAT_REPORT_ID,
    participants: [{accountID: 0, selected: true, isPolicyExpenseChat: true, policyID: WORKSPACE_POLICY_ID, reportID: WORKSPACE_CHAT_REPORT_ID}],
};

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

describe('usePolicyForTransaction', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${WORKSPACE_POLICY_ID}`, workspacePolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, otherPolicy);
        await waitForBatchedUpdates();
    });

    it('resolves the workspace picked in the "To" field when the route report still carries the fake self-DM policy', async () => {
        const {result} = renderHook(
            () =>
                usePolicyForTransaction({
                    transaction: transactionOnWorkspaceChat,
                    reportPolicyID: CONST.POLICY.ID_FAKE,
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.CREATE,
                }),
            {wrapper},
        );

        await waitFor(() => {
            expect(result.current.policy?.id).toBe(WORKSPACE_POLICY_ID);
        });
    });

    it('resolves the workspace picked in the "To" field when the route report has no policy at all', async () => {
        const {result} = renderHook(
            () =>
                usePolicyForTransaction({
                    transaction: transactionOnWorkspaceChat,
                    reportPolicyID: undefined,
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.CREATE,
                }),
            {wrapper},
        );

        await waitFor(() => {
            expect(result.current.policy?.id).toBe(WORKSPACE_POLICY_ID);
        });
    });

    it('keeps the route report authoritative while editing an existing expense', async () => {
        const {result} = renderHook(
            () =>
                usePolicyForTransaction({
                    transaction: transactionOnWorkspaceChat,
                    reportPolicyID: OTHER_POLICY_ID,
                    action: CONST.IOU.ACTION.EDIT,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                }),
            {wrapper},
        );

        await waitFor(() => {
            expect(result.current.policy?.id).toBe(OTHER_POLICY_ID);
        });
    });

    it('keeps the route report authoritative for a P2P participant', async () => {
        const p2pTransaction: Transaction = {
            ...createRandomTransaction(2),
            reportID: WORKSPACE_CHAT_REPORT_ID,
            participants: [{accountID: 1, selected: true}],
        };

        const {result} = renderHook(
            () =>
                usePolicyForTransaction({
                    transaction: p2pTransaction,
                    reportPolicyID: OTHER_POLICY_ID,
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                }),
            {wrapper},
        );

        await waitFor(() => {
            expect(result.current.policy?.id).toBe(OTHER_POLICY_ID);
        });
    });

    it('still hands a self DM track expense to the moving-expenses policy, not to the participants', async () => {
        await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, OTHER_POLICY_ID);
        await waitForBatchedUpdates();

        const selfDMTransaction: Transaction = {
            ...createRandomTransaction(3),
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            participants: [{accountID: 0, selected: true, isPolicyExpenseChat: true, policyID: WORKSPACE_POLICY_ID}],
        };

        const {result} = renderHook(
            () =>
                usePolicyForTransaction({
                    transaction: selfDMTransaction,
                    reportPolicyID: CONST.POLICY.ID_FAKE,
                    action: CONST.IOU.ACTION.CREATE,
                    iouType: CONST.IOU.TYPE.TRACK,
                }),
            {wrapper},
        );

        await waitFor(() => {
            expect(result.current.policy?.id).toBe(OTHER_POLICY_ID);
        });
    });
});
