import {renderHook} from '@testing-library/react-native';

import useLoadSearchCategoryData from '@hooks/useLoadSearchCategoryData';

import {openSearchCategoryFiltersPage} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

const mockOnyxData: Record<string, unknown> = {};

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => [mockOnyxData[key]],
}));
jest.mock('@libs/actions/Search', () => ({openSearchCategoryFiltersPage: jest.fn()}));

const mockedOpenSearchCategoryFiltersPage = jest.mocked(openSearchCategoryFiltersPage);

describe('useLoadSearchCategoryData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        for (const key of Object.keys(mockOnyxData)) {
            delete mockOnyxData[key];
        }
    });

    it('reuses an in-flight category request', () => {
        mockOnyxData[ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED] = false;
        mockOnyxData[ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_CATEGORY_DATA] = true;

        const {rerender} = renderHook(() => useLoadSearchCategoryData({shouldRefresh: true}));

        expect(mockedOpenSearchCategoryFiltersPage).not.toHaveBeenCalled();

        mockOnyxData[ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED] = true;
        mockOnyxData[ONYXKEYS.RAM_ONLY_IS_LOADING_SEARCH_FILTERS_CATEGORY_DATA] = false;
        rerender(undefined);

        expect(mockedOpenSearchCategoryFiltersPage).not.toHaveBeenCalled();
    });
});
