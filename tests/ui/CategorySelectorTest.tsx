import {render} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import CategorySelector from '@components/Search/FilterComponents/CategorySelector';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {openSearchCategoryFiltersPage} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

jest.mock('@components/Search/FilterComponents/MultiSelect', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: () => false},
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useTheme', () => jest.fn(() => ({spinner: 'green'})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);
jest.mock('@libs/actions/Search', () => ({openSearchCategoryFiltersPage: jest.fn()}));

describe('CategorySelector', () => {
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedUseNetwork = jest.mocked(useNetwork);
    const mockedOpenSearchCategoryFiltersPage = jest.mocked(openSearchCategoryFiltersPage);
    const mockedActivityIndicator = jest.mocked(ActivityIndicator);

    beforeEach(() => {
        mockedOpenSearchCategoryFiltersPage.mockClear();
        mockedActivityIndicator.mockClear();
        (mockedUseOnyx as jest.Mock).mockImplementation((key) => {
            if (key === ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED) {
                return [true];
            }
            if (key === ONYXKEYS.PERSONAL_POLICY_ID) {
                return [undefined];
            }
            return [{}];
        });
    });

    it('loads categories when opened online', () => {
        mockedUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);

        render(
            <CategorySelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        expect(mockedOpenSearchCategoryFiltersPage).toHaveBeenCalledTimes(1);
    });

    it('uses cached categories without requesting data while offline', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);

        render(
            <CategorySelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        expect(mockedOpenSearchCategoryFiltersPage).not.toHaveBeenCalled();
    });

    it('shows a loading indicator while categories are loading online', () => {
        mockedUseNetwork.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        (mockedUseOnyx as jest.Mock).mockImplementation((key) => {
            if (key === ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED) {
                return [false];
            }
            if (key === ONYXKEYS.PERSONAL_POLICY_ID) {
                return [undefined];
            }
            return [{}];
        });

        render(
            <CategorySelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        expect(mockedActivityIndicator).toHaveBeenCalledTimes(1);
    });
});
