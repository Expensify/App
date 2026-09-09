import type {TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import * as ReportWorkflow from '@libs/actions/IOU/ReportWorkflow';
import {handleActionButtonPress, handleBulkPayItemSelected} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-imports -- namespace import needed to spy on hasViolations in the approve-action test
import * as ReportUtils from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LastPaymentMethod, Policy, Report, SearchResults, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createMock from '../../utils/createMock';
import {getCurrencyDecimalsLocal} from '../../utils/TestHelper';

jest.mock('@src/components/ConfirmedRoute.tsx');
jest.mock('@libs/deferModalPresentationAfterPopoverDismiss', () => ({
    __esModule: true,
    default: (callback: () => void) => callback(),
}));
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

const mockReportItemWithHold = createMock<TransactionReportGroupListItemType>({
    groupedBy: 'expense-report',
    shouldAnimateInHighlight: false,
    accountID: 1206,
    action: 'approve',
    allActions: ['approve'],
    canPay: false,
    canApprove: true,
    canSubmit: false,
    canChangeApprover: false,
    chatReportID: '2108006919825366',
    created: '2024-12-04 23:18:33',
    submitted: '2024-12-04',
    approved: undefined,
    exported: undefined,
    currency: 'USD',
    isOneTransactionReport: false,
    isWaitingOnBankAccount: false,
    managerID: 1206,
    nonReimbursableTotal: 0,
    ownerAccountID: 1206,
    policyID: '48D7178DE42EE9F9',
    reportID: '1350959062018695',
    reportName: 'Expense Report #1350959062018695',
    stateNum: 1,
    statusNum: 1,
    total: -13500,
    type: 'expense',
    unheldTotal: -12300,
    keyForList: '1350959062018695',
    from: {
        accountID: 1206,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
        displayName: 'Ames',
        firstName: 'Ames',
        lastName: '',
        login: 'apb@apb.com',
        pronouns: '',
        timezone: {
            automatic: true,
            selected: 'America/Edmonton',
        },
        phoneNumber: '',
        validated: false,
    },
    to: {
        accountID: 1206,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
        displayName: 'Ames',
        firstName: 'Ames',
        lastName: '',
        login: 'apb@apb.com',
        pronouns: '',
        timezone: {
            automatic: true,
            selected: 'America/Edmonton',
        },
        phoneNumber: '',
        validated: false,
    },
    shouldShowYear: false,
    shouldShowYearSubmitted: false,
    shouldShowYearApproved: false,
    shouldShowYearExported: false,
    transactions: [
        {
            report: {
                reportID: '1350959062018695',
            },
            policy: {
                type: 'team',
                id: '48D7178DE42EE9F9',
                role: 'admin',
                owner: 'apb@apb.com',
                name: 'Policy',
                outputCurrency: 'USD',
            },
            reportAction: {
                reportActionID: '3042630993757922770',
                actionName: 'IOU',
                created: '2024-12-04',
            },
            holdReportAction: {
                reportActionID: '2101164516657897891',
                actionName: 'HOLD',
                created: '2024-12-05',
            },
            accountID: 1206,
            action: 'view',
            allActions: ['view'],
            canPay: false,
            canApprove: false,
            canSubmit: false,
            canChangeApprover: false,
            amount: -1200,
            category: '',
            comment: {
                comment: '',
                hold: '2101164516657897891',
            },
            created: '2024-12-04',
            currency: 'USD',
            hasEReceipt: false,
            merchant: 'Qatar',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            submitted: '2024-12-04',
            approved: undefined,
            posted: undefined,
            exported: undefined,
            policyID: '48D7178DE42EE9F9',
            reportID: '1350959062018695',
            tag: '',
            transactionID: '1049531721038862176',
            transactionThreadReportID: '2957345659269055',
            from: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'Ames',
                firstName: 'Ames',
                lastName: '',
                login: 'apb@apb.com',
                pronouns: '',
                timezone: {
                    automatic: true,
                    selected: 'America/Edmonton',
                },
                phoneNumber: '',
                validated: false,
            },
            to: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'Ames',
                firstName: 'Ames',
                lastName: '',
                login: 'apb@apb.com',
                pronouns: '',
                timezone: {
                    automatic: true,
                    selected: 'America/Edmonton',
                },
                phoneNumber: '',
                validated: false,
            },
            formattedFrom: 'Ames',
            formattedTo: 'Ames',
            formattedTotal: 1200,
            formattedMerchant: 'Qatar',
            date: '2024-12-04',
            shouldShowMerchant: true,
            shouldShowYear: false,
            shouldShowYearSubmitted: false,
            shouldShowYearApproved: false,
            shouldShowYearPosted: false,
            shouldShowYearExported: false,
            keyForList: '1049531721038862176',
            isAmountColumnWide: false,
            isTaxAmountColumnWide: false,
            shouldAnimateInHighlight: false,
            groupAmount: 1200,
            groupCurrency: 'USD',
        },
        {
            report: {
                reportID: '1350959062018695',
            },
            policy: {
                type: 'team',
                id: '48D7178DE42EE9F9',
                role: 'admin',
                owner: 'apb@apb.com',
                name: 'Policy',
                outputCurrency: 'USD',
            },
            reportAction: {
                reportActionID: '3042630993757922770',
                actionName: 'IOU',
                created: '2024-12-04',
            },
            holdReportAction: undefined,
            accountID: 1206,
            action: 'view',
            allActions: ['view'],
            canPay: false,
            canApprove: false,
            canSubmit: false,
            canChangeApprover: false,
            amount: -12300,
            category: '',
            comment: {
                comment: '',
            },
            created: '2024-12-04',
            submitted: '2024-12-04',
            approved: undefined,
            posted: undefined,
            exported: undefined,
            currency: 'USD',
            hasEReceipt: false,
            merchant: 'Forbes',
            modifiedAmount: '',
            modifiedCreated: '',
            modifiedCurrency: '',
            modifiedMerchant: '',
            parentTransactionID: '',
            policyID: '48D7178DE42EE9F9',
            reportID: '1350959062018695',
            tag: '',
            transactionID: '5345995386715609966',
            from: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'Ames',
                login: 'apb@apb.com',
            },
            to: {
                accountID: 1206,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/default-avatar_7.png',
                displayName: 'Ames',
            },
            formattedFrom: 'Ames',
            formattedTo: 'Ames',
            formattedTotal: 12300,
            formattedMerchant: 'Forbes',
            date: '2024-12-04',
            shouldShowMerchant: true,
            shouldShowYear: false,
            shouldShowYearSubmitted: false,
            shouldShowYearApproved: false,
            shouldShowYearPosted: false,
            shouldShowYearExported: false,
            keyForList: '5345995386715609966',
            isAmountColumnWide: false,
            isTaxAmountColumnWide: false,
            shouldAnimateInHighlight: false,
            groupAmount: 1200,
            groupCurrency: 'USD',
        },
    ],
    isSelected: false,
});

const updatedMockReportItem = {
    ...mockReportItemWithHold,
    transactions: mockReportItemWithHold.transactions.map((transaction, index) => {
        if (index === 0) {
            return {
                ...transaction,
                comment: {
                    comment: '',
                },
            };
        }
        return transaction;
    }),
};

const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${mockReportItemWithHold.policyID}` satisfies keyof SearchResults['data'];
const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${mockReportItemWithHold.reportID}` satisfies keyof SearchResults['data'];

const mockSnapshotData: SearchResults['data'] = {};
mockSnapshotData[policyKey] = createMock<Policy>({
    id: String(mockReportItemWithHold.policyID),
    name: 'Policy',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: 'apb@apb.com',
    ownerAccountID: mockReportItemWithHold.ownerAccountID,
    outputCurrency: 'USD',
});
mockSnapshotData[reportKey] = createMock<Report>({
    reportID: mockReportItemWithHold.reportID,
    reportName: mockReportItemWithHold.reportName,
    policyID: mockReportItemWithHold.policyID,
    ownerAccountID: mockReportItemWithHold.ownerAccountID,
    managerID: mockReportItemWithHold.managerID,
    stateNum: mockReportItemWithHold.stateNum,
    statusNum: mockReportItemWithHold.statusNum,
});

const mockSnapshotForItem = {
    search: createMock<SearchResults['search']>({}),
    data: mockSnapshotData,
} satisfies SearchResults;

const mockLastPaymentMethod: OnyxEntry<LastPaymentMethod> = {
    expense: 'Elsewhere',
    lastUsed: 'Elsewhere',
};

describe('handleActionButtonPress', () => {
    const searchHash = 1;
    beforeAll(() => {
        Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`, mockSnapshotForItem);
        Onyx.merge(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, mockLastPaymentMethod);
    });

    const snapshotReport = mockSnapshotForItem.data[reportKey];
    const snapshotPolicy = mockSnapshotForItem.data[policyKey];

    test('Should not navigate to item when report has one transaction on hold and action is approve', () => {
        const goToItem = jest.fn(() => {});
        handleActionButtonPress({
            conciergeChat: undefined,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            hash: searchHash,
            item: mockReportItemWithHold,
            goToItem,
            snapshotReport,
            snapshotPolicy,
            submitterLogin: undefined,
            lastPaymentMethod: mockLastPaymentMethod,
            personalPolicyID: undefined,
            ownerBillingGracePeriodEnd: undefined,
            amountOwed: undefined,
            userBillingGracePeriodEnds: undefined,
            onHoldMenuOpen: jest.fn(),
            policy: snapshotPolicy,
            chatReportActions: undefined,
            currentUserAccountID: 1206,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            allViolations: undefined,
        });
        expect(goToItem).not.toHaveBeenCalled();
    });

    test('Should open the hold menu when the report has one transaction on hold and action is approve', () => {
        const onHoldMenuOpen = jest.fn();
        handleActionButtonPress({
            conciergeChat: undefined,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            hash: searchHash,
            item: mockReportItemWithHold,
            goToItem: jest.fn(),
            snapshotReport,
            snapshotPolicy,
            submitterLogin: undefined,
            lastPaymentMethod: mockLastPaymentMethod,
            personalPolicyID: undefined,
            userBillingGracePeriodEnds: undefined,
            ownerBillingGracePeriodEnd: undefined,
            amountOwed: undefined,
            onHoldMenuOpen,
            policy: snapshotPolicy,
            chatReportActions: undefined,
            currentUserAccountID: 1206,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            allViolations: undefined,
        });

        expect(onHoldMenuOpen).toHaveBeenCalledWith(mockReportItemWithHold, CONST.IOU.REPORT_ACTION_TYPE.APPROVE);
    });

    test('Should not navigate to item when the hold is removed', () => {
        const goToItem = jest.fn(() => {});
        handleActionButtonPress({
            conciergeChat: undefined,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
            hash: searchHash,
            item: updatedMockReportItem,
            goToItem,
            snapshotReport,
            snapshotPolicy,
            submitterLogin: undefined,
            lastPaymentMethod: mockLastPaymentMethod,
            personalPolicyID: undefined,
            ownerBillingGracePeriodEnd: undefined,
            amountOwed: undefined,
            userBillingGracePeriodEnds: undefined,
            policy: snapshotPolicy,
            chatReportActions: undefined,
            currentUserAccountID: 1206,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            allViolations: undefined,
        });
        expect(goToItem).toHaveBeenCalledTimes(0);
    });

    test('Should compute hasViolations from the passed allViolations param (not the global Onyx collection) and forward it to approveMoneyRequest', () => {
        // Given: a report item with no held expenses so the approve action reaches getApproveActionCallback,
        // and a violations collection passed explicitly through the params.
        const allViolations: OnyxCollection<TransactionViolations> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1049531721038862176`]: [{name: CONST.VIOLATIONS.MISSING_CATEGORY, type: CONST.VIOLATION_TYPES.VIOLATION}],
        };

        const hasViolationsMock = jest.spyOn(ReportUtils, 'hasViolations').mockReturnValue(true);
        const approveMoneyRequestMock = jest.spyOn(ReportWorkflow, 'approveMoneyRequest').mockImplementation(jest.fn());

        // When: the approve action button is pressed
        handleActionButtonPress({
            hash: searchHash,
            item: updatedMockReportItem,
            goToItem: jest.fn(),
            snapshotReport,
            snapshotPolicy,
            submitterLogin: undefined,
            lastPaymentMethod: mockLastPaymentMethod,
            personalPolicyID: undefined,
            ownerBillingGracePeriodEnd: undefined,
            amountOwed: undefined,
            userBillingGracePeriodEnds: undefined,
            policy: snapshotPolicy,
            chatReportActions: undefined,
            currentUserAccountID: 1206,
            delegateAccountID: undefined,
            isTrackIntentUser: false,
            allViolations,
            conciergeChat: undefined,
            getCurrencyDecimals: getCurrencyDecimalsLocal,
        });

        // Then: hasViolations is evaluated against the passed collection, proving the deprecated global getter is no longer used,
        // and the resulting value is forwarded to approveMoneyRequest.
        expect(hasViolationsMock).toHaveBeenCalledWith(updatedMockReportItem.reportID, allViolations, 1206, '');
        expect(approveMoneyRequestMock).toHaveBeenCalledWith(expect.objectContaining({hasViolations: true}));

        hasViolationsMock.mockRestore();
        approveMoneyRequestMock.mockRestore();
    });
});

describe('handleBulkPayItemSelected', () => {
    const policyID = '1001';
    const ownerAccountID = 1;

    const baseParams = {
        item: {key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, text: 'Pay elsewhere', icon: () => null},
        triggerKYCFlow: jest.fn(),
        isAccountLocked: false,
        showLockedAccountModal: jest.fn(),
        latestBankItems: undefined,
        activeAdminPolicies: [],
        isUserValidated: true,
        isDelegateAccessRestricted: false,
        showDelegateNoAccessModal: jest.fn(),
        confirmPayment: jest.fn(),
        userBillingGracePeriodEnds: undefined,
        businessBankAccountOptions: undefined,
        bankAccountList: undefined,
        ownerBillingGracePeriodEnd: undefined,
        currentUserAccountID: ownerAccountID,
        isOffline: false,
        verifyAccountAndResume: jest.fn<void, [(() => void) | undefined]>(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {email: 'owner@test.com', accountID: ownerAccountID},
        });
    });

    it('should navigate to restricted action page when amountOwed > 0 and billing is past due', async () => {
        const pastDate = Math.floor(Date.now() / 1000) - 86400 * 30;
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
            role: CONST.POLICY.ROLE.ADMIN,
        };

        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: policy,
            [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: pastDate,
            [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 100,
        });

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 100,
            ownerBillingGracePeriodEnd: pastDate,
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
        expect(baseParams.confirmPayment).not.toHaveBeenCalled();
    });

    it('should not navigate to restricted action page when amountOwed is 0', async () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
            role: CONST.POLICY.ROLE.ADMIN,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
        });

        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
        expect(baseParams.confirmPayment).toHaveBeenCalled();
    });

    it('should call showDelegateNoAccessModal when delegate access is restricted', () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
        };

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            isDelegateAccessRestricted: true,
            amountOwed: 0,
        });

        expect(baseParams.showDelegateNoAccessModal).toHaveBeenCalled();
        expect(baseParams.confirmPayment).not.toHaveBeenCalled();
    });

    it('should call showLockedAccountModal when account is locked', () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
        };

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            isAccountLocked: true,
            amountOwed: 0,
        });

        expect(baseParams.showLockedAccountModal).toHaveBeenCalled();
        expect(baseParams.confirmPayment).not.toHaveBeenCalled();
    });

    it('should call confirmPayment when no restrictions apply and amountOwed is 0', async () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
        });

        expect(baseParams.confirmPayment).toHaveBeenCalled();
    });

    it('should not trigger account verification and should call confirmPayment when user is unvalidated and item is Mark as paid (ELSEWHERE)', async () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
            isUserValidated: false,
            item: {key: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, text: 'Pay elsewhere', icon: () => null},
        });

        expect(baseParams.verifyAccountAndResume).not.toHaveBeenCalled();
        expect(baseParams.confirmPayment).toHaveBeenCalled();
    });

    it('should defer to verifyAccountAndResume when user is unvalidated and item is a bank-funded payment type (VBBA), then resume the payment after validation', async () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
            isUserValidated: false,
            item: {key: CONST.IOU.PAYMENT_TYPE.VBBA, text: 'Pay with bank account', icon: () => null},
        });

        expect(baseParams.verifyAccountAndResume).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(baseParams.confirmPayment).not.toHaveBeenCalled();

        // Invoke the stored retry closure, which is what the hook runs once the user validates.
        const retry = baseParams.verifyAccountAndResume.mock.calls.at(0)?.at(0);
        if (!retry) {
            throw new Error('Expected verifyAccountAndResume to receive a retry callback');
        }
        retry();

        expect(baseParams.verifyAccountAndResume).toHaveBeenCalledTimes(1);
        expect(baseParams.confirmPayment).toHaveBeenCalled();
    });

    it('should call confirmPayment directly when an open business bank account is selected, even if it is not linked to the policy', async () => {
        const bankAccountID = 2409153;
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
            bankAccountList: {
                [bankAccountID]: {
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: CONST.COUNTRY.US,
                    accountData: {bankAccountID, type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN},
                },
            },
            item: {
                key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                text: 'Business account',
                icon: () => null,
                additionalData: {bankAccountID, paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT},
            },
        });

        expect(baseParams.triggerKYCFlow).not.toHaveBeenCalled();
        expect(baseParams.confirmPayment).toHaveBeenCalledWith(CONST.IOU.PAYMENT_TYPE.VBBA, {bankAccountID, paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT});
    });

    it('should trigger the KYC flow when the selected business bank account is not open', async () => {
        const bankAccountID = 2409153;
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
            bankAccountList: {
                [bankAccountID]: {
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: CONST.COUNTRY.US,
                    accountData: {bankAccountID, type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.LOCKED},
                },
            },
            item: {
                key: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                text: 'Business account',
                icon: () => null,
                additionalData: {bankAccountID, paymentMethod: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT},
            },
        });

        expect(baseParams.triggerKYCFlow).toHaveBeenCalled();
        expect(baseParams.confirmPayment).not.toHaveBeenCalled();
    });

    it('should defer to confirmPayment (offline modal) and never navigate to KYC/verify-account when offline, even for a bank-funded payment type', async () => {
        const policy: Policy = {
            ...createRandomPolicy(Number(policyID)),
            id: policyID,
            ownerAccountID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        handleBulkPayItemSelected({
            ...baseParams,
            policy,
            amountOwed: 0,
            // VBBA + unvalidated user would normally route to account verification / KYC; offline must short-circuit that.
            isUserValidated: false,
            isOffline: true,
            item: {key: CONST.IOU.PAYMENT_TYPE.VBBA, text: 'Pay with bank account', icon: () => null},
        });

        expect(baseParams.triggerKYCFlow).not.toHaveBeenCalled();
        expect(baseParams.verifyAccountAndResume).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        // confirmPayment (onBulkPaySelected) is what surfaces the offline modal; the exact paymentType is not important here.
        expect(baseParams.confirmPayment).toHaveBeenCalled();
    });
});
