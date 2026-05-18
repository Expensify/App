import {act, renderHook} from '@testing-library/react-native';
// eslint-disable-next-line no-restricted-imports -- required to stub InteractionManager for synchronous test execution
import {InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import useReportSelectionActions from '@pages/iou/request/step/IOURequestStepReport/hooks/useReportSelectionActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {createExpenseReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/Transaction', () => ({
    changeTransactionsReport: jest.fn(),
    setTransactionReport: jest.fn(),
}));

const mockChangeTransactionsReport = jest.mocked(changeTransactionsReport);
const mockRemoveTransaction = jest.fn();

jest.mock('@libs/actions/IOU', () => ({
    setCustomUnitID: jest.fn(),
    setCustomUnitRateID: jest.fn(),
}));

jest.mock('@libs/actions/IOU/PerDiem', () => ({
    clearSubrates: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchActionsContext: () => ({
        removeTransaction: mockRemoveTransaction,
    }),
}));

const CURRENT_USER_ID = 1;
const SOURCE_REPORT_ID = 'source-report-1';
const DESTINATION_REPORT_ID = 'destination-report-1';
const TRANSACTION_ID = 'transaction-1';
const POLICY_ID = 'policy-1';

describe('useReportSelectionActions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ID, email: 'test@example.com'},
            },
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
        jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation((task) => {
            if (typeof task === 'function') {
                task();
            }
            return {
                then: (onfulfilled?: () => void) => {
                    onfulfilled?.();
                    return Promise.resolve();
                },
                done: () => undefined,
                cancel: jest.fn(),
            };
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('forwards originalReport and policyTagList when editing and selecting a new report', async () => {
        const sourceReport: Report = {
            ...createExpenseReport(6),
            reportID: SOURCE_REPORT_ID,
            ownerAccountID: CURRENT_USER_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            currency: CONST.CURRENCY.USD,
        };
        const destinationReport: Report = {
            ...createExpenseReport(7),
            reportID: DESTINATION_REPORT_ID,
            ownerAccountID: CURRENT_USER_ID,
            policyID: POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            currency: CONST.CURRENCY.USD,
            pendingFields: {
                createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        };
        const transaction = {
            ...createRandomTransaction(1),
            transactionID: TRANSACTION_ID,
            reportID: SOURCE_REPORT_ID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SOURCE_REPORT_ID}`, sourceReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${DESTINATION_REPORT_ID}`, destinationReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`, {});

        const handleGoBack = jest.fn();
        const {result} = renderHook(() =>
            useReportSelectionActions({
                transaction,
                transactions: [transaction],
                allPolicies: {},
                perDiemOriginalPolicy: undefined,
                isPerDiemTransaction: false,
                isEditing: true,
                isASAPSubmitBetaEnabled: false,
                session: {accountID: CURRENT_USER_ID, email: 'test@example.com'},
                transactionID: TRANSACTION_ID,
                iouType: CONST.IOU.TYPE.SUBMIT,
                action: CONST.IOU.ACTION.EDIT,
                reportIDFromRoute: SOURCE_REPORT_ID,
                personalPolicyID: undefined,
                backTo: undefined,
                handleGoBack,
            }),
        );

        act(() => {
            result.current.handleRegularReportSelection({value: DESTINATION_REPORT_ID, keyForList: DESTINATION_REPORT_ID}, destinationReport);
        });
        await waitForBatchedUpdates();

        expect(handleGoBack).toHaveBeenCalled();
        expect(mockChangeTransactionsReport).toHaveBeenCalledWith(
            expect.objectContaining({
                newReport: destinationReport,
                originalReport: expect.objectContaining({
                    reportID: SOURCE_REPORT_ID,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                }),
                policyTagList: {},
            }),
        );
        expect(mockRemoveTransaction).toHaveBeenCalledWith(TRANSACTION_ID);
    });
});
