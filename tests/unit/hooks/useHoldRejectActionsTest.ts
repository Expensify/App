import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useHoldRejectActions from '@hooks/useHoldRejectActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TEST_REPORT_ID = '1';
const TEST_ACCOUNT_ID = 12345;
const TEST_EMAIL = 'test@expensify.com';

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]) => mockNavigate(...args),
    },
}));

const mockShowDelegateNoAccessModal = jest.fn();
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: mockShowDelegateNoAccessModal})),
}));

jest.mock('@components/MoneyReportTransactionThreadContext', () => ({
    __esModule: true,
    useMoneyReportTransactionThread: jest.fn(() => ({iouTransactionID: undefined, requestParentReportAction: undefined})),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: TEST_ACCOUNT_ID, login: TEST_EMAIL, email: TEST_EMAIL})),
}));

jest.mock('@hooks/useGetIOUReportFromReportAction', () => ({
    __esModule: true,
    default: jest.fn(() => ({iouReport: undefined, chatReport: undefined, isChatIOUReportArchived: false})),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(() => ({translate: jest.fn((key: string) => key)})),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    __esModule: true,
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Stopwatch: 'Stopwatch', ThumbsDown: 'ThumbsDown'})),
}));

jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    isCurrentUserSubmitter: jest.fn(() => false),
    isDM: jest.fn(() => false),
    changeMoneyRequestHoldStatus: jest.fn(),
}));

const DelegateProvider = require('@components/DelegateNoAccessModalProvider') as Record<string, jest.Mock>;

const mockReport: Report = {
    reportID: TEST_REPORT_ID,
    chatReportID: '2',
    policyID: '3',
    type: CONST.REPORT.TYPE.EXPENSE,
} as Report;

function renderRejectActions() {
    const onHoldEducationalOpen = jest.fn();
    const onRejectModalOpen = jest.fn();
    const {result} = renderHook(() =>
        useHoldRejectActions({
            reportID: TEST_REPORT_ID,
            onHoldEducationalOpen,
            onRejectModalOpen,
        }),
    );
    return {result, onHoldEducationalOpen, onRejectModalOpen};
}

describe('useHoldRejectActions - report-level reject', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        DelegateProvider.useDelegateNoAccessState.mockReturnValue({isDelegateAccessRestricted: false});
        DelegateProvider.useDelegateNoAccessActions.mockReturnValue({showDelegateNoAccessModal: mockShowDelegateNoAccessModal});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${TEST_REPORT_ID}`, mockReport);
    });

    it('opens the educational modal when the reject explanation has not been dismissed', async () => {
        await Onyx.merge(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, false);
        await waitForBatchedUpdates();

        const {result, onRejectModalOpen} = renderRejectActions();
        result.current[CONST.REPORT.SECONDARY_ACTIONS.REJECT].onSelected?.();

        expect(onRejectModalOpen).toHaveBeenCalledWith(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_REPORT);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates straight to the reject page when the reject explanation has been dismissed', async () => {
        await Onyx.merge(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, true);
        await waitForBatchedUpdates();

        const {result, onRejectModalOpen} = renderRejectActions();
        result.current[CONST.REPORT.SECONDARY_ACTIONS.REJECT].onSelected?.();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REJECT_EXPENSE_REPORT.getRoute(TEST_REPORT_ID));
        expect(onRejectModalOpen).not.toHaveBeenCalled();
    });

    it('shows the delegate no-access modal and does nothing else when delegate access is restricted', async () => {
        DelegateProvider.useDelegateNoAccessState.mockReturnValue({isDelegateAccessRestricted: true});
        await Onyx.merge(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, false);
        await waitForBatchedUpdates();

        const {result, onRejectModalOpen} = renderRejectActions();
        result.current[CONST.REPORT.SECONDARY_ACTIONS.REJECT].onSelected?.();

        expect(mockShowDelegateNoAccessModal).toHaveBeenCalled();
        expect(onRejectModalOpen).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
