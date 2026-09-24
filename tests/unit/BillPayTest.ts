import {canApproveBill, canPayBill, isBillPayReport} from '@libs/BillPayUtils';
import {translate} from '@libs/Localize';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';
import {getSections, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults} from '@src/types/onyx';

import createMock from '../utils/createMock';

describe('Bill Pay', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    const accountID = 123;
    const email = 'payer@example.com';
    const policy: Policy = {
        id: 'workspace',
        name: 'Bills',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: email,
        reimburser: email,
        outputCurrency: CONST.CURRENCY.USD,
    };
    const bill: Report = {
        reportID: '100',
        type: CONST.REPORT.TYPE.BILL,
        policyID: policy.id,
        ownerAccountID: accountID,
        managerID: accountID,
        total: -125,
        currency: CONST.CURRENCY.USD,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    };

    it('moves a bill from approval to payment only after final approval', () => {
        expect(canApproveBill(bill, accountID)).toBe(true);
        expect(canPayBill(bill, policy, accountID, email)).toBe(false);
        const approved = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
        expect(canApproveBill(approved, accountID)).toBe(false);
        expect(canPayBill(approved, policy, accountID, email)).toBe(true);
        expect(canPayBill({...approved, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}, policy, accountID, email)).toBe(false);
        expect(canPayBill({...approved, isWaitingOnBankAccount: true}, policy, accountID, email)).toBe(false);
    });

    it('only offers payment to the authorized payer, even when another user is an admin', () => {
        const approved = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
        expect(canPayBill(approved, policy, 456, 'admin@example.com')).toBe(false);
        expect(canPayBill(approved, {...policy, reimburser: undefined}, accountID, email)).toBe(true);
    });

    it('includes received standalone invoices without requiring a room', () => {
        const invoice: Report = {...bill, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: 456};
        expect(isBillPayReport(invoice, accountID)).toBe(true);
        expect(canPayBill(invoice, undefined, accountID, email)).toBe(true);
        expect(isBillPayReport(invoice, 456)).toBe(false);
        expect(isBillPayReport({...invoice, billID: bill.reportID, isHiddenForBillReceiver: true}, accountID)).toBe(false);
    });

    it('keeps business invoices visible to receivers identified by Auth', () => {
        const invoice: Report = {...bill, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: 456, managerID: 789, isBillPayReport: true};
        expect(isBillPayReport(invoice, accountID)).toBe(true);
        expect(canPayBill(invoice, undefined, accountID, email)).toBe(true);
    });

    it('builds distinct Bills searches with the payer filter on Ready to pay', () => {
        const searches = getSuggestedSearches(accountID);
        const bills = buildSearchQueryJSON(searches[CONST.SEARCH.SEARCH_KEYS.BILLS].searchQuery);
        const approval = buildSearchQueryJSON(searches[CONST.SEARCH.SEARCH_KEYS.BILLS_APPROVE].searchQuery);
        const payment = buildSearchQueryJSON(searches[CONST.SEARCH.SEARCH_KEYS.BILLS_PAY].searchQuery);
        expect(bills?.type).toBe(CONST.SEARCH.DATA_TYPES.BILL);
        expect(approval?.type).toBe(CONST.SEARCH.DATA_TYPES.BILL);
        expect(payment?.type).toBe(CONST.SEARCH.DATA_TYPES.BILL);
        expect(searches[CONST.SEARCH.SEARCH_KEYS.BILLS_PAY].searchQuery).toContain(`payer:${accountID}`);
        expect(new Set([bills?.hash, approval?.hash, payment?.hash]).size).toBe(3);
    });

    it('renders the bill with sender and receiver emails and suppresses its invoice', () => {
        const vendorAccountID = 456;
        const approved: Report = {
            ...bill,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            billSenderAccountID: 456,
            billReceiverAccountID: accountID,
        };
        const data = createMock<SearchResults['data']>({
            personalDetailsList: {
                [accountID]: {accountID, login: email, displayName: 'Receiver'},
                [vendorAccountID]: {accountID: vendorAccountID, login: 'billing@vendor.com', displayName: 'Vendor'},
            },
        });
        data[`${ONYXKEYS.COLLECTION.REPORT}100`] = approved;
        data[`${ONYXKEYS.COLLECTION.REPORT}200`] = {...approved, reportID: '200', type: CONST.REPORT.TYPE.INVOICE, isHiddenForBillReceiver: true};
        data[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = policy;
        const [sections] = getSections({
            type: CONST.SEARCH.DATA_TYPES.BILL,
            data,
            currentAccountID: accountID,
            currentUserEmail: email,
            queryJSON: buildSearchQueryJSON('type:bill'),
            translate: <TPath extends TranslationPaths>(key: TPath, ...parameters: TranslationParameters<TPath>) => translate(CONST.LOCALES.EN, key, ...parameters),
            formatPhoneNumber: (phone) => phone,
            convertToDisplayString: (amount) => String(amount),
            bankAccountList: {},
            rules: undefined,
            conciergeReportID: undefined,
            dateFnsLocale: undefined,
            reportAttributesDerivedValue: {},
        });
        const reports = sections.filter(isTransactionReportGroupListItemType);
        expect(reports).toHaveLength(1);
        expect(reports.at(0)).toMatchObject({reportID: '100', formattedFrom: 'billing@vendor.com', formattedTo: email, action: CONST.SEARCH.ACTION_TYPES.PAY});
    });
});
