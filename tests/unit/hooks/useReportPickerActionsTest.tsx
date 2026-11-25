import {renderHook, waitFor} from '@testing-library/react-native';

import ActivePolicyProvider from '@components/ActivePolicyProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useReportPickerActions from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportPickerActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import {createPolicyExpenseChat, createRandomReport} from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({name: 'Dynamic_Money_Request_Report', params: {}})),
    getState: jest.fn(() => ({})),
    isReady: jest.fn(() => false),
    addListener: jest.fn(() => jest.fn()),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    navigationRef: {getCurrentRoute: jest.fn(() => ({name: 'Dynamic_Money_Request_Report', params: {}})), getState: jest.fn(() => ({}))},
    getActiveRoute: () => '',
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
}));

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const DEFAULT_POLICY_ID = '1';
const SELECTED_POLICY_ID = '2';
const WORKSPACE_CHAT_ID = '20';
const OPEN_REPORT_ID = '30';
const TRANSACTION_ID = '1';

function Wrapper({children}: {children: ReactNode}) {
    return (
        <OnyxListItemProvider>
            <ActivePolicyProvider>{children}</ActivePolicyProvider>
        </OnyxListItemProvider>
    );
}

function buildPolicy(policyID: string) {
    return {
        ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
        id: policyID,
        role: CONST.POLICY.ROLE.USER,
        pendingAction: null,
        employeeList: {[ACCOUNT_LOGIN]: {email: ACCOUNT_LOGIN, role: CONST.POLICY.ROLE.USER}},
    };
}

function buildTransaction(isFromGlobalCreate: boolean): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        amount: 0,
        currency: 'USD',
        created: '2025-08-29',
        merchant: '(none)',
        reportID: OPEN_REPORT_ID,
        isFromGlobalCreate,
        participants: [{accountID: 0, reportID: WORKSPACE_CHAT_ID, policyID: SELECTED_POLICY_ID, isPolicyExpenseChat: true, selected: true}],
    };
}

/** The current user has an open report in the non-default workspace's chat, and another workspace is set as default */
async function givenOwnOpenReportInNonDefaultWorkspace() {
    await Onyx.merge(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: ACCOUNT_LOGIN});
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${DEFAULT_POLICY_ID}`, buildPolicy(DEFAULT_POLICY_ID));
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SELECTED_POLICY_ID}`, buildPolicy(SELECTED_POLICY_ID));
    await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, DEFAULT_POLICY_ID);
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${WORKSPACE_CHAT_ID}`, {
        ...createPolicyExpenseChat(Number(WORKSPACE_CHAT_ID), true),
        reportID: WORKSPACE_CHAT_ID,
        policyID: SELECTED_POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        iouReportID: OPEN_REPORT_ID,
    });
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPEN_REPORT_ID}`, {
        ...createRandomReport(Number(OPEN_REPORT_ID), undefined),
        reportID: OPEN_REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        policyID: SELECTED_POLICY_ID,
        chatReportID: WORKSPACE_CHAT_ID,
        ownerAccountID: ACCOUNT_ID,
        managerID: ACCOUNT_ID,
    });
    await waitForBatchedUpdates();
}

function renderReportPickerActions(action: typeof CONST.IOU.ACTION.CREATE | typeof CONST.IOU.ACTION.EDIT, transaction: Transaction) {
    return renderHook(
        () =>
            useReportPickerActions({
                transaction,
                transactionID: TRANSACTION_ID,
                action,
                iouType: CONST.IOU.TYPE.SUBMIT,
                reportIDFromRoute: OPEN_REPORT_ID,
                goBack: jest.fn(),
            }),
        {wrapper: Wrapper},
    );
}

describe('useReportPickerActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('creates the new report in the workspace the expense is created in, not in the default workspace', async () => {
        // Given the user creates an expense from the chat of a non-default workspace that already has their open report
        await givenOwnOpenReportInNonDefaultWorkspace();

        // When the Report field opens the report picker
        const {result} = renderReportPickerActions(CONST.IOU.ACTION.CREATE, buildTransaction(false));
        await waitForBatchedUpdates();

        // Then "Create report" targets that workspace, because the listed reports also come from it (issue #107683)
        await waitFor(() => expect(result.current.listProps.transactionPolicyID).toBe(SELECTED_POLICY_ID));
        expect(result.current.listProps.selectedPolicyID).toBe(SELECTED_POLICY_ID);
    });

    it('lets the default workspace apply when the expense is created from global create', async () => {
        // Given the user starts the expense from global create, which doesn't tie it to a workspace
        await givenOwnOpenReportInNonDefaultWorkspace();

        // When the Report field opens the report picker
        const {result} = renderReportPickerActions(CONST.IOU.ACTION.CREATE, buildTransaction(true));
        await waitForBatchedUpdates();

        // Then no workspace is forced, so "Create report" falls back to the default workspace
        expect(result.current.listProps.transactionPolicyID).toBeUndefined();
    });

    it('lets the default workspace apply when the user moves their own expense', async () => {
        // Given the user edits the report of their own existing expense
        await givenOwnOpenReportInNonDefaultWorkspace();

        // When the report picker opens for editing
        const {result} = renderReportPickerActions(CONST.IOU.ACTION.EDIT, buildTransaction(false));
        await waitForBatchedUpdates();

        // Then no workspace is forced, so moving to a new report keeps using the default workspace
        expect(result.current.listProps.transactionPolicyID).toBeUndefined();
    });
});
