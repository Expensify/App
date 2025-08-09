import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {translateLocal} from '@libs/Localize';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

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
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    describe('type is Expense', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.EXPENSE;

        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', async () => {
            // Given user hasn't clicked on "Take a test drive" yet
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        hash={1}
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );
            await waitForBatchedUpdates();

            // Then it should display create expenses and take a test drive buttons
            expect(await screen.findByText(translateLocal('iou.createExpense'))).toBeVisible();
            expect(await screen.findByText(translateLocal('emptySearchView.takeATestDrive'))).toBeVisible();

            // And correct modal subtitle
            expect(screen.getByText(translateLocal('search.searchResults.emptyExpenseResults.subtitle'))).toBeVisible();
        });

        it('should display correct buttons and subtitle when user already did "Take a test drive"', async () => {
            // Given user clicked on "Take a test drive"
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        hash={1}
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
                await Onyx.merge(ONYXKEYS.SESSION, SESSION);
            });

            afterEach(() => {
                Onyx.clear();
            });

            it('should display "Create Report" button when user has a paid group policy with expense chat enabled', async () => {
                // Given a paid group policy with expense chat enabled
                const paidGroupPolicy = createPaidGroupPolicy();
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${paidGroupPolicy.id}`, paidGroupPolicy);

                // Given a query string for expense search with draft status
                const queryString = buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.REPORTS,
                    status: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
                    from: [CURRENT_USER_ACCOUNT_ID.toString()],
                });
                const queryJSON = buildSearchQueryJSON(queryString);

                // When rendering the EmptySearchView component
                render(
                    <Wrapper>
                        <EmptySearchView
                            hash={queryJSON?.hash ?? 1}
                            type={dataType}
                            hasResults={false}
                            groupBy={CONST.SEARCH.GROUP_BY.REPORTS}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdates();

                // Then it should display the submit empty results title
                expect(screen.getByText(translateLocal('search.searchResults.emptySubmitResults.title'))).toBeVisible();

                // And it should display the "Create Report" button
                expect(screen.getByText(translateLocal('report.newReport.createReport'))).toBeVisible();
            });

            it('should hide "Create Report" button when user has a paid group policy with expense chat disabled', async () => {
                // Given a paid group policy with expense chat disabled
                const policy = createPaidGroupPolicy(false);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

                // Given: A query string for expense search with draft status
                const queryString = buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.REPORTS,
                    status: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
                    from: [CURRENT_USER_ACCOUNT_ID.toString()],
                });
                const queryJSON = buildSearchQueryJSON(queryString);

                // When rendering the EmptySearchView component
                render(
                    <Wrapper>
                        <EmptySearchView
                            hash={queryJSON?.hash ?? 1}
                            type={dataType}
                            hasResults={false}
                            groupBy={CONST.SEARCH.GROUP_BY.REPORTS}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdates();

                // Then it should display the submit empty results title
                expect(screen.getByText(translateLocal('search.searchResults.emptySubmitResults.title'))).toBeVisible();

                // And it should not display the "Create Report" button
                expect(screen.queryByText(translateLocal('report.newReport.createReport'))).not.toBeOnTheScreen();
            });
        });
    });

    describe('type is Invoice', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.INVOICE;

        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', async () => {
            // Given user hasn't clicked on "Take a test drive" yet
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        hash={1}
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
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        hash={1}
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
