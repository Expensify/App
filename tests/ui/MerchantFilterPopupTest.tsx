import {fireEvent, render, screen} from '@testing-library/react-native';

import MerchantFilterPopup from '@components/Search/FilterDropdowns/MerchantFilterPopup';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useAutoFocusInput', () => () => ({inputCallbackRef: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));

describe('MerchantFilterPopup', () => {
    it('applies the Merchant filter and closes the popup', () => {
        // Given a Merchant chip popup with a stored Contains filter
        const closeOverlay = jest.fn();
        const updateFilterForm = jest.fn();
        render(
            <NavigationContainer>
                <MerchantFilterPopup
                    baseFilterKey={FILTER_KEYS.MERCHANT}
                    values={{[FILTER_KEYS.MERCHANT]: 'I', [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS}}
                    label="common.merchant"
                    closeOverlay={closeOverlay}
                    updateFilterForm={updateFilterForm}
                />
            </NavigationContainer>,
        );

        // When the user applies the filter
        fireEvent.press(screen.getByText('common.apply'));

        // Then the popup submits the Merchant values and closes, because the chip applies changes immediately
        expect(updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        });
        expect(closeOverlay).toHaveBeenCalledTimes(1);
    });

    it('renders the input and match type options in the popup', () => {
        // Given a Merchant chip popup with a stored filter
        render(
            <NavigationContainer>
                <MerchantFilterPopup
                    baseFilterKey={FILTER_KEYS.MERCHANT}
                    values={{[FILTER_KEYS.MERCHANT]: 'I'}}
                    label="common.merchant"
                    closeOverlay={jest.fn()}
                    updateFilterForm={jest.fn()}
                />
            </NavigationContainer>,
        );

        // Then the input and both match types render inside the popup, because the popover sizes to its content and must not collapse them
        expect(screen.getByDisplayValue('I')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.contains')).toBeOnTheScreen();
        expect(screen.getByText('search.filters.merchant.equalTo')).toBeOnTheScreen();
    });

    it('applies the selected match type', () => {
        // Given a Merchant chip popup with a stored Contains filter
        const updateFilterForm = jest.fn();
        render(
            <NavigationContainer>
                <MerchantFilterPopup
                    baseFilterKey={FILTER_KEYS.MERCHANT}
                    values={{[FILTER_KEYS.MERCHANT]: 'I', [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS}}
                    label="common.merchant"
                    closeOverlay={jest.fn()}
                    updateFilterForm={updateFilterForm}
                />
            </NavigationContainer>,
        );

        // When the user selects Equal to and applies the filter
        fireEvent.press(screen.getByText('search.filters.merchant.equalTo'));
        fireEvent.press(screen.getByText('common.apply'));

        // Then the popup submits the Equal to match type
        expect(updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: 'I',
            [FILTER_KEYS.MERCHANT_NOT]: undefined,
            [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        });
    });

    it('hides the match type and clears it when the filter is negated', () => {
        // Given a Merchant chip popup with a stored Equal to filter
        const updateFilterForm = jest.fn();
        render(
            <NavigationContainer>
                <MerchantFilterPopup
                    baseFilterKey={FILTER_KEYS.MERCHANT}
                    values={{[FILTER_KEYS.MERCHANT]: 'I', [FILTER_KEYS.MERCHANT_OPERATOR]: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO}}
                    label="common.merchant"
                    closeOverlay={jest.fn()}
                    updateFilterForm={updateFilterForm}
                />
            </NavigationContainer>,
        );

        // When the user negates the filter and applies it
        fireEvent.press(screen.getByText('search.filters.filterType.is.negative'));
        fireEvent.press(screen.getByText('common.apply'));

        // Then the match type is hidden and cleared, because a negated Merchant filter always uses the not-equal operator
        expect(screen.queryByText('search.filters.merchant.equalTo')).not.toBeOnTheScreen();
        expect(updateFilterForm).toHaveBeenCalledWith({
            [FILTER_KEYS.MERCHANT]: undefined,
            [FILTER_KEYS.MERCHANT_NOT]: 'I',
            [FILTER_KEYS.MERCHANT_OPERATOR]: undefined,
        });
    });
});
