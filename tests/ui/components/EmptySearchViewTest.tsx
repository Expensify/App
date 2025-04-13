import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import EmptySearchView from '@pages/Search/EmptySearchView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@components/ConfirmedRoute.tsx');

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

        it('should display correct buttons and subtitle when user has not clicked on "Take a tour"', async () => {
            // Given user hasn't clicked on "Take a tour" yet
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display create expenses and take a tour buttons
            expect(await screen.findByText('Create expense')).toBeVisible();
            expect(await screen.findByText('Take a tour')).toBeVisible();

            // And correct modal subtitle
            expect(screen.getByText('Create an expense or take a tour of Expensify to learn more.')).toBeVisible();
        });

        it('should display correct buttons and subtitle when user already did "Take a tour"', async () => {
            // Given user clicked on "Take a tour"
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display create expenses button
            expect(await screen.findByText('Create expense')).toBeVisible();
            expect(screen.queryByText('Take a tour')).not.toBeOnTheScreen();

            // And correct modal subtitle
            expect(screen.getByText('Use the green button below to create an expense.')).toBeVisible();
        });
    });

    describe('type is Invoice', () => {
        const dataType = CONST.SEARCH.DATA_TYPES.INVOICE;

        it('should display correct buttons and subtitle when user has not clicked on "Take a tour"', async () => {
            // Given user hasn't clicked on "Take a tour" yet
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: false});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display send invoice and take a tour buttons
            expect(await screen.findByText('Send invoice')).toBeVisible();
            expect(await screen.findByText('Take a tour')).toBeVisible();

            // And correct modal subtitle
            expect(screen.getByText('Send an invoice or take a tour of Expensify to learn more.')).toBeVisible();
        });

        it('should display correct buttons and subtitle when user already did "Take a tour"', async () => {
            // Given user clicked on "Take a tour"
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true});

            // Render component
            render(
                <Wrapper>
                    <EmptySearchView
                        type={dataType}
                        hasResults={false}
                    />
                </Wrapper>,
            );

            // Then it should display Send invoice button
            expect(await screen.findByText('Send invoice')).toBeVisible();
            expect(screen.queryByText('Take a tour')).not.toBeOnTheScreen();

            // And correct modal subtitle
            expect(screen.getByText('Use the green button below to send an invoice.')).toBeVisible();
        });
    });
});
