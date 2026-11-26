import {act, render} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ReportFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ReportFieldDropdown';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ReportPickerModalProps} from '@components/ReportPicker/ReportPickerModal';

import {setTransactionReport} from '@libs/actions/Transaction';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import getOnyxValue from '../../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

// Only the write matters here, so the action is stubbed to record what it is asked to save.
jest.mock('@libs/actions/Transaction', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Transaction'),
    setTransactionReport: jest.fn(),
}));

jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: jest.fn(() => ({getCurrencyDecimals: jest.fn(() => 2), getCurrencySymbol: jest.fn(() => '$')}))}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));

const mockIsBetaEnabled = jest.fn<boolean, [string]>(() => false);
jest.mock('@hooks/usePermissions', () => {
    const actualUsePermissions = jest.requireActual<{default: () => Record<string, unknown>}>('@hooks/usePermissions').default;
    return () => ({...actualUsePermissions(), isBetaEnabled: mockIsBetaEnabled});
});

// Where a new report may go, and whether the workspace is behind on billing. Each test sets the case it needs rather than
// building the policies and billing state the real hooks read.
let mockPolicyForMovingExpenses: Policy | undefined;
let mockShouldSelectPolicy = false;
// The workspace each caller says the expense has to stay on, which decides where a new report is made.
let mockExpensePolicyIDs: Array<string | undefined> = [];
jest.mock('@hooks/usePolicyForMovingExpenses', () => (isPerDiemRequest?: boolean, isTimeRequest?: boolean, expensePolicyID?: string) => {
    mockExpensePolicyIDs.push(expensePolicyID);
    return {
        policyForMovingExpensesID: mockPolicyForMovingExpenses?.id,
        policyForMovingExpenses: mockPolicyForMovingExpenses,
        shouldSelectPolicy: mockShouldSelectPolicy,
        shouldNavigateToUpgradePath: false,
        arePoliciesLoaded: true,
    };
});
let mockIsCreateReportRestricted = false;
jest.mock('@pages/iou/request/step/IOURequestStepReport/hooks/useCreateReportRestrictionCheck', () => () => () => mockIsCreateReportRestricted);

// The list itself is covered by the ReportPickerModal and full-page tests; here only what the dropdown hands it, and what it does with a pick, matter.
let mockModalProps: ReportPickerModalProps | undefined;
jest.mock('@components/ReportPicker/ReportPickerModal', () => (props: ReportPickerModalProps) => {
    mockModalProps = props;
    return null;
});

const TRANSACTION_ID = '1';
const POLICY_ID = 'policy1';
const CHAT_REPORT_ID = 'chat1';
const CURRENT_REPORT_ID = 'report1';
const OTHER_REPORT_ID = 'report2';

const chatReport: Report = {reportID: CHAT_REPORT_ID, policyID: POLICY_ID, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, iouReportID: CURRENT_REPORT_ID};
// An open report, so a new expense can join it on its own.
const currentReport: Report = {
    reportID: CURRENT_REPORT_ID,
    policyID: POLICY_ID,
    chatReportID: CHAT_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: 1,
    managerID: 1,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
};
const otherReport: Report = {reportID: OTHER_REPORT_ID, policyID: POLICY_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE};
const CURRENT_USER_ACCOUNT_ID = 5;
const SELF_DM_REPORT_ID = 'selfDM1';
const selfDMReport: Report = {reportID: SELF_DM_REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM, type: CONST.REPORT.TYPE.CHAT, ownerAccountID: CURRENT_USER_ACCOUNT_ID};

// The expense types a test renders the form with: a regular expense, or the tracked one None leaves behind.
type FormIOUType = typeof CONST.IOU.TYPE.SUBMIT | typeof CONST.IOU.TYPE.TRACK;

// The screen that owns the form's route switches its expense type, which a field inside a tab can't reach with `useRoute`.
const mockIOUTypeChange = jest.fn();

const getDropdown = (onClose: jest.Mock, isVisible = true, iouType: FormIOUType = CONST.IOU.TYPE.SUBMIT) => (
    <OnyxListItemProvider>
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={CHAT_REPORT_ID}
            action={CONST.IOU.ACTION.CREATE}
            iouType={iouType}
            isPolicyExpenseChat
            onIOUTypeChange={mockIOUTypeChange}
        >
            <ReportFieldDropdown
                isVisible={isVisible}
                onClose={onClose}
                anchorPosition={{horizontal: 0, vertical: 0}}
                anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                shouldMeasureAnchorPositionFromTop
                shouldSwitchPositionIfOverflow={false}
                popoverWidth={CONST.POPOVER_DROPDOWN_WIDTH}
                popoverHeight={CONST.POPOVER_DROPDOWN_MAX_HEIGHT}
                transactionID={TRANSACTION_ID}
            />
        </ConfirmationFieldsProvider>
    </OnyxListItemProvider>
);

const renderDropdown = (onClose: jest.Mock, isVisible = true, iouType?: FormIOUType) => render(getDropdown(onClose, isVisible, iouType));

const setDraftExpense = async () => {
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
        transactionID: TRANSACTION_ID,
        reportID: CURRENT_REPORT_ID,
        participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
    });
    await waitForBatchedUpdates();
};

describe('ReportFieldDropdown', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockModalProps = undefined;
        mockPolicyForMovingExpenses = undefined;
        mockShouldSelectPolicy = false;
        mockIsCreateReportRestricted = false;
        mockIsBetaEnabled.mockReturnValue(false);
        jest.mocked(setTransactionReport).mockClear();
        // Each navigate-away test spies on the navigation and transition tracker; nothing keeps those spies between tests.
        jest.restoreAllMocks();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, chatReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CURRENT_REPORT_ID}`, currentReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_REPORT_ID}`, otherReport);
        await waitForBatchedUpdates();
    });

    it('moves the draft expense to the picked report at once and closes', async () => {
        // Given a draft expense being created in a workspace chat whose open report is `report1`
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the report row's dropdown opens and the user picks `report2`
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        expect(mockModalProps?.selectedReportID).toBe(CURRENT_REPORT_ID);
        expect(mockModalProps?.transactionIDs).toEqual([TRANSACTION_ID]);
        await act(async () => {
            mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID});
        });

        // Then the draft is moved to `report2` straight away, with no screen transition to wait for, and the container closes
        expect(setTransactionReport).toHaveBeenCalledTimes(1);
        expect(setTransactionReport).toHaveBeenCalledWith(
            TRANSACTION_ID,
            {reportID: OTHER_REPORT_ID, participants: [{selected: true, accountID: 0, isPolicyExpenseChat: true, reportID: CHAT_REPORT_ID, policyID: POLICY_ID}]},
            true,
        );
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('moves an expense started from the global create button the same way', async () => {
        // Given a draft expense started from the global create button, which the full page handles through its own path
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            isFromGlobalCreate: true,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the user picks `report2` in the dropdown
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID}));

        // Then the draft is moved to `report2` and the container closes, without the page's navigation
        expect(setTransactionReport).toHaveBeenCalledWith(TRANSACTION_ID, expect.objectContaining({reportID: OTHER_REPORT_ID}), true);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('puts the draft expense on the self DM when no report is picked', async () => {
        // Given a draft expense being created in a workspace chat, by a user with a self DM
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user@test.com'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport);
        await setDraftExpense();
        mockIOUTypeChange.mockClear();
        const onClose = jest.fn();

        // When the report row's dropdown opens and the user picks None
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.selectNoReport?.());
        await waitForBatchedUpdates();

        // Then the draft goes on no report and to the self DM, where it is saved unreported, the screen owning the form is
        // told it now holds a tracked expense, even when the form is a tab of the start page, and the container closes
        expect(setTransactionReport).toHaveBeenCalledWith(TRANSACTION_ID, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID}, true);
        const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
        expect(draft?.participants).toEqual([expect.objectContaining({reportID: SELF_DM_REPORT_ID, isSelfDM: true})]);
        expect(mockIOUTypeChange).toHaveBeenCalledWith(CONST.IOU.TYPE.TRACK);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('makes the form a regular expense again when a report is picked after no report', async () => {
        // Given a draft expense that None already moved to the self DM, so the form holds a tracked expense
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user@test.com'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            participants: [{reportID: SELF_DM_REPORT_ID, isSelfDM: true, selected: true}],
        });
        await waitForBatchedUpdates();
        mockIOUTypeChange.mockClear();
        jest.mocked(setTransactionReport).mockClear();
        const onClose = jest.fn();

        // When the report row's dropdown opens again and the user picks a workspace report
        renderDropdown(onClose, true, CONST.IOU.TYPE.TRACK);
        await waitForBatchedUpdates();
        await act(async () => {
            mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID});
        });

        // Then the draft goes back on the workspace chat, and the form stops being a tracked expense, which would
        // otherwise be tracked on the workspace chat when confirmed
        expect(setTransactionReport).toHaveBeenCalledWith(
            TRANSACTION_ID,
            {reportID: OTHER_REPORT_ID, participants: [{selected: true, accountID: 0, isPolicyExpenseChat: true, reportID: CHAT_REPORT_ID, policyID: POLICY_ID}]},
            true,
        );
        expect(mockIOUTypeChange).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('makes a new report on the workspace of the chat the expense was started in after no report was picked', async () => {
        // Given a draft expense started in a workspace chat, which None then moved to the self DM, leaving it with no
        // workspace of its own
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user@test.com'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            participants: [{reportID: SELF_DM_REPORT_ID, isSelfDM: true, selected: true}],
        });
        await waitForBatchedUpdates();
        mockExpensePolicyIDs = [];

        // When the report row's dropdown opens again
        renderDropdown(jest.fn(), true, CONST.IOU.TYPE.TRACK);
        await waitForBatchedUpdates();

        // Then a new report is asked for on the chat's workspace, where the listed reports are, instead of being left to
        // the user's default workspace
        expect(mockModalProps?.selectedPolicyID).toBe(POLICY_ID);
        expect(mockExpensePolicyIDs).toContain(POLICY_ID);
    });

    it("gives a distance expense a rate of the picked report's workspace after no report was picked", async () => {
        // Given a distance expense that None moved to the self DM, so it holds a rate the report's workspace doesn't have
        const WORKSPACE_RATE_ID = 'workspaceRate';
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'user@test.com'});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, selfDMReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            ...createRandomPolicy(1),
            id: POLICY_ID,
            customUnits: {
                distanceUnit: {
                    customUnitID: 'distanceUnit',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                    rates: {[WORKSPACE_RATE_ID]: {customUnitRateID: WORKSPACE_RATE_ID, name: 'Default', rate: 70, enabled: true, currency: CONST.CURRENCY.USD}},
                },
            },
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            participants: [{reportID: SELF_DM_REPORT_ID, isSelfDM: true, selected: true}],
            comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT, customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE, customUnitRateID: 'defaultWorkspaceRate'}},
        });
        await waitForBatchedUpdates();

        // When the user picks a report on that workspace
        renderDropdown(jest.fn(), true, CONST.IOU.TYPE.TRACK);
        await waitForBatchedUpdates();
        await act(async () => {
            mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID});
        });
        await waitForBatchedUpdates();

        // Then the expense takes the workspace's rate, rather than leaving the form with a rate error to fix by hand
        const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
        expect(draft?.comment?.customUnit?.customUnitRateID).toBe(WORKSPACE_RATE_ID);
    });

    it('keeps a regular expense as it is when another report is picked', async () => {
        // Given a draft expense on a workspace report, which was never moved to the self DM
        await setDraftExpense();
        mockIOUTypeChange.mockClear();

        // When the user picks another report
        renderDropdown(jest.fn());
        await waitForBatchedUpdates();
        await act(async () => {
            mockModalProps?.selectReport({value: OTHER_REPORT_ID, keyForList: OTHER_REPORT_ID, policyID: POLICY_ID});
        });

        // Then the form's expense type is left alone, since only None changes it
        expect(mockIOUTypeChange).not.toHaveBeenCalled();
    });

    it('does not offer no report for a per diem expense, which only exists on a workspace', async () => {
        // Given a per diem draft expense being created in a workspace chat
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();

        // When the report row's dropdown opens
        renderDropdown(jest.fn());
        await waitForBatchedUpdates();

        // Then the list is not handed the option
        expect(mockModalProps).toBeDefined();
        expect(mockModalProps?.selectNoReport).toBeUndefined();
    });

    it('only closes when the current report is picked again', async () => {
        // Given a draft expense already on `report1`
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CURRENT_REPORT_ID,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When `report1` is picked again
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.selectReport({value: CURRENT_REPORT_ID, keyForList: CURRENT_REPORT_ID, policyID: POLICY_ID}));

        // Then nothing is written and the container closes
        expect(setTransactionReport).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('moves a scan in the ASAP submit beta to the open report the chat points at when the user picks it', async () => {
        // Given the user is in the ASAP submit beta, and a scan is being created in a workspace chat that points at an open report.
        // Saving a scan in this beta starts a new report, so the Report field shows New report even though the chat points at `report1`.
        mockIsBetaEnabled.mockImplementation((beta: string) => beta === CONST.BETAS.ASAP_SUBMIT);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: CHAT_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            participants: [{policyID: POLICY_ID, reportID: CHAT_REPORT_ID, isPolicyExpenseChat: true, selected: true}],
        });
        await waitForBatchedUpdates();
        const onClose = jest.fn();

        // When the report row's dropdown opens and the user picks `report1`
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        await act(async () => {
            mockModalProps?.selectReport({value: CURRENT_REPORT_ID, keyForList: CURRENT_REPORT_ID, policyID: POLICY_ID});
        });

        // Then the list doesn't mark `report1`, matching the field, and picking it moves the draft there, so saving adds the scan to it
        // instead of starting a new report
        expect(mockModalProps?.selectedReportID).not.toBe(CURRENT_REPORT_ID);
        expect(setTransactionReport).toHaveBeenCalledWith(TRANSACTION_ID, expect.objectContaining({reportID: CURRENT_REPORT_ID}), true);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not reevaluate unchanged beta permissions when only the draft amount changes', async () => {
        // Given a mounted picker with a stable permissions function, as provided by usePermissions
        await setDraftExpense();
        renderDropdown(jest.fn());
        await waitForBatchedUpdates();
        expect(mockIsBetaEnabled).toHaveBeenCalledWith(CONST.BETAS.ASAP_SUBMIT);
        mockIsBetaEnabled.mockClear();

        // When unrelated draft data makes the picker hook render again
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {amount: 100});
            await waitForBatchedUpdates();
        });

        // Then the compiler reuses the unchanged beta result instead of evaluating permissions again
        expect(mockIsBetaEnabled).not.toHaveBeenCalled();
    });

    it('mounts the list only while the container is open or still closing', async () => {
        // Given a draft expense and the report row's dropdown, which the row keeps mounted once it has been opened
        await setDraftExpense();
        const onClose = jest.fn();

        // When the dropdown is mounted closed
        const view = renderDropdown(onClose, false);
        await waitForBatchedUpdates();

        // Then the list is not mounted, so its collection subscriptions and reconnect fetches cost the form nothing
        expect(mockModalProps).toBeUndefined();

        // When the row opens the container
        view.rerender(getDropdown(onClose, true));
        await waitForBatchedUpdates();

        // Then the list is mounted and shown
        expect(mockModalProps?.isVisible).toBe(true);

        // When the container closes and finishes its exit animation
        view.rerender(getDropdown(onClose, false));
        await waitForBatchedUpdates();
        expect(mockModalProps?.isVisible).toBe(false);
        const {onModalHide} = mockModalProps ?? {};
        mockModalProps = undefined;
        act(() => onModalHide?.());

        // Then the list is unmounted again, and nothing renders it while it stays closed
        expect(mockModalProps).toBeUndefined();
    });

    it('closes the container before navigating to the restricted-action page for a workspace behind on billing', async () => {
        // Given a draft expense whose new report would go to a workspace that is restricted for billing, and a container that
        // tracks its closing transition, which the test runs through at once
        await setDraftExpense();
        const policy: Policy = {...createRandomPolicy(1), id: POLICY_ID};
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        mockPolicyForMovingExpenses = policy;
        mockIsCreateReportRestricted = true;
        const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const runAfterTransitions = jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            callback();
            return {cancel: () => {}};
        });
        const onClose = jest.fn();

        // When the user picks New report in the dropdown
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.createReport?.());

        // Then the container closes first, and the restricted-action page is opened only once that close has finished, so the
        // sheet never sits over the new screen
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(POLICY_ID));
        expect(onClose.mock.invocationCallOrder.at(0)).toBeLessThan(navigate.mock.invocationCallOrder.at(0) ?? 0);
    });

    it('closes the container before navigating to the workspace selection for a new report', async () => {
        // Given a draft expense by a member of several workspaces, so a new report first needs a workspace picked
        await setDraftExpense();
        mockShouldSelectPolicy = true;
        const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const runAfterTransitions = jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            callback();
            return {cancel: () => {}};
        });
        const onClose = jest.fn();

        // When the user picks New report in the dropdown
        renderDropdown(onClose);
        await waitForBatchedUpdates();
        act(() => mockModalProps?.createReport?.());

        // Then the container closes first and the workspace selection opens once that close has finished
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(navigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute(true)));
        expect(onClose.mock.invocationCallOrder.at(0)).toBeLessThan(navigate.mock.invocationCallOrder.at(0) ?? 0);
    });
});
