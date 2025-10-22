import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(await screen.findByText(translateLocal('iou.createExpense'))).toBeVisible();
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(await screen.findByText(translateLocal('emptySearchView.takeATestDrive'))).toBeVisible();

            // And correct modal subtitle
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(await screen.findByText(translateLocal('iou.createExpense'))).toBeVisible();
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(screen.queryByText(translateLocal('emptySearchView.takeATestDrive'))).not.toBeOnTheScreen();

            // And correct modal subtitle
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.REPORTS,
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
                            groupBy={CONST.SEARCH.GROUP_BY.REPORTS}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdatesWithAct();

                // Then it should display the submit empty results title
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                expect(screen.getByText(translateLocal('search.searchResults.emptySubmitResults.title'))).toBeVisible();

                // And it should display the "Create Report" button
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                expect(screen.getByText(translateLocal('report.newReport.createReport'))).toBeVisible();
            });

            it('should hide "Create Report" button when user has a paid group policy with expense chat disabled', async () => {
                // Given a paid group policy with expense chat disabled
                const policy = createPaidGroupPolicy(false);
                await act(async () => {
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                });

                // Given: A query string for expense search with draft status
                const queryString = buildQueryStringFromFilterFormValues({
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    groupBy: CONST.SEARCH.GROUP_BY.REPORTS,
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
                            groupBy={CONST.SEARCH.GROUP_BY.REPORTS}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdatesWithAct();

                // Then it should display the submit empty results title
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                expect(screen.getByText(translateLocal('search.searchResults.emptySubmitResults.title'))).toBeVisible();

                // And it should not display the "Create Report" button
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                expect(screen.queryByText(translateLocal('report.newReport.createReport'))).not.toBeOnTheScreen();
            });
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(await screen.findByText(translateLocal('workspace.invoices.sendInvoice'))).toBeVisible();
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(await screen.findByText(translateLocal('emptySearchView.takeATestDrive'))).toBeVisible();

            // And correct modal subtitle
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(await screen.findByText(translateLocal('workspace.invoices.sendInvoice'))).toBeVisible();
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(screen.queryByText(translateLocal('emptySearchView.takeATestDrive'))).not.toBeOnTheScreen();

            // And correct modal subtitle
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(screen.getByText(translateLocal('search.searchResults.emptyInvoiceResults.subtitleWithOnlyCreateButton'))).toBeVisible();
        });
    });
});
