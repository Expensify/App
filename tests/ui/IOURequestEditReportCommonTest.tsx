import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const FAKE_REPORT_ID = '1';
const FAKE_POLICY_ID = '1';
const FAKE_TRANSACTION_ID = '1';
const FAKE_EMAIL = 'fake@gmail.com';
const FAKE_ACCOUNT_ID = 1;
const FAKE_OWNER_ACCOUNT_ID = 2;

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
const renderIOURequestEditReportCommon = ({transactionsReports = []}: {transactionsReports: Report[]}) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <IOURequestEditReportCommon
                transactionsReports={transactionsReports}
                selectReport={jest.fn()}
                backTo=""
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
        });

        beforeEach(() => {
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}` as const]: createRandomPolicy(Number(FAKE_POLICY_ID)),
                [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_REPORT_ID}` as const]: {
                    reportID: FAKE_REPORT_ID,
                    reportName: 'Expense Report',
                    ownerAccountID: FAKE_OWNER_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
            return waitForBatchedUpdates();
        });

        afterEach(() => {
            Onyx.clear();
            jest.clearAllMocks();
            return waitForBatchedUpdates();
        });

        it('should not show DotIndicator when the report has brickRoadIndicator', async () => {
            // Given a transaction report
            const mockTransactionsReports: Report[] = [
                {
                    reportID: FAKE_TRANSACTION_ID,
                    reportName: 'Transaction Report',
                    ownerAccountID: FAKE_OWNER_ACCOUNT_ID,
                    policyID: FAKE_POLICY_ID,
                } as Report,
            ];

            // When the component is rendered with the transaction reports
            renderIOURequestEditReportCommon({transactionsReports: mockTransactionsReports});
            await waitForBatchedUpdatesWithAct();

            // Then the expense report should be displayed
            const reportItem = screen.getByText('Expense Report');
            expect(reportItem).toBeTruthy();

            // Then do not show RBR
            const dotIndicators = screen.queryAllByTestId(CONST.DOT_INDICATOR_TEST_ID);
            expect(dotIndicators).toHaveLength(0);
        });
    });
});
