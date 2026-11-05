import {fireEvent, render, screen} from '@testing-library/react-native';

import TextFilterPopup from '@components/Search/FilterDropdowns/TextFilterPopup';

import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

import {NavigationContainer} from '@react-navigation/native';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));

describe('TextFilterPopup', () => {
    it.each([FILTER_KEYS.DESCRIPTION, FILTER_KEYS.TITLE])('applies the %s text filter without Merchant fields', (baseFilterKey) => {
        const closeOverlay = jest.fn();
        const updateFilterForm = jest.fn();
        render(
            <NavigationContainer>
                <TextFilterPopup
                    baseFilterKey={baseFilterKey}
                    values={{[baseFilterKey]: 'Office'}}
                    label="common.description"
                    closeOverlay={closeOverlay}
                    updateFilterForm={updateFilterForm}
                />
            </NavigationContainer>,
        );

        expect(screen.queryByText('search.filters.merchant.matchType')).not.toBeOnTheScreen();
        fireEvent.changeText(screen.getByLabelText('common.description'), 'Supplies');
        expect(screen.queryByText('search.filters.filterType.is.negative')).not.toBeOnTheScreen();
        fireEvent.press(screen.getByText('common.apply'));

        expect(updateFilterForm).toHaveBeenCalledWith({
            [baseFilterKey]: 'Supplies',
            [`${baseFilterKey}Not`]: undefined,
        });
        expect(closeOverlay).toHaveBeenCalledTimes(1);
    });
});
