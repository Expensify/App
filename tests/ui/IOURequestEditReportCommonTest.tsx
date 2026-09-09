import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const FAKE_REPORT_ID = '1';
const FAKE_POLICY_ID = '1';
const FAKE_TRANSACTION_ID = '2';
const FAKE_EMAIL = 'fake@gmail.com';
const FAKE_ACCOUNT_ID = 1;
const FAKE_SECOND_ACCOUNT_ID = 2;
const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: mockShowConfirmModal,
}));

/**
 * Helper function to render the IOURequestEditReportCommon component with required providers.
 * This encapsulates the component setup and makes tests more readable.
 */
const renderIOURequestEditReportCommon = ({
    selectedReportID = '',
    selectedPolicyID,
    transactionPolicyID,
    transactionIDs,
    isManualDistanceRequest = false,
    isOdometerDistanceRequest = false,
    isPerDiemRequest = false,
    selectReport = jest.fn(),
    createReport,
}: {
    selectedReportID: string;
    selectedPolicyID?: string;
    transactionPolicyID?: string;
    transactionIDs?: string[];
    isManualDistanceRequest?: boolean;
    isOdometerDistanceRequest?: boolean;
    isPerDiemRequest?: boolean;
    selectReport?: jest.Mock;
    createReport?: jest.Mock;
}) =>
    render(
        <NavigationContainer>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <IOURequestEditReportCommon
                    selectedReportID={selectedReportID}
                    selectedPolicyID={selectedPolicyID}
                    transactionPolicyID={transactionPolicyID}
                    transactionIDs={transactionIDs}
                    isManualDistanceRequest={isManualDistanceRequest}
                    isOdometerDistanceRequest={isOdometerDistanceRequest}
                    selectReport={selectReport}
                    createReport={createReport}
                    backTo=""
                    isPerDiemRequest={isPerDiemRequest}
                />
            </ComposeProviders>
        </NavigationContainer>,
    );

describe('IOURequestEditReportCommon', () => {
    describe('RBR', () => {
        beforeAll(() => {
            // Initialize Onyx with test configuration
            Onyx.init({
                keys: ONYXKEYS,
                initialKeyStates: {
                    [ONYXKEYS.SESSION]: {accountID: FAKE_ACCOUNT_ID, email: FAKE_EMAIL},
                },
            });
            initOnyxDerivedValues();
            return waitForBatchedUpdatesWithAct();
        });

        beforeEach(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                        reportID: FAKE_REPORT_ID,
                        reportName: 'Expense Report',
                        ownerAccountID: FAKE_ACCOUNT_ID,
                        policyID: FAKE_POLICY_ID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    },
                });
            });
            return waitForBatchedUpdatesWithAct();
        });

        afterEach(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            jest.clearAllMocks();
            return waitForBatchedUpdatesWithAct();
        });

        it('should not show DotIndicator when the report has brickRoadIndicator', async () => {
            // Given a transaction report
            const mockTransactionReport: Report = {
                reportID: FAKE_TRANSACTION_ID,
                reportName: 'Transaction Report',
                ownerAccountID: FAKE_ACCOUNT_ID,
                policyID: FAKE_POLICY_ID,
            };

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockTransactionReport.reportID}`, mockTransactionReport);
            });
            await waitForBatchedUpdatesWithAct();

            // When the component is rendered with the transaction reports
            renderIOURequestEditReportCommon({selectedReportID: mockTransactionReport.reportID, selectedPolicyID: mockTransactionReport.policyID});
            await waitForBatchedUpdatesWithAct();

            // Then the expense report should be displayed
            const reportItem = screen.getByText('Expense Report');
            expect(reportItem).toBeTruthy();

            // Then do not show RBR
            const dotIndicators = screen.queryAllByTestId(CONST.DOT_INDICATOR_TEST_ID);
            expect(dotIndicators).toHaveLength(0);
        });

        const setUpCommuterExclusionTest = async () => {
            const currentReport: Report = {
                reportID: 'currentReport',
                reportName: 'Current Report',
                ownerAccountID: FAKE_ACCOUNT_ID,
                policyID: 'currentPolicy',
            };
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReport.reportID}`, currentReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, {
                    ...createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: undefined,
                    commuterExclusions: {
                        method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                        fixedDistance: 1,
                        fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    },
                });
            });
            await waitForBatchedUpdatesWithAct();

            return currentReport;
        };

        it.each([
            ['a manual', {isManualDistanceRequest: true}],
            ['an odometer', {isOdometerDistanceRequest: true}],
        ])('blocks moving %s distance expense to a report with commuter exclusions', async (_distanceType, requestTypeProps) => {
            const currentReport = await setUpCommuterExclusionTest();
            const selectReport = jest.fn();

            renderIOURequestEditReportCommon({selectedReportID: currentReport.reportID, transactionIDs: [FAKE_TRANSACTION_ID], selectReport, ...requestTypeProps});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText('Expense Report'));

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(selectReport).not.toHaveBeenCalled();
        });

        it('allows moving a GPS distance expense to a report with commuter exclusions', async () => {
            const currentReport = await setUpCommuterExclusionTest();
            const selectReport = jest.fn();

            renderIOURequestEditReportCommon({selectedReportID: currentReport.reportID, transactionIDs: [FAKE_TRANSACTION_ID], selectReport});
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText('Expense Report'));

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(selectReport).toHaveBeenCalledTimes(1);
        });

        it('blocks creating a report for a manual distance expense with commuter exclusions', async () => {
            const currentReport = await setUpCommuterExclusionTest();
            const createReport = jest.fn();

            renderIOURequestEditReportCommon({
                selectedReportID: currentReport.reportID,
                transactionPolicyID: FAKE_POLICY_ID,
                transactionIDs: [FAKE_TRANSACTION_ID],
                isManualDistanceRequest: true,
                createReport,
            });
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByText('Create report'), {});

            expect(createReport).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('blocks moving a per diem expense to a report whose policy is missing its custom unit', async () => {
            const currentReport: Report = {
                reportID: 'currentReport',
                reportName: 'Current Report',
                ownerAccountID: FAKE_ACCOUNT_ID,
                policyID: 'currentPolicy',
            };

            // Given a destination policy that accepts per diem expenses, but not through the custom unit this expense uses
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReport.reportID}`, currentReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, {
                    ...createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                    role: CONST.POLICY.ROLE.ADMIN,
                    pendingAction: undefined,
                    customUnits: {
                        destinationUnit: {
                            customUnitID: 'destinationUnit',
                            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                            enabled: true,
                            attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                            rates: {},
                        },
                    },
                });
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${FAKE_TRANSACTION_ID}`, {
                    transactionID: FAKE_TRANSACTION_ID,
                    reportID: currentReport.reportID,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                    comment: {customUnit: {customUnitID: 'unitMissingFromDestination'}},
                });
            });
            await waitForBatchedUpdatesWithAct();

            const selectReport = jest.fn();

            renderIOURequestEditReportCommon({selectedReportID: currentReport.reportID, transactionIDs: [FAKE_TRANSACTION_ID], isPerDiemRequest: true, selectReport});
            await waitForBatchedUpdatesWithAct();

            // When the destination report is selected
            fireEvent.press(screen.getByText('Expense Report'));

            // Then the move is blocked and the warning is shown through the global confirm modal
            expect(selectReport).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: translateLocal('iou.moveExpensesError'),
                    shouldShowCancelButton: false,
                }),
            );
        });
    });

    describe('NotFound', () => {
        beforeAll(() => {
            // Initialize Onyx with test configuration
            Onyx.init({
                keys: ONYXKEYS,
                initialKeyStates: {
                    [ONYXKEYS.SESSION]: {accountID: FAKE_SECOND_ACCOUNT_ID, email: FAKE_EMAIL},
                },
            });
        });

        beforeEach(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: {
                        ...createRandomPolicy(Number(FAKE_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                        role: CONST.POLICY.ROLE.USER,
                    },
                    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                        reportID: FAKE_REPORT_ID,
                        reportName: 'Expense Report',
                        ownerAccountID: FAKE_ACCOUNT_ID,
                        policyID: FAKE_POLICY_ID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    },
                });
            });
            return waitForBatchedUpdatesWithAct();
        });

        afterEach(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            jest.clearAllMocks();
            return waitForBatchedUpdatesWithAct();
        });

        it('should display not found page when the report is Open and the user is not the owner or admin', async () => {
            // Given a transaction report
            const mockTransactionReport: Report = {
                reportID: FAKE_TRANSACTION_ID,
                reportName: 'Transaction Report',
                ownerAccountID: FAKE_ACCOUNT_ID,
                policyID: FAKE_POLICY_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockTransactionReport.reportID}`, mockTransactionReport);
            });
            await waitForBatchedUpdatesWithAct();

            // When the component is rendered with the transaction reports
            renderIOURequestEditReportCommon({selectedReportID: mockTransactionReport.reportID, selectedPolicyID: mockTransactionReport.policyID});
            await waitForBatchedUpdatesWithAct();

            // Then the not found page should be displayed

            const fullPageNotFoundView = screen.getByTestId('FullPageNotFoundView');
            expect(fullPageNotFoundView).toBeVisible();
        });
    });
});
