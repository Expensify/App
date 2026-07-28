import {fireEvent, render, screen} from '@testing-library/react-native';

import SearchAdvancedFiltersButton from '@components/Search/SearchPageHeader/SearchAdvancedFiltersButton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {shouldDeferSearchFilterSync} from '@hooks/useSearchFilterSync';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ROUTES from '@src/ROUTES';

import React from 'react';

jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/Search/FilterDropdowns/FilterPopupButton', () => jest.fn(({renderButton}) => renderButton({onPress: jest.fn(), ref: {current: null}, isExpanded: false})));
jest.mock('@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup', () => jest.fn(() => null));
jest.mock('@hooks/useFilterFormValues', () => jest.fn(() => ({})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Filter: 'filter'})}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: true, isMediumScreenWidth: false})));
jest.mock('@hooks/useSearchFilterSync', () => ({
    __esModule: true,
    default: jest.fn(),
    shouldDeferSearchFilterSync: jest.fn(),
}));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({icon: 'black'})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        searchActionsBar: jest.fn(() => ({})),
        buttonHoveredBG: {},
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

const mockedShouldDeferSearchFilterSync = jest.mocked(shouldDeferSearchFilterSync);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockedNavigate = jest.mocked(Navigation.navigate);
const queryJSON = buildSearchQueryJSON('type:expense category:Travel');

describe('SearchAdvancedFiltersButton', () => {
    it.each([
        ['small', true, false],
        ['medium', false, true],
        ['desktop', false, false],
    ])('enables the %s-screen button after deferred filter sync finishes', (_layout, isSmallScreenWidth, isMediumScreenWidth) => {
        if (!queryJSON) {
            throw new Error('Expected query to parse');
        }
        mockedUseResponsiveLayout.mockReturnValue({isSmallScreenWidth, isMediumScreenWidth});
        mockedShouldDeferSearchFilterSync.mockReturnValue(true);

        const {rerender} = render(<SearchAdvancedFiltersButton queryJSON={queryJSON} />);

        expect(screen.getByLabelText('search.filtersHeader')).toBeDisabled();

        mockedShouldDeferSearchFilterSync.mockReturnValue(false);
        rerender(<SearchAdvancedFiltersButton queryJSON={{...queryJSON}} />);

        const filtersButton = screen.getByLabelText('search.filtersHeader');
        expect(filtersButton).toBeEnabled();

        if (isSmallScreenWidth) {
            fireEvent.press(filtersButton);
            expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_ADVANCED_FILTERS);
        }
    });
});
