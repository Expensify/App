import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import LottieAnimations from '@components/LottieAnimations';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useSearchTypeMenuSections');

const mockUseSearchTypeMenuSections = jest.mocked(useSearchTypeMenuSections);

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

const SEARCH_KEY_VALUES = Object.values(CONST.SEARCH.SEARCH_KEYS) as Array<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>>;

const createMockMenuItem = (key: ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, overrides: Partial<SearchTypeMenuItem> = {}): SearchTypeMenuItem => ({
    key,
    translationPath: 'common.submit',
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    icon: {} as IconAsset,
    searchQuery: '',
    searchQueryJSON: undefined,
    hash: CONST.DEFAULT_NUMBER_ID,
    similarSearchHash: CONST.DEFAULT_NUMBER_ID,
    ...overrides,
});

const buildSuggestedSearchMocks = (
    itemOverrides: Partial<Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem>> = {},
    visibilityOverrides: Partial<Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, boolean>> = {},
) => {
    const suggestedSearches = {} as Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, SearchTypeMenuItem>;
    const suggestedSearchesVisibility = {} as Record<ValueOf<typeof CONST.SEARCH.SEARCH_KEYS>, boolean>;

    SEARCH_KEY_VALUES.forEach((key) => {
        suggestedSearches[key] = itemOverrides[key] ?? createMockMenuItem(key);
        suggestedSearchesVisibility[key] = visibilityOverrides[key] ?? false;
    });

    return {suggestedSearches, suggestedSearchesVisibility};
};

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
        const {suggestedSearches, suggestedSearchesVisibility} = buildSuggestedSearchMocks();
        mockUseSearchTypeMenuSections.mockReturnValue({
            typeMenuSections: [],
            suggestedSearchesReady: true,
            suggestedSearches,
            suggestedSearchesVisibility,
        });
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
                const submitMenuItem: SearchTypeMenuItem = {
                    key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
                    translationPath: 'common.submit',
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    icon: {} as IconAsset,
                    searchQuery: queryString,
                    searchQueryJSON: queryJSON,
                    hash: queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID,
                    similarSearchHash: queryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID,
                    emptyState: {
                        headerMedia: LottieAnimations.Fireworks,
                        title: 'search.searchResults.emptySubmitResults.title',
                        subtitle: 'search.searchResults.emptySubmitResults.subtitle',
                        buttons: [
                            {
                                buttonText: 'report.newReport.createReport',
                                buttonAction: () => {},
                            },
                        ],
                    },
                };
                const todoSection: SearchTypeMenuSection = {
                    translationPath: 'common.todo',
                    menuItems: [submitMenuItem],
                };
                const {suggestedSearches, suggestedSearchesVisibility} = buildSuggestedSearchMocks(
                    {
                        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: submitMenuItem,
                    },
                    {
                        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: true,
                    },
                );
                mockUseSearchTypeMenuSections.mockReturnValue({
                    typeMenuSections: [todoSection],
                    suggestedSearchesReady: true,
                    suggestedSearches,
                    suggestedSearchesVisibility,
                });

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

                // And it should display the "Create Report" button
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
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
                    from: [CURRENT_USER_ACCOUNT_ID.toString()],
                });
                const queryJSON = buildSearchQueryJSON(queryString);
                const submitMenuItem: SearchTypeMenuItem = {
                    key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
                    translationPath: 'common.submit',
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    icon: {} as IconAsset,
                    searchQuery: queryString,
                    searchQueryJSON: queryJSON,
                    hash: queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID,
                    similarSearchHash: queryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID,
                    emptyState: {
                        headerMedia: LottieAnimations.Fireworks,
                        title: 'search.searchResults.emptySubmitResults.title',
                        subtitle: 'search.searchResults.emptySubmitResults.subtitle',
                        buttons: [],
                    },
                };
                const todoSection: SearchTypeMenuSection = {
                    translationPath: 'common.todo',
                    menuItems: [submitMenuItem],
                };
                const {suggestedSearches, suggestedSearchesVisibility} = buildSuggestedSearchMocks(
                    {
                        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: submitMenuItem,
                    },
                    {
                        [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: true,
                    },
                );
                mockUseSearchTypeMenuSections.mockReturnValue({
                    typeMenuSections: [todoSection],
                    suggestedSearchesReady: true,
                    suggestedSearches,
                    suggestedSearchesVisibility,
                });

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

                // And it should not display the "Create Report" button
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
