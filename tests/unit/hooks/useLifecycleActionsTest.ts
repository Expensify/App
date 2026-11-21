import {act, renderHook} from '@testing-library/react-native';

import useLifecycleActions from '@hooks/useLifecycleActions';

import {approveMoneyRequest} from '@libs/actions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 12345;
const REPORT_ID = '1';

jest.mock('@libs/actions/IOU/ReportWorkflow', () => ({
    approveMoneyRequest: jest.fn(),
    reopenReport: jest.fn(),
    retractReport: jest.fn(),
    submitReport: jest.fn(),
    unapproveExpenseReport: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        accountID: 12345,
        email: 'approver@expensify.com',
        login: 'approver@expensify.com',
    })),
}));

jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({
    __esModule: true,
    default: jest.fn(() => ({transactions: {}, violations: {}})),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: jest.fn(() => ({
        isDelegateAccessRestricted: false,
    })),
    useDelegateNoAccessActions: jest.fn(() => ({
        showDelegateNoAccessModal: jest.fn(),
    })),
}));

jest.mock('@components/ReportSubmitToPopoverAnchor', () => ({
    useOpenReportSubmitToPopover: jest.fn(() => jest.fn()),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: jest.fn(() => ({currentSearchQueryJSON: undefined, currentSearchKey: undefined})),
    useSearchResultsContext: jest.fn(() => ({currentSearchResults: undefined})),
    useSearchSelectionContext: jest.fn(() => ({selectedTransactionIDs: []})),
    useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: jest.fn()})),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: jest.fn(() => ({showConfirmModal: jest.fn()})),
}));

describe('useLifecycleActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    async function approveReport(type: string) {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            type,
            managerID: ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        await waitForBatchedUpdates();

        const startApprovedAnimation = jest.fn();
        const {result} = renderHook(() =>
            useLifecycleActions({
                reportID: REPORT_ID,
                startApprovedAnimation,
                startAnimation: jest.fn(),
                startSubmittingAnimation: jest.fn(),
                onHoldMenuOpen: jest.fn(),
            }),
        );
        await waitForBatchedUpdates();

        act(() => {
            result.current.confirmApproval();
        });

        const onApproved = jest.mocked(approveMoneyRequest).mock.calls.at(0)?.at(0)?.onApproved;
        onApproved?.();
        return startApprovedAnimation;
    }

    it('starts the approved animation for an expense report', async () => {
        // Given an expense report waiting on the current user's approval
        // When the user approves it from the More menu
        const startApprovedAnimation = await approveReport(CONST.REPORT.TYPE.EXPENSE);

        // Then the header plays the approved animation, which AnimatedSettlementButton ends
        expect(startApprovedAnimation).toHaveBeenCalled();
    });

    it('does not start the approved animation for a bill', async () => {
        // Given a bill waiting on the current user's approval
        // When the user approves it from the More menu
        const startApprovedAnimation = await approveReport(CONST.REPORT.TYPE.BILL);

        // Then no animation starts, because bills don't show Pay and nothing would end the animation
        expect(jest.mocked(approveMoneyRequest)).toHaveBeenCalled();
        expect(startApprovedAnimation).not.toHaveBeenCalled();
    });
});
