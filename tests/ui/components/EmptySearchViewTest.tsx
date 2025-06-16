import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {translateLocal} from '@libs/Localize';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

// Wrapper component with OnyxProvider
function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxProvider>
            <LocaleContextProvider>{children}</LocaleContextProvider>
        </OnyxProvider>
    );
}

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
