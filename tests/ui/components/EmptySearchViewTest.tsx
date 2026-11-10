import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import EmptySearchView from '@pages/Search/EmptySearchView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// The real button needs a navigator. These tests only care whether the empty state offers it.
jest.mock('@components/BookTravelButton', () => {
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return {
        __esModule: true,
        default: ({text}: {text: string}) => <Text>{text}</Text>,
    };
});

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
const createPolicy = (type: Policy['type'] = CONST.POLICY.TYPE.TEAM) => ({
    id: POLICY_ID,
    type,
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

            it('should display "Create Report" button when user has a group policy', async () => {
                // Given a group policy
                const paidGroupPolicy = createPolicy();
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
                            type={queryJSON?.type ?? dataType}
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

            it('should hide "Create Report" button when user has a personal policy', async () => {
                // Given a personal policy
                const policy = createPolicy(CONST.POLICY.TYPE.PERSONAL);
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
                            type={queryJSON?.type ?? dataType}
                            hasResults={false}
                        />
                    </Wrapper>,
                );
                await waitForBatchedUpdatesWithAct();

                // Then it should fall back to the generic report empty state
                expect(screen.getByText(translateLocal('search.searchResults.emptyReportResults.title'))).toBeVisible();

                // And it should show the generic report actions instead of the submit suggestion CTA
                expect(screen.getByText(translateLocal('emptySearchView.takeATestDrive'))).toBeVisible();
            });
        });

        it('should show "emptyExpenseResults" when the user has deleted all expenses, even though hasResults remains true', async () => {
            const policy = createPolicy();
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
            const policy = createPolicy();
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
        const INVOICE_POLICY_ID = 'invoicePolicy';
        const createInvoiceEnabledPolicy = () => ({
            id: INVOICE_POLICY_ID,
            name: 'Invoice Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            areInvoicesEnabled: true,
        });

        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', async () => {
            // Given user hasn't clicked on "Take a test drive" yet and has an invoice-enabled workspace
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});
                await Onyx.merge(ONYXKEYS.SESSION, SESSION);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${INVOICE_POLICY_ID}`, createInvoiceEnabledPolicy());
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
            // Given user clicked on "Take a test drive" and has an invoice-enabled workspace
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});
                await Onyx.merge(ONYXKEYS.SESSION, SESSION);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${INVOICE_POLICY_ID}`, createInvoiceEnabledPolicy());
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

        it('should hide Send invoice button when user cannot send invoices', async () => {
            // Given user has no invoice-enabled workspace
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});
                await Onyx.merge(ONYXKEYS.SESSION, SESSION);
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

            // Then it should not display Send invoice button
            expect(screen.queryByText(translateLocal('workspace.invoices.sendInvoice'))).not.toBeOnTheScreen();

            // And should show the cannot-send subtitle
            expect(screen.getByText(translateLocal('search.searchResults.emptyInvoiceResults.subtitleCannotSend'))).toBeVisible();
        });
    });
    describe('type is Trip', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.TRIP;
        const TRAVEL_POLICY_ID = 'travelPolicy';

        const renderTripEmptyState = async (policy: Partial<Policy>, betas: Beta[]) => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, SESSION);
                await Onyx.set(ONYXKEYS.BETAS, betas);
                await Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, TRAVEL_POLICY_ID);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${TRAVEL_POLICY_ID}`, {...createPolicy(), id: TRAVEL_POLICY_ID, ...policy});
            });
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
        };

        it('shows Book a trip once the workspace is set up for travel, before the terms are accepted', async () => {
            // Given a TravelApproval user whose workspace is set up in Spotnana but hasn't accepted the terms yet
            // When the travel empty state renders
            await renderTripEmptyState({travelSettings: {spotnanaCompanyID: 'company', hasAcceptedTerms: false}}, [CONST.BETAS.TRAVEL_APPROVAL]);

            // Then Book a trip shows, like the other Book travel entry points, and the button itself handles the terms
            expect(screen.getByText(translateLocal('search.searchResults.emptyTripResults.buttonText'))).toBeOnTheScreen();
        });

        it('hides Book a trip when Travel is switched on but the workspace is not set up', async () => {
            // Given a TravelApproval user whose workspace only has the Travel switch on
            // When the travel empty state renders
            await renderTripEmptyState({isTravelEnabled: true}, [CONST.BETAS.TRAVEL_APPROVAL]);

            // Then Book a trip doesn't show, since there's nothing to book through yet
            expect(screen.queryByText(translateLocal('search.searchResults.emptyTripResults.buttonText'))).not.toBeOnTheScreen();
        });

        it('keeps showing Book a trip from the Travel switch without the beta', async () => {
            // Given a user without the TravelApproval beta whose workspace has the Travel switch on
            // When the travel empty state renders
            await renderTripEmptyState({isTravelEnabled: true}, []);

            // Then Book a trip shows as before
            expect(screen.getByText(translateLocal('search.searchResults.emptyTripResults.buttonText'))).toBeOnTheScreen();
        });
    });
});
