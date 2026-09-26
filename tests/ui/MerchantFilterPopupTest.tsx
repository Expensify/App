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
});
