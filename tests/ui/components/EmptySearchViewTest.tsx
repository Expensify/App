import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// Wrapper component with OnyxListItemProvider
function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>{children}</LocaleContextProvider>
        </OnyxListItemProvider>
    );
}
const CURRENT_USER_EMAIL = 'fake@gmail.com';
const CURRENT_USER_ACCOUNT_ID = 1;
const SESSION = {
    email: CURRENT_USER_EMAIL,
    accountID: CURRENT_USER_ACCOUNT_ID,
};
const POLICY_ID = '1';
const createPaidGroupPolicy = (isPolicyExpenseChatEnabled = true) => ({
    id: POLICY_ID,
    type: CONST.POLICY.TYPE.TEAM,
    isPolicyExpenseChatEnabled,
    role: CONST.POLICY.ROLE.ADMIN,
});

describe('EmptySearchView', () => {
    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    describe('type is Expense', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.EXPENSE;

        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', async () => {
            // Given user hasn't clicked on "Take a test drive" yet
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});
            });

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        similarSearchHash={1}
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );
            await waitForBatchedUpdatesWithAct();

            // Then it should display create expenses and take a test drive buttons
            expect(await screen.findByText(translateLocal('iou.createExpense'))).toBeVisible();
            expect(await screen.findByText(translateLocal('emptySearchView.takeATestDrive'))).toBeVisible();

            // And correct modal subtitle
            expect(screen.getByText(translateLocal('search.searchResults.emptyExpenseResults.subtitle'))).toBeVisible();
        });

        it('should display correct buttons and subtitle when user already did "Take a test drive"', async () => {
            // Given user clicked on "Take a test drive"
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});
            });

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        similarSearchHash={1}
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display create expenses button
            expect(await screen.findByText(translateLocal('iou.createExpense'))).toBeVisible();
            expect(screen.queryByText(translateLocal('emptySearchView.takeATestDrive'))).not.toBeOnTheScreen();

            // And correct modal subtitle
            expect(screen.getByText(translateLocal('search.searchResults.emptyExpenseResults.subtitleWithOnlyCreateButton'))).toBeVisible();
        });

        describe('Submit suggestion', () => {
            beforeEach(async () => {
                await act(async () => {
                    await Onyx.merge(ONYXKEYS.SESSION, SESSION);
                });
            });

            afterEach(async () => {
                await act(async () => {
                    await Onyx.clear();
                });
            });

            it('should display "Create Report" button when user has a paid group policy with expense chat enabled', async () => {
                // Given a paid group policy with expense chat enabled
                const paidGroupPolicy = createPaidGroupPolicy();
                await act(async () => {
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${paidGroupPolicy.id}`, paidGroupPolicy);
                });

                // Given a query string for expense search with draft status
                const queryString = buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                    from: [CURRENT_USER_ACCOUNT_ID.toString()],
                });
                const queryJSON = buildSearchQueryJSON(queryString);

                // When rendering the EmptySearchView component
                render(
                    <Wrapper>
                        <EmptySearchView
                            similarSearchHash={queryJSON?.similarSearchHash ?? 1}
                            type={dataType}
                            hasResults={false}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdatesWithAct();

                // Then it should display the submit empty results title
                expect(screen.getByText(translateLocal('search.searchResults.emptySubmitResults.title'))).toBeVisible();

                // And it should display the "Create Expense" button
                expect(screen.getByText(translateLocal('report.newReport.createExpense'))).toBeVisible();
            });

            it('should hide "Create Report" button when user has a paid group policy with expense chat disabled', async () => {
                // Given a paid group policy with expense chat disabled
                const policy = createPaidGroupPolicy(false);
                await act(async () => {
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                });

                // Given: A query string for expense search with draft status
                const queryString = buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                    from: [CURRENT_USER_ACCOUNT_ID.toString()],
                });
                const queryJSON = buildSearchQueryJSON(queryString);

                // When rendering the EmptySearchView component
                render(
                    <Wrapper>
                        <EmptySearchView
                            similarSearchHash={queryJSON?.similarSearchHash ?? 1}
                            type={dataType}
                            hasResults={false}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdatesWithAct();

                // Then it should display the submit empty results title
                expect(screen.getByText(translateLocal('search.searchResults.emptySubmitResults.title'))).toBeVisible();

                // And it should not display the "Create Expense" button
                expect(screen.queryByText(translateLocal('report.newReport.createExpense'))).not.toBeOnTheScreen();
            });
        });

        it('should show "emptyExpenseResults" when the user has deleted all expenses, even though hasResults remains true', async () => {
            const policy = createPaidGroupPolicy();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            });

            // Given: A query string for expense search
            const queryString = buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            });
            const queryJSON = buildSearchQueryJSON(queryString);

            // When rendering the EmptySearchView component
            render(
                <Wrapper>
                    <EmptySearchView
                        similarSearchHash={queryJSON?.similarSearchHash ?? 1}
                        type={dataType}
                        hasResults
                        queryJSON={queryJSON}
                    />
                </Wrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('search.searchResults.emptyExpenseResults.title'))).toBeVisible();
        });
    });

    describe('type is expense Report', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

        it('should show "emptyReportResults" when the user has deleted all expenses, even though hasResults remains true', async () => {
            const policy = createPaidGroupPolicy();
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            });

            // Given: A query string for expense report search
            const queryString = buildQueryStringFromFilterFormValues({
                type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            });
            const queryJSON = buildSearchQueryJSON(queryString);

            // When rendering the EmptySearchView component
            render(
                <Wrapper>
                    <EmptySearchView
                        similarSearchHash={queryJSON?.similarSearchHash ?? 1}
                        type={dataType}
                        hasResults
                        queryJSON={queryJSON}
                    />
                </Wrapper>,
            );

            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(translateLocal('search.searchResults.emptyReportResults.title'))).toBeVisible();
        });
    });

    describe('type is Invoice', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.INVOICE;

        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', async () => {
            // Given user hasn't clicked on "Take a test drive" yet
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});
            });

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        similarSearchHash={1}
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display send invoice and take a test drive buttons
            expect(await screen.findByText(translateLocal('workspace.invoices.sendInvoice'))).toBeVisible();
            expect(await screen.findByText(translateLocal('emptySearchView.takeATestDrive'))).toBeVisible();

            // And correct modal subtitle
            expect(screen.getByText(translateLocal('search.searchResults.emptyInvoiceResults.subtitle'))).toBeVisible();
        });

        it('should display correct buttons and subtitle when user already did "Take a test drive"', async () => {
            // Given user clicked on "Take a test drive"
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});
            });

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        similarSearchHash={1}
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display Send invoice button
            expect(await screen.findByText(translateLocal('workspace.invoices.sendInvoice'))).toBeVisible();
            expect(screen.queryByText(translateLocal('emptySearchView.takeATestDrive'))).not.toBeOnTheScreen();

            // And correct modal subtitle
            expect(screen.getByText(translateLocal('search.searchResults.emptyInvoiceResults.subtitleWithOnlyCreateButton'))).toBeVisible();
        });
    });
});
