import {render} from '@testing-library/react-native';

import MoneyRequestHeaderSecondaryActions from '@components/MoneyRequestHeaderSecondaryActions';
import type * as OnyxListItemProvider from '@components/OnyxListItemProvider';

import useOnyx from '@hooks/useOnyx';
import useSingleExpenseReportView from '@hooks/useSingleExpenseReportView';

import getCentralPaneReportID from '@libs/Navigation/helpers/getCentralPaneReportID';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {navigateBackOnDeleteTransaction} from '@libs/ReportUtils';
// eslint-disable-next-line no-restricted-imports -- type-only namespace import, used solely to type jest.requireActual for the ReportUtils mock below
import type * as ReportUtils from '@libs/ReportUtils';

import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import type * as ReportActions from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

const TEST_THREAD_REPORT_ID = '1001';
const TEST_CHAT_REPORT_ID = '2002';
const TEST_IOU_REPORT_ID = '3003';
const TEST_TRANSACTION_ID = '4004';
const TEST_PARENT_ACTION_ID = '5005';
const CHAT_ROUTE = ROUTES.REPORT_WITH_ID.getRoute(TEST_CHAT_REPORT_ID);

const threadReport: Report = {...createRandomReport(1), reportID: TEST_THREAD_REPORT_ID, parentReportID: TEST_IOU_REPORT_ID, parentReportActionID: TEST_PARENT_ACTION_ID};
const iouReport: Report = {...createRandomReport(3), reportID: TEST_IOU_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, chatReportID: TEST_CHAT_REPORT_ID};
const transaction: Transaction = {...createRandomTransaction(4), transactionID: TEST_TRANSACTION_ID, reportID: TEST_IOU_REPORT_ID};

const parentReportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
    ...createRandomReportAction(5),
    reportActionID: TEST_PARENT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    reportID: TEST_IOU_REPORT_ID,
    childReportID: TEST_THREAD_REPORT_ID,
    originalMessage: {
        IOUTransactionID: TEST_TRANSACTION_ID,
        IOUReportID: TEST_IOU_REPORT_ID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: transaction.amount,
        currency: transaction.currency,
    },
    message: undefined,
    previousMessage: undefined,
};

let mockCapturedDropdownOptions: Array<{value: string; onSelected: (this: void) => void}> = [];

jest.mock('@components/ButtonWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: {options: Array<{value: string; onSelected: (this: void) => void}>}) => {
        mockCapturedDropdownOptions = props.options;
        return null;
    },
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        showConfirmModal: jest.fn(() => Promise.resolve({action: 'CONFIRM'})),
    })),
}));

const mockDeleteTransactions = jest.fn(() => ({action: 'deleted', deletedTransactionThreadReportIDs: []}));
jest.mock('@hooks/useDeleteTransactions', () => ({
    __esModule: true,
    default: jest.fn(() => ({deleteTransactions: mockDeleteTransactions, shouldOpenSplitExpenseEditFlowOnDelete: jest.fn(() => false)})),
}));

const mockIouReport = iouReport;
jest.mock('@hooks/useGetIOUReportFromReportAction', () => ({
    __esModule: true,
    default: jest.fn(() => ({iouReport: mockIouReport, chatReport: undefined, isChatIOUReportArchived: false})),
}));

jest.mock('@hooks/useReportTransactionsCollection', () => ({
    __esModule: true,
    default: jest.fn(() => ({})),
}));

// The expense is open in the RHP, on top of the single-expense report it belongs to.
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        isInNarrowPaneModal: true,
        isSmallScreenWidth: true,
        shouldUseNarrowLayout: true,
        isMediumScreenWidth: false,
        isLargeScreenWidth: false,
        isExtraSmallScreenWidth: false,
        isInLandscapeMode: false,
    })),
);

jest.mock('@hooks/useSingleExpenseReportView', () => jest.fn());

jest.mock('@libs/ReportSecondaryActionUtils', () => ({
    __esModule: true,
    getSecondaryTransactionThreadActions: jest.fn(() => ['delete']),
}));

jest.mock('@libs/Navigation/helpers/getCentralPaneReportID', () => jest.fn());

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    navigateBackOnDeleteTransaction: jest.fn(),
}));

jest.mock('@userActions/IOU/DeleteMoneyRequest', () => ({
    __esModule: true,
    getNavigationUrlOnMoneyRequestDelete: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof ReportActions>('@userActions/Report'),
    setDeleteTransactionNavigateBackUrl: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: jest.fn(() => ({key: 'test-route', name: 'Report', params: {}})),
}));

jest.mock('@hooks/useOnyx', () => jest.fn());

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldNavigateToUpgradePath: false, policyForMovingExpenses: undefined})),
}));

jest.mock('@hooks/useSplitEffectivePolicy', () => ({
    __esModule: true,
    default: jest.fn(() => undefined),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    ...jest.requireActual<typeof OnyxListItemProvider>('@components/OnyxListItemProvider'),
    __esModule: true,
    usePersonalDetails: jest.fn(() => ({})),
}));

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedUseSingleExpenseReportView = jest.mocked(useSingleExpenseReportView);
const mockedGetCentralPaneReportID = jest.mocked(getCentralPaneReportID);
const mockedGetNavigationUrlOnMoneyRequestDelete = jest.mocked(getNavigationUrlOnMoneyRequestDelete);
const mockedNavigateBackOnDeleteTransaction = jest.mocked(navigateBackOnDeleteTransaction);
const mockedSetDeleteTransactionNavigateBackUrl = jest.mocked(setDeleteTransactionNavigateBackUrl);

function mockSingleExpenseReportView(shouldUseTableViewForSingleExpense: boolean) {
    mockedUseSingleExpenseReportView.mockReturnValue({
        singleExpenseReportView: shouldUseTableViewForSingleExpense ? CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE : CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE,
        shouldUseTableViewForSingleExpense,
    });
}

async function pressDelete() {
    render(
        <MoneyRequestHeaderSecondaryActions
            reportID={TEST_THREAD_REPORT_ID}
            onBackButtonPress={() => {}}
        />,
    );
    mockCapturedDropdownOptions.find((option) => option.value === CONST.REPORT.SECONDARY_ACTIONS.DELETE)?.onSelected();

    // Let the confirm modal's promise resolve
    await new Promise<void>((resolve) => {
        process.nextTick(resolve);
    });
}

describe('MoneyRequestHeaderSecondaryActions More > Delete in the single-expense table view', () => {
    let dismissModalSpy: jest.SpyInstance;
    let navigateBackToLastSuperWideRHPScreenSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedDropdownOptions = [];
        dismissModalSpy = jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});
        navigateBackToLastSuperWideRHPScreenSpy = jest.spyOn(Navigation, 'navigateBackToLastSuperWideRHPScreen').mockImplementation(() => {});
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            callback();
            return {cancel: () => {}};
        });

        // Deleting the expense deletes its report, so the app should end up in the report's chat
        mockedGetNavigationUrlOnMoneyRequestDelete.mockReturnValue(CHAT_ROUTE);
        mockedUseOnyx.mockImplementation((key: string) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_THREAD_REPORT_ID}`) {
                return [threadReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${TEST_IOU_REPORT_ID}`) {
                return [iouReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${TEST_IOU_REPORT_ID}`) {
                return [{[TEST_PARENT_ACTION_ID]: parentReportAction}, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TEST_TRANSACTION_ID}`) {
                return [transaction, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('goes straight to the chat when the report sits in the central pane', async () => {
        // Given the table view, with the single-expense report in the central pane under the expense
        mockSingleExpenseReportView(true);
        mockedGetCentralPaneReportID.mockReturnValue(TEST_IOU_REPORT_ID);

        // When the user deletes the report's only expense from More > Delete
        await pressDelete();

        // Then the app goes back to the chat instead of revealing the report, which is about to be deleted
        expect(mockedSetDeleteTransactionNavigateBackUrl).toHaveBeenCalledWith(CHAT_ROUTE);
        expect(mockedNavigateBackOnDeleteTransaction).toHaveBeenCalledWith(CHAT_ROUTE);
        expect(navigateBackToLastSuperWideRHPScreenSpy).not.toHaveBeenCalled();
        expect(mockDeleteTransactions).toHaveBeenCalledWith([TEST_TRANSACTION_ID], undefined, undefined, undefined, true);
    });

    it('closes the RHP when the report sits in the super wide RHP', async () => {
        // Given the table view, with the single-expense report in the super wide RHP under the expense
        mockSingleExpenseReportView(true);
        mockedGetCentralPaneReportID.mockReturnValue(TEST_CHAT_REPORT_ID);

        // When the user deletes the report's only expense from More > Delete
        await pressDelete();

        // Then the RHP closes to reveal the screen the report was opened from, instead of going back to the report
        expect(dismissModalSpy).toHaveBeenCalled();
        expect(mockedNavigateBackOnDeleteTransaction).not.toHaveBeenCalled();
        expect(navigateBackToLastSuperWideRHPScreenSpy).not.toHaveBeenCalled();
        expect(mockDeleteTransactions).toHaveBeenCalled();
    });

    it('keeps going back to the report in the expense view', async () => {
        // Given the expense view, where a single-expense report shows its expense inline rather than under the RHP
        mockSingleExpenseReportView(false);

        // When the user deletes an expense from the RHP
        await pressDelete();

        // Then the existing behavior is kept
        expect(navigateBackToLastSuperWideRHPScreenSpy).toHaveBeenCalled();
        expect(mockedNavigateBackOnDeleteTransaction).not.toHaveBeenCalled();
        expect(dismissModalSpy).not.toHaveBeenCalled();
    });
});
