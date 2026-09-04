import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchQueryContext, SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import {getSuggestedSearches} from '@libs/SearchUIUtils';

import SearchActionHeader from '@pages/inbox/report/SearchActionHeader';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}
ThemeProviderWithLight.displayName = 'ThemeProviderWithLight';

function renderSearchActionHeader(action: ReportAction, report: Report | undefined, isOnSearch: boolean) {
    return render(
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider, OnyxListItemProvider, LocaleContextProvider]}>
            <SearchScopeProvider isOnSearch={isOnSearch}>
                {/* A falsy currentSearchHash keeps useOnyx reading from real Onyx collections instead of a search snapshot, since this test doesn't set up snapshot data */}
                <SearchQueryContext.Provider
                    value={{
                        currentSearchHash: 0,
                        currentSimilarSearchHash: 0,
                        currentSearchKey: undefined,
                        currentSearchQueryJSON: undefined,
                        suggestedSearches: getSuggestedSearches(),
                        shouldResetSearchQuery: false,
                    }}
                >
                    <SearchResultsContext.Provider
                        value={{
                            currentSearchResults: undefined,
                            currentSearchTransactionsByReportID: new Map(),
                            currentSearchViolations: CONST.EMPTY_OBJECT,
                            sortedReportIDs: [],
                            shouldShowFiltersBarLoading: false,
                            lastSearchType: undefined,
                        }}
                    >
                        <SearchActionHeader
                            action={action}
                            report={report}
                            isWhisper={false}
                        >
                            <Text>Child content</Text>
                        </SearchActionHeader>
                    </SearchResultsContext.Provider>
                </SearchQueryContext.Provider>
            </SearchScopeProvider>
        </ComposeProviders>,
    );
}

describe('SearchActionHeader', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('renders only the children and skips the report name header when not on search', async () => {
        const action = createRandomReportAction(1);
        const report: Report = {reportID: '1', type: CONST.REPORT.TYPE.CHAT};

        renderSearchActionHeader(action, report, false);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Child content')).toBeOnTheScreen();
        expect(screen.queryByText('My Workspace')).not.toBeOnTheScreen();
    });

    it('renders the report name header when on search', async () => {
        const action = {...createRandomReportAction(2), reportName: 'My Workspace'};
        const report: Report = {reportID: '2', type: CONST.REPORT.TYPE.CHAT};

        renderSearchActionHeader(action, report, true);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('My Workspace')).toBeOnTheScreen();
        expect(screen.getByText('Child content')).toBeOnTheScreen();
    });

    describe('invoice reports', () => {
        const invoiceReportID = '500';
        const ownerAccountID = 7;

        async function setLinkedTransaction(transaction: Transaction) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ownerAccountID]: {accountID: ownerAccountID, displayName: 'Jane Doe', login: 'jane@example.com'},
            });
            await waitForBatchedUpdatesWithAct();
        }

        it('uses the "paid" wording when the invoice has no non-reimbursable transactions', async () => {
            const action = createRandomReportAction(3);
            const report: Report = {
                reportID: invoiceReportID,
                type: CONST.REPORT.TYPE.INVOICE,
                ownerAccountID,
                total: -2500,
                currency: CONST.CURRENCY.USD,
            };
            const transaction: Transaction = {...createRandomTransaction(3), reportID: invoiceReportID, reimbursable: true};
            await setLinkedTransaction(transaction);

            renderSearchActionHeader(action, report, true);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Unavailable workspace paid $25.00')).toBeOnTheScreen();
        });

        it('uses the "spent" wording when the invoice has a non-reimbursable linked transaction', async () => {
            const action = createRandomReportAction(4);
            const report: Report = {
                reportID: invoiceReportID,
                type: CONST.REPORT.TYPE.INVOICE,
                ownerAccountID,
                total: -2500,
                currency: CONST.CURRENCY.USD,
            };
            const transaction: Transaction = {...createRandomTransaction(4), reportID: invoiceReportID, reimbursable: false};
            await setLinkedTransaction(transaction);

            renderSearchActionHeader(action, report, true);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Jane Doe spent $25.00')).toBeOnTheScreen();
        });
    });

    describe('chat threads under invoice reports', () => {
        it('resolves transactions from the parent invoice report, not the thread, so non-reimbursable invoices still use "spent" wording', async () => {
            const invoiceReportID = '600';
            const ownerAccountID = 8;
            const invoiceReport: Report = {
                reportID: invoiceReportID,
                type: CONST.REPORT.TYPE.INVOICE,
                ownerAccountID,
                total: -2500,
                currency: CONST.CURRENCY.USD,
            };
            // getReportForHeader/getParentReport read the parent invoice report from the global Onyx-connected
            // cache (not from props), so it must be written to the REPORT collection directly.
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, invoiceReport);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ownerAccountID]: {accountID: ownerAccountID, displayName: 'Jane Doe', login: 'jane@example.com'},
            });
            const transaction: Transaction = {...createRandomTransaction(5), reportID: invoiceReportID, reimbursable: false};
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await waitForBatchedUpdatesWithAct();

            // A chat thread whose parent is the invoice report above.
            const threadReport: Report = {
                reportID: '601',
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: invoiceReportID,
                parentReportActionID: 'parent-action-600',
            };
            const action = createRandomReportAction(5);

            renderSearchActionHeader(action, threadReport, true);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Jane Doe spent $25.00')).toBeOnTheScreen();
        });
    });
});
