import {render, screen} from '@testing-library/react-native';

import SearchAdvancedFiltersButton from '@components/Search/SearchPageHeader/SearchAdvancedFiltersButton';

import {shouldDeferSearchFilterSync} from '@hooks/useSearchFilterSync';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import React from 'react';

jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/Search/FilterDropdowns/FilterPopupButton', () => jest.fn(() => null));
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

const mockedShouldDeferSearchFilterSync = jest.mocked(shouldDeferSearchFilterSync);
const queryJSON = buildSearchQueryJSON('type:expense category:Travel');

describe('SearchAdvancedFiltersButton', () => {
    it('disables the small-screen button while filter sync is deferred', () => {
        if (!queryJSON) {
            throw new Error('Expected query to parse');
        }
        mockedShouldDeferSearchFilterSync.mockReturnValue(true);

        render(<SearchAdvancedFiltersButton queryJSON={queryJSON} />);

        expect(screen.getByLabelText('search.filtersHeader')).toBeDisabled();
    });
});
