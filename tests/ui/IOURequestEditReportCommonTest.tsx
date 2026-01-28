import {act, render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const FAKE_REPORT_ID = '1';
const FAKE_POLICY_ID = '1';
const FAKE_TRANSACTION_ID = '2';
const FAKE_EMAIL = 'fake@gmail.com';
const FAKE_ACCOUNT_ID = 1;
const FAKE_SECOND_ACCOUNT_ID = 2;

/**
 * Mock the OptionListContextProvider to provide test data for the component.
 * This ensures consistent test data and isolates the component from external dependencies.
 */
jest.mock('@components/OptionListContextProvider', () => ({
    useOptionsList: () => ({
        options: {
            reports: [
                {
                    reportID: FAKE_REPORT_ID,
                    text: 'Expense Report',
                    keyForList: FAKE_REPORT_ID,
                    brickRoadIndicator: 'error',
                },
            ],
        },
    }),
    OptionsListContextProvider: ({children}: {children: React.ReactNode}) => children,
}));

/**
 * Helper function to render the IOURequestEditReportCommon component with required providers.
 * This encapsulates the component setup and makes tests more readable.
 */
const renderIOURequestEditReportCommon = ({selectedReportID = '', selectedPolicyID}: {selectedReportID: string; selectedPolicyID?: string}) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <IOURequestEditReportCommon
                selectedReportID={selectedReportID}
                selectedPolicyID={selectedPolicyID}
                selectReport={jest.fn()}
                backTo=""
                isPerDiemRequest={false}
                isTimeRequest={false}
            />
        </ComposeProviders>,
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
            // eslint-disable-next-line rulesdir/no-negated-variables
            const fullPageNotFoundView = screen.getByTestId('FullPageNotFoundView');
            expect(fullPageNotFoundView).toBeVisible();
        });
    });
});
