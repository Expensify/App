import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CurrencyPopup from '@components/Search/FilterDropdowns/CurrencyPopup';
import GroupByPopup from '@components/Search/FilterDropdowns/GroupByPopup';
import TextInputPopup from '@components/Search/FilterDropdowns/TextInputPopup';
import ThemeProvider from '@components/ThemeProvider';

import {MouseProvider} from '@hooks/useMouseContext';

import type * as SearchUIUtils from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListState: () => ({currencyList: {}}),
    useCurrencyListActions: () => ({getCurrencySymbol: () => ''}),
}));

// The currency options come from the currency list, so they're fixed here to keep the rows known
jest.mock('@libs/SearchUIUtils', () => ({
    ...jest.requireActual<typeof SearchUIUtils>('@libs/SearchUIUtils'),
    getCurrencyOptions: () => [
        {text: 'EUR', value: 'EUR'},
        {text: 'USD', value: 'USD'},
    ],
}));

const GROUP_BY_SECTIONS = [
    {
        sectionIndex: 0,
        options: [
            {text: 'Category', value: CONST.SEARCH.GROUP_BY.CATEGORY},
            {text: 'Tag', value: CONST.SEARCH.GROUP_BY.TAG},
        ],
    },
];

// The lists inside the popups read the navigation state, which the Search page they open on provides in the app
async function renderWithProviders(popup: React.ReactElement) {
    render(
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, MouseProvider, PortalProvider]}>
                    <ThemeProvider theme={CONST.THEME.LIGHT}>{popup}</ThemeProvider>
                </ComposeProviders>
            </NavigationContainer>
        </SafeAreaProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function pressRowAndApply(rowText: string) {
    fireEvent.press(screen.getByText(rowText));
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText(translateLocal('common.apply')));
    await waitForBatchedUpdatesWithAct();
}

describe('Display option popups', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        cleanup();
    });

    describe('GroupByPopup', () => {
        async function renderGroupByPopup(onChange: jest.Mock) {
            await renderWithProviders(
                <GroupByPopup
                    sections={GROUP_BY_SECTIONS}
                    value={{text: 'Category', value: CONST.SEARCH.GROUP_BY.CATEGORY}}
                    closeOverlay={jest.fn()}
                    onBackButtonPress={jest.fn()}
                    onChange={onChange}
                    shouldShowResetButton
                />,
            );
        }

        it('clears the grouping when the selected grouping is pressed again', async () => {
            // Given the popup opened on a search grouped by category
            const onChange = jest.fn();
            await renderGroupByPopup(onChange);

            // When the selected grouping is pressed again and the change is applied
            await pressRowAndApply('Category');

            // Then no grouping is applied, so the results go back to ungrouped
            expect(onChange).toHaveBeenCalledWith(undefined);
        });

        it('switches to another grouping when an unselected grouping is pressed', async () => {
            // Given the popup opened on a search grouped by category
            const onChange = jest.fn();
            await renderGroupByPopup(onChange);

            // When another grouping is pressed and the change is applied
            await pressRowAndApply('Tag');

            // Then that grouping is applied, so pressing a row still selects it
            expect(onChange).toHaveBeenCalledWith(CONST.SEARCH.GROUP_BY.TAG);
        });
    });

    describe('CurrencyPopup', () => {
        async function renderCurrencyPopup(onChange: jest.Mock, allowDeselect: boolean) {
            await renderWithProviders(
                <CurrencyPopup
                    value="EUR"
                    onChange={onChange}
                    closeOverlay={jest.fn()}
                    allowDeselect={allowDeselect}
                    applySentryLabel={CONST.SENTRY_LABEL.SEARCH.DISPLAY_POPUP_APPLY.GROUP_CURRENCY}
                    resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.DISPLAY_POPUP_RESET.GROUP_CURRENCY}
                />,
            );
        }

        it('clears the currency when the selected currency is pressed again and deselecting is allowed', async () => {
            // Given the group currency picker, which allows deselecting, opened on EUR
            const onChange = jest.fn();
            await renderCurrencyPopup(onChange, true);

            // When EUR is pressed again and the change is applied
            await pressRowAndApply('EUR');

            // Then no currency is applied
            expect(onChange).toHaveBeenCalledWith(undefined);
        });

        it('keeps the currency when the selected currency is pressed again and deselecting is not allowed', async () => {
            // Given a currency picker that doesn't allow deselecting, like the Spend footer's, opened on EUR
            const onChange = jest.fn();
            await renderCurrencyPopup(onChange, false);

            // When EUR is pressed again and the change is applied
            await pressRowAndApply('EUR');

            // Then EUR stays selected, so the other currency pickers behave as before
            expect(onChange).toHaveBeenCalledWith(expect.objectContaining({value: 'EUR'}));
        });
    });

    describe('Reset button', () => {
        const resetLabels = {
            applySentryLabel: CONST.SENTRY_LABEL.SEARCH.DISPLAY_POPUP_APPLY.GROUP_CURRENCY,
            resetSentryLabel: CONST.SENTRY_LABEL.SEARCH.DISPLAY_POPUP_RESET.GROUP_CURRENCY,
        } as const;

        // The pickers shared with screens outside the Display popup, which show Reset unless told otherwise
        const sharedPopups: Array<[string, (shouldShowResetButton?: boolean) => React.ReactElement]> = [
            [
                'CurrencyPopup',
                (shouldShowResetButton) => (
                    <CurrencyPopup
                        value="EUR"
                        onChange={jest.fn()}
                        closeOverlay={jest.fn()}
                        shouldShowResetButton={shouldShowResetButton}
                        {...resetLabels}
                    />
                ),
            ],
            [
                'TextInputPopup',
                (shouldShowResetButton) => (
                    <TextInputPopup
                        initialValue="10"
                        onChange={jest.fn()}
                        closeOverlay={jest.fn()}
                        shouldShowResetButton={shouldShowResetButton}
                        {...resetLabels}
                    />
                ),
            ],
        ];

        // The Group by picker is only used by the Display popup, so it's always told whether to show Reset
        const popups: Array<[string, (shouldShowResetButton: boolean) => React.ReactElement]> = [
            [
                'GroupByPopup',
                (shouldShowResetButton) => (
                    <GroupByPopup
                        sections={GROUP_BY_SECTIONS}
                        value={{text: 'Category', value: CONST.SEARCH.GROUP_BY.CATEGORY}}
                        closeOverlay={jest.fn()}
                        onChange={jest.fn()}
                        onBackButtonPress={jest.fn()}
                        shouldShowResetButton={shouldShowResetButton}
                    />
                ),
            ],
            ...sharedPopups,
        ];

        it.each(popups)('%s hides Reset when the option matches the default', async (_, renderPopup) => {
            // Given an option whose value already matches the default, so resetting it would change nothing
            // When its popup opens
            await renderWithProviders(renderPopup(false));

            // Then only Apply is offered
            expect(screen.queryByText(translateLocal('common.reset'))).not.toBeOnTheScreen();
            expect(screen.getByText(translateLocal('common.apply'))).toBeOnTheScreen();
        });

        it.each(popups)('%s shows Reset when the option differs from the default', async (_, renderPopup) => {
            // Given an option whose value differs from the default
            // When its popup opens
            await renderWithProviders(renderPopup(true));

            // Then Reset is offered next to Apply
            expect(screen.getByText(translateLocal('common.reset'))).toBeOnTheScreen();
        });

        it.each(sharedPopups)('%s shows Reset when not told otherwise, like the pickers outside the Display popup', async (_, renderPopup) => {
            // Given a popup used outside the Display popup, which doesn't say whether to show Reset
            // When it opens
            await renderWithProviders(renderPopup());

            // Then Reset is still offered, as before
            expect(screen.getByText(translateLocal('common.reset'))).toBeOnTheScreen();
        });
    });
});
