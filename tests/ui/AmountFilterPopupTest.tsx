import {fireEvent, render, screen} from '@testing-library/react-native';

import {CurrencyListActionsContext} from '@components/CurrencyListContextProvider';
import {defaultCurrencyListActionsContextValue} from '@components/CurrencyListContextProvider/default';
import AmountPopup from '@components/Search/FilterDropdowns/AmountPopup';

import {convertToDisplayStringWithoutCurrencyForLocale, getCurrencyDecimals} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';

import {NavigationContainer} from '@react-navigation/native';

import currencyList from '../unit/currencyList.json';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));

describe('AmountPopup', () => {
    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT, CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT])('respects comparison currencies in the %s summary', (baseFilterKey) => {
        // Given a range whose bounds use different zero-decimal currencies.
        const value = {
            [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: undefined,
            [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: '0.00 VND',
            [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: '1200.00 JPY',
        };
        const updateFilterForm = jest.fn();
        const convertToDisplayStringWithoutCurrency = (amount: number, currency?: string) =>
            convertToDisplayStringWithoutCurrencyForLocale(CONST.LOCALES.EN, amount, currency, (currencyCode) => getCurrencyDecimals(currencyCode, currencyList));

        // When the chip popup displays the saved range.
        render(
            <CurrencyListActionsContext.Provider value={{...defaultCurrencyListActionsContextValue, convertToDisplayStringWithoutCurrency}}>
                <NavigationContainer>
                    <AmountPopup
                        baseFilterKey={baseFilterKey}
                        label="iou.amount"
                        value={value}
                        updateFilterForm={updateFilterForm}
                        closeOverlay={jest.fn()}
                    />
                </NavigationContainer>
            </CurrencyListActionsContext.Provider>,
        );

        // Then each bound uses its currency's precision without changing the saved operands.
        expect(screen.getByText('0 VND')).toBeOnTheScreen();
        expect(screen.getByText('1,200 JPY')).toBeOnTheScreen();
        fireEvent.press(screen.getByText('common.apply'));
        expect(updateFilterForm).toHaveBeenCalledWith({
            [`${baseFilterKey}EqualTo`]: undefined,
            [`${baseFilterKey}GreaterThan`]: value[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN],
            [`${baseFilterKey}LessThan`]: value[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN],
        });
    });
});
