import type * as NativeNavigation from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
        toLocaleDigit: jest.fn((digit: string) => digit),
    })),
);

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => {
        return jest.requireActual('@react-navigation/native');
    })(),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

// Mock heavy child components that are not relevant to the edit-field logic
jest.mock('@components/ReportActionItem/MoneyRequestReceiptView', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return () => <RN.View testID="money-request-receipt-view" />;
});

jest.mock('@pages/inbox/report/AnimatedEmptyStateBackground', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="animated-bg" />;
});

// Mock MenuItemWithTopDescription to expose interactive state via text and title via a sibling testID.
// Title lives in a sibling element so existing toHaveTextContent('editable'|'readonly') assertions on
// the menu-item testID stay strict-equal — they don't pick up the title text.
jest.mock('@components/MenuItemWithTopDescription', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({description, title, interactive}: {description?: string; title?: string; interactive?: boolean}) => (
        <>
            <RN.View testID={`menu-item-${description}`}>
                <RN.Text>{interactive ? 'editable' : 'readonly'}</RN.Text>
            </RN.View>
            {title !== undefined && (
                <RN.View testID={`menu-item-title-${description}`}>
                    <RN.Text>{title}</RN.Text>
                </RN.View>
            )}
        </>
    );
});

// Mock MenuItem (used for some fields like billable)
jest.mock('@components/MenuItem', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string; children?: React.ReactNode}>>>('react-native');
    return ({title}: {title?: string}) => <RN.Text testID={`menu-item-simple-${title}`}>{title}</RN.Text>;
});

jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

// The real `convertToDisplayString` needs a seeded currency list/locale and otherwise returns '',
// which would hide the "Converted" suffix. Return a deterministic non-empty string instead.
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({
        convertToDisplayString: jest.fn((amountInCents = 0, currency = '') => `${currency}${amountInCents}`),
        getCurrencySymbol: jest.fn((currency = '') => `${currency}`),
        getCurrencyDecimals: jest.fn(() => 2),
        convertToDisplayStringWithoutCurrency: jest.fn((amountInCents = 0) => `${amountInCents}`),
    })),
    useCurrencyListState: jest.fn(() => ({})),
}));

TestHelper.setupGlobalFetchMock();

const currentUserAccountID = 10;
const currentUserEmail = 'test@test.com';
const policyID = 'policy_mrv_test';
const expenseReportID = 'expense_mrv_123';
const parentReportActionID = 'parent_action_mrv';
const transactionID = 'txn_mrv_test';

const renderMoneyRequestView = (threadReport: ReturnType<typeof LHNTestUtils.getFakeReport>, policy?: Record<string, unknown>) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <MoneyRequestView
                transactionThreadReport={threadReport}
                parentReportID={expenseReportID}
                expensePolicy={
                    {
                        id: policyID,
                        type: CONST.POLICY.TYPE.TEAM,
                        role: CONST.POLICY.ROLE.ADMIN,
                        name: 'Test Policy',
                        owner: currentUserEmail,
                        outputCurrency: CONST.CURRENCY.USD,
                        isPolicyExpenseChatEnabled: true,
                        ...policy,
                    } as never
                }
                shouldShowAnimatedBackground={false}
            />
        </ComposeProviders>,
    );

describe('MoneyRequestView edit fields', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    const setupTestData = async (isSettledReport = false) => {
        const iouReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            reportActionID: parentReportActionID,
            reportID: expenseReportID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: transactionID,
                amount: 5000,
                currency: CONST.CURRENCY.USD,
            },
        };

        const transaction = {
            transactionID,
            reportID: expenseReportID,
            amount: 5000,
            currency: CONST.CURRENCY.USD,
            created: '2025-06-01',
            merchant: 'Coffee Shop',
            comment: {},
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [currentUserAccountID]: {accountID: currentUserAccountID, login: currentUserEmail, displayName: 'Test User'},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                name: 'Test Policy',
                owner: currentUserEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                stateNum: isSettledReport ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.OPEN,
                statusNum: isSettledReport ? CONST.REPORT.STATUS_NUM.REIMBURSED : CONST.REPORT.STATUS_NUM.OPEN,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`, {
                [parentReportActionID]: iouReportAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        return transaction;
    };

    it('should show amount and merchant as editable when report is open', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();

        renderMoneyRequestView(threadReport);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const amountItem = screen.getByTestId(/^menu-item-iou\.amount/);
            expect(amountItem).toBeOnTheScreen();
            expect(amountItem).toHaveTextContent('editable');
        });

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-common.merchant')).toBeOnTheScreen();
            expect(screen.getByTestId('menu-item-common.merchant')).toHaveTextContent('editable');
        });
    });

    it('should show tax fields when tax tracking is disabled but transaction has tax data', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                taxCode: 'TAX_10',
                taxAmount: 500,
                taxValue: '10%',
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {tax: {trackingEnabled: false}});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-common.tax')).toBeOnTheScreen();
            expect(screen.getByTestId('menu-item-iou.taxAmount')).toBeOnTheScreen();
        });
    });

    it('should not show tax fields when tax tracking is disabled and transaction has no tax data', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {tax: {trackingEnabled: false}});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('menu-item-common.tax')).not.toBeOnTheScreen();
            expect(screen.queryByTestId('menu-item-iou.taxAmount')).not.toBeOnTheScreen();
        });
    });

    it('should not show tax fields for time expenses even when transaction has tax data', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                taxCode: 'TAX_10',
                taxAmount: 500,
                taxValue: '10%',
                iouRequestType: CONST.IOU.REQUEST_TYPE.TIME,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {tax: {trackingEnabled: true}});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.queryByTestId('menu-item-common.tax')).not.toBeOnTheScreen();
            expect(screen.queryByTestId('menu-item-iou.taxAmount')).not.toBeOnTheScreen();
        });
    });

    it('should show amount and merchant as readonly when report is settled', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData(true);

        renderMoneyRequestView(threadReport);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const amountItem = screen.getByTestId(/^menu-item-iou\.amount/);
            expect(amountItem).toBeOnTheScreen();
            expect(amountItem).toHaveTextContent('readonly');
        });

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-common.merchant')).toBeOnTheScreen();
            expect(screen.getByTestId('menu-item-common.merchant')).toHaveTextContent('readonly');
        });
    });

    it('should append "Non-reimbursable" to the Amount description when the transaction is non-reimbursable in a single-expense report', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {reimbursable: false});
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId(/^menu-item-iou\.amount.*iou\.nonReimbursable/i)).toBeOnTheScreen();
        });
    });

    it('should NOT append "Non-reimbursable" to the Amount description when the parent report has multiple expenses', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {reimbursable: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}_sibling`, {
                transactionID: `${transactionID}_sibling`,
                reportID: expenseReportID,
                amount: 2500,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-02',
                merchant: 'Sibling',
                comment: {},
                reimbursable: true,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId(/^menu-item-iou\.amount/)).toBeOnTheScreen();
            expect(screen.queryByTestId(/^menu-item-iou\.amount.*iou\.nonReimbursable/i)).not.toBeOnTheScreen();
        });
    });

    it('should append "Non-reimbursable" immediately when the only other expense is pending deletion', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {reimbursable: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}_sibling`, {
                transactionID: `${transactionID}_sibling`,
                reportID: expenseReportID,
                amount: 2500,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-02',
                merchant: 'Sibling',
                comment: {},
                reimbursable: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId(/^menu-item-iou\.amount.*iou\.nonReimbursable/i)).toBeOnTheScreen();
        });
    });

    it('should NOT append "Non-reimbursable" while offline because the pending-deleted expense is still rendered', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {reimbursable: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}_sibling`, {
                transactionID: `${transactionID}_sibling`,
                reportID: expenseReportID,
                amount: 2500,
                currency: CONST.CURRENCY.USD,
                created: '2025-06-02',
                merchant: 'Sibling',
                comment: {},
                reimbursable: false,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            });
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId(/^menu-item-iou\.amount/)).toBeOnTheScreen();
            expect(screen.queryByTestId(/^menu-item-iou\.amount.*iou\.nonReimbursable/i)).not.toBeOnTheScreen();
        });
    });

    it('appends "Converted" to the Tax amount description for a foreign-currency taxed expense', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {currency: CONST.CURRENCY.USD});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                currency: 'UZS',
                convertedAmount: 27410265,
                taxCode: 'TAX_10',
                taxAmount: 1110,
                convertedTaxAmount: 1332281,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {tax: {trackingEnabled: true}});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId(/^menu-item-iou\.taxAmount.*common\.converted/i)).toBeOnTheScreen();
        });
    });

    it('does NOT append "Converted" to the Tax amount description when the converted tax is zero (tax exempt)', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {currency: CONST.CURRENCY.USD});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                currency: 'UZS',
                convertedAmount: 27410265,
                taxCode: 'TAX_EXEMPT',
                taxAmount: 0,
                convertedTaxAmount: 0,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {tax: {trackingEnabled: true}});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-iou.taxAmount')).toBeOnTheScreen();
            expect(screen.queryByTestId(/^menu-item-iou\.taxAmount.*common\.converted/i)).not.toBeOnTheScreen();
        });
    });

    it('does NOT append "Converted" to the Tax amount description when the expense currency matches the report currency', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, {currency: CONST.CURRENCY.USD});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                currency: CONST.CURRENCY.USD,
                convertedAmount: 27410265,
                taxCode: 'TAX_10',
                taxAmount: 1110,
                convertedTaxAmount: 1332281,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {tax: {trackingEnabled: true}});
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByTestId('menu-item-iou.taxAmount')).toBeOnTheScreen();
            expect(screen.queryByTestId(/^menu-item-iou\.taxAmount.*common\.converted/i)).not.toBeOnTheScreen();
        });
    });

    it('falls back to the vendor externalID when the assigned vendor is missing from every connection', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                reimbursable: false,
                comment: {vendor: {externalID: 'stale-vendor-id', isManuallySet: false}},
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                    data: {vendors: []},
                },
            },
        });
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const vendorTitle = screen.getByTestId('menu-item-title-common.vendor');
            expect(vendorTitle).toHaveTextContent('stale-vendor-id');
            expect(vendorTitle).not.toHaveTextContent('violations.inactiveVendor');
        });
    });

    it('falls back to the vendor externalID before the synced vendor list has loaded', async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                reimbursable: false,
                comment: {vendor: {externalID: 'still-valid-vendor-id', isManuallySet: false}},
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                },
            },
        });
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const vendorTitle = screen.getByTestId('menu-item-title-common.vendor');
            expect(vendorTitle).toHaveTextContent('still-valid-vendor-id');
            expect(vendorTitle).not.toHaveTextContent('violations.inactiveVendor');
        });
    });

    it("shows the vendor's name from a secondary connection when the active integration's list dropped it", async () => {
        const threadReport = {
            ...LHNTestUtils.getFakeReport(),
            parentReportID: expenseReportID,
            parentReportActionID,
        };

        await setupTestData();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                reimbursable: false,
                comment: {vendor: {externalID: 'stale-vendor-id', isManuallySet: false}},
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderMoneyRequestView(threadReport, {
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                    data: {vendors: []},
                },
                [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                    data: {vendors: [{id: 'stale-vendor-id', value: 'Stale Intacct Vendor', name: 'stale-code'}]},
                },
            },
        });
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const vendorTitle = screen.getByTestId('menu-item-title-common.vendor');
            expect(vendorTitle).toHaveTextContent('Stale Intacct Vendor');
            expect(vendorTitle).not.toHaveTextContent('violations.inactiveVendor');
        });
    });
});
