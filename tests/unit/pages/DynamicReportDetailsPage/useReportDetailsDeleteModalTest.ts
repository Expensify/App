import {act, renderHook} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {navigateBackOnDeleteTransaction} from '@libs/ReportUtils';

import useReportDetailsDeleteModal from '@pages/DynamicReportDetailsPage/hooks/useReportDetailsDeleteModal';
import type {ReportDetailsRequestData} from '@pages/DynamicReportDetailsPage/types';
import {CASES} from '@pages/DynamicReportDetailsPage/types';

import {getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU/DeleteMoneyRequest';
import {getNavigationUrlAfterTrackExpenseDelete} from '@userActions/IOU/TrackExpense';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';

import {StackActions} from '@react-navigation/native';

import createMock from '../../../utils/createMock';

const mockShowConfirmModal = jest.fn();
const mockGetRootState = jest.fn();
const mockDispatch = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: () => 2}),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getTopmostSearchReportRouteParams: jest.fn(),
        goBack: jest.fn(),
        dismissModal: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn(),
    },
    navigationRef: {
        getRootState: () => mockGetRootState() as unknown,
        dispatch: (action: unknown) => mockDispatch(action) as unknown,
    },
}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {runAfterTransitions: jest.fn()},
}));
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'),
    navigateBackOnDeleteTransaction: jest.fn(),
}));
jest.mock('@userActions/IOU/DeleteMoneyRequest', () => ({
    getNavigationUrlOnMoneyRequestDelete: jest.fn(),
}));
jest.mock('@userActions/IOU/TrackExpense', () => ({
    getNavigationUrlAfterTrackExpenseDelete: jest.fn(),
}));
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Report'),
    setDeleteTransactionNavigateBackUrl: jest.fn(),
}));

const REPORT_ID = '30';
const TRANSACTION_ID = '1000';
const RHP_KEY = 'rhp-key';
const BACK_URL = ROUTES.REPORT_WITH_ID.getRoute('20');

function buildIOUAction(type: typeof CONST.IOU.REPORT_ACTION_TYPE.CREATE | typeof CONST.IOU.REPORT_ACTION_TYPE.TRACK): ReportAction {
    return createMock<ReportAction>({
        reportActionID: '100',
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {type, IOUTransactionID: TRANSACTION_ID, amount: 1000, currency: CONST.CURRENCY.USD},
    });
}

function buildRequestData(overrides: Partial<ReportDetailsRequestData> = {}): ReportDetailsRequestData {
    return createMock<ReportDetailsRequestData>({
        requestParentReportAction: buildIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE),
        iouTransactionID: TRANSACTION_ID,
        isSingleTransactionView: true,
        shouldOpenSplitExpenseEditFlowOnDelete: () => false,
        ...overrides,
    });
}

function setRHPRoutes(routes: Array<{name: string; params?: Record<string, unknown>}>) {
    mockGetRootState.mockReturnValue({routes: [{state: {key: RHP_KEY, routes}}]});
}

async function confirmDelete(requestData: ReportDetailsRequestData | undefined, onDelete: () => void) {
    const {result} = renderHook(() => useReportDetailsDeleteModal(REPORT_ID, CASES.MONEY_REQUEST));
    await act(async () => {
        await result.current(requestData, onDelete);
    });
}

describe('useReportDetailsDeleteModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
        jest.mocked(Navigation.getTopmostSearchReportRouteParams).mockReturnValue(undefined);
        jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mockImplementation((callback: () => void) => callback());
        jest.mocked(TransitionTracker.runAfterTransitions).mockImplementation(({callback}) => {
            callback?.();
            return {cancel: () => {}};
        });
        jest.mocked(getNavigationUrlOnMoneyRequestDelete).mockReturnValue(undefined);
        jest.mocked(getNavigationUrlAfterTrackExpenseDelete).mockReturnValue(undefined);
        setRHPRoutes([{name: SCREENS.RIGHT_MODAL.REPORT_DETAILS}]);
    });

    it('should not navigate or delete when the user cancels the confirm modal', async () => {
        // Given the user dismisses the confirm modal instead of confirming it
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        const onDelete = jest.fn();

        // When the delete is requested
        await confirmDelete(buildRequestData(), onDelete);

        // Then nothing is deleted and the page stays where it is
        expect(onDelete).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(navigateBackOnDeleteTransaction).not.toHaveBeenCalled();
    });

    it('should run the delete without navigating when deleting opens the split edit flow', async () => {
        // Given a split expense, where deleting hands over to the split edit flow instead of removing the expense
        const onDelete = jest.fn();
        const requestData = buildRequestData({shouldOpenSplitExpenseEditFlowOnDelete: () => true});

        // When the delete is confirmed
        await confirmDelete(requestData, onDelete);

        // Then the split edit flow starts right away and the page does not navigate back on its own
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(navigateBackOnDeleteTransaction).not.toHaveBeenCalled();
    });

    it('should close the RHP when the super wide RHP directly below shows the deleted expense', async () => {
        // Given the super wide RHP right below the details page shows this same report
        setRHPRoutes([{name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {reportID: REPORT_ID}}, {name: SCREENS.RIGHT_MODAL.REPORT_DETAILS}]);
        const onDelete = jest.fn();

        // When the delete is confirmed
        await confirmDelete(buildRequestData(), onDelete);

        // Then the whole RHP closes, because the expense below it is gone, and the delete runs after the transition
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(navigateBackOnDeleteTransaction).not.toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should pop back to the super wide RHP when the expense was opened from a Search report inside it', async () => {
        // Given the details page sits on a Search report of this expense, which was opened from the super wide RHP
        setRHPRoutes([
            {name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {reportID: '10'}},
            {name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {reportID: REPORT_ID}},
            {name: SCREENS.RIGHT_MODAL.REPORT_DETAILS},
        ]);

        // When the delete is confirmed
        await confirmDelete(buildRequestData(), jest.fn());

        // Then the RHP stack pops back to the super wide RHP instead of closing it
        expect(mockDispatch).toHaveBeenCalledWith({...StackActions.pop(2), target: RHP_KEY});
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('should navigate to the track expense URL when the deleted expense is a tracked expense', async () => {
        // Given a tracked expense whose delete leads back to a known report
        jest.mocked(getNavigationUrlAfterTrackExpenseDelete).mockReturnValue(BACK_URL);
        const requestData = buildRequestData({requestParentReportAction: buildIOUAction(CONST.IOU.REPORT_ACTION_TYPE.TRACK)});

        // When the delete is confirmed
        await confirmDelete(requestData, jest.fn());

        // Then the back URL comes from the track expense helper, is stored for the not-found guard, and is navigated to
        expect(getNavigationUrlOnMoneyRequestDelete).not.toHaveBeenCalled();
        expect(setDeleteTransactionNavigateBackUrl).toHaveBeenCalledWith(BACK_URL);
        expect(navigateBackOnDeleteTransaction).toHaveBeenCalledWith(BACK_URL);
    });

    it('should close the RHP when there is no URL to navigate back to', async () => {
        // Given a money request delete for which no back URL can be resolved
        jest.mocked(getNavigationUrlOnMoneyRequestDelete).mockReturnValue(undefined);

        // When the delete is confirmed
        await confirmDelete(buildRequestData(), jest.fn());

        // Then the RHP closes instead of navigating to a report
        expect(getNavigationUrlOnMoneyRequestDelete).toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(setDeleteTransactionNavigateBackUrl).not.toHaveBeenCalled();
        expect(navigateBackOnDeleteTransaction).not.toHaveBeenCalled();
    });
});
