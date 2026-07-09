import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import Text from '@components/Text';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

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
                {/* shouldUseLiveData: true keeps useOnyx reading from real Onyx collections instead of a search snapshot, since this test doesn't set up snapshot data */}
                <SearchResultsContext.Provider
                    value={{currentSearchResults: undefined, shouldUseLiveData: true, sortedReportIDs: [], shouldShowFiltersBarLoading: false, lastSearchType: undefined}}
                >
                    <SearchActionHeader
                        action={action}
                        report={report}
                        isWhisper={false}
                    >
                        <Text>Child content</Text>
                    </SearchActionHeader>
                </SearchResultsContext.Provider>
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
});
