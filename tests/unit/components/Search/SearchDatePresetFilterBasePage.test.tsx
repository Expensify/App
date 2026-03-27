import {render} from '@testing-library/react-native';
import type {ComponentProps} from 'react';
import React from 'react';
import SearchDatePresetFilterBasePage from '@components/Search/SearchDatePresetFilterBasePage';
import type DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

let mockRouteParams: {subPage?: string} | undefined;
let mockSearchAdvancedFiltersForm: Record<string, string | null | undefined> | undefined;
let lastDateFilterBaseProps: ComponentProps<typeof DateFilterBase> | undefined;

jest.mock('@components/ScreenWrapper', () => {
    return function ScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    };
});

jest.mock('@components/Search/FilterComponents/DateFilterBase', () => {
    return function MockDateFilterBase(props: ComponentProps<typeof DateFilterBase>) {
        lastDateFilterBaseProps = props;
        return null;
    };
});

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockSearchAdvancedFiltersForm, undefined],
}));

jest.mock('@hooks/useThemeStyles', () => () => ({}));

jest.mock('@libs/actions/Search', () => ({
    updateAdvancedFilters: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    getDatePresets: jest.fn(() => []),
}));

jest.mock('@react-navigation/native', () => ({
    useRoute: () => ({params: mockRouteParams}),
}));

jest.mock('@src/types/utils/isLoadingOnyxValue', () => jest.fn(() => false));

describe('SearchDatePresetFilterBasePage', () => {
    beforeEach(() => {
        mockRouteParams = undefined;
        mockSearchAdvancedFiltersForm = {};
        lastDateFilterBaseProps = undefined;
        jest.clearAllMocks();
    });

    it('persists withdrawn draft values when the date subpage saves', () => {
        render(
            <SearchDatePresetFilterBasePage
                dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN}
                titleKey="search.filters.withdrawn"
            />,
        );

        expect(lastDateFilterBaseProps?.onDateValuesChange).toBeDefined();

        lastDateFilterBaseProps?.onDateValuesChange?.({
            [CONST.SEARCH.DATE_MODIFIERS.ON]: '2026-03-27',
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
        });

        expect(updateAdvancedFilters).toHaveBeenCalledWith({
            withdrawnOn: '2026-03-27',
            withdrawnAfter: null,
            withdrawnBefore: null,
        });
    });

    it('still saves and returns to advanced filters on submit', () => {
        render(
            <SearchDatePresetFilterBasePage
                dateKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN}
                titleKey="search.filters.withdrawn"
            />,
        );

        lastDateFilterBaseProps?.onSubmit({
            [CONST.SEARCH.DATE_MODIFIERS.ON]: '2026-03-27',
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
        });

        expect(updateAdvancedFilters).toHaveBeenCalledWith({
            withdrawnOn: '2026-03-27',
            withdrawnAfter: null,
            withdrawnBefore: null,
        });
        expect(Navigation.goBack).toHaveBeenCalled();
    });
});
