import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {PressableWithoutFeedback} from '@components/Pressable';
import type {SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import React, {useRef} from 'react';
import {View} from 'react-native';

const MockView = View;
const MockPressable = PressableWithoutFeedback;
const mockUseRef = useRef;

const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;
const mockAvailableFilterKeys: string[] = [FILTER_KEYS.TYPE, FILTER_KEYS.FROM, FILTER_KEYS.TO, FILTER_KEYS.ATTENDEE];
const mockOnContentCreated = jest.fn<void, [string]>();
let mockFiltersForm: Partial<SearchAdvancedFiltersForm> | undefined;

jest.mock('@components/SafeTriangle', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>,
}));

jest.mock('@hooks/useAdvancedSearchFilters', () => ({
    __esModule: true,
    default: () => [mockAvailableFilterKeys],
}));

jest.mock('@components/Search/FilterComponents/AdvancedFilters/FilterList', () => ({
    __esModule: true,
    default: ({onHoverIn, onFocus}: {onHoverIn: (filterKey: string) => void; onFocus: (filterKey: string) => void}) => (
        <MockView>
            {mockAvailableFilterKeys.map((filterKey) => (
                <MockView key={filterKey}>
                    <MockPressable
                        testID={`hover-${filterKey}`}
                        accessibilityLabel={filterKey}
                        role="menuitem"
                        onPress={() => onHoverIn(filterKey)}
                    />
                    <MockPressable
                        testID={`focus-${filterKey}`}
                        accessibilityLabel={filterKey}
                        role="menuitem"
                        onPress={() => onFocus(filterKey)}
                    />
                </MockView>
            ))}
        </MockView>
    ),
}));

jest.mock('@components/Search/FilterComponents/AdvancedFilters/SearchAdvancedFiltersContent', () => ({
    __esModule: true,
    default: ({baseFilterKey}: {baseFilterKey: string}) => {
        const isCreated = mockUseRef(false);
        if (!isCreated.current) {
            isCreated.current = true;
            mockOnContentCreated(baseFilterKey);
        }

        return <MockView testID={`filter-content-${baseFilterKey}`} />;
    },
}));

jest.mock('@components/Search/hooks/useUpdateFilterQuery', () => ({
    __esModule: true,
    default: () => ({setFilterQueryParams: jest.fn(), updateFilterQueryParams: jest.fn()}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockFiltersForm, {status: 'loaded'}],
}));

const SearchAdvancedFiltersPopup = require<{
    default: React.ComponentType<{queryJSON: SearchQueryJSON | undefined}>;
}>('../../../src/components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/index.tsx').default;

const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);

beforeEach(() => {
    jest.clearAllMocks();
    mockFiltersForm = undefined;
});

describe('SearchAdvancedFiltersPopup', () => {
    it('pre-renders every available filter content', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        for (const filterKey of mockAvailableFilterKeys) {
            expect(mockOnContentCreated).toHaveBeenCalledWith(filterKey);
        }
    });

    it('keeps pre-rendered filter content mounted while changing the active filter', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        act(() => {
            fireEvent.press(screen.getByTestId(`hover-${FILTER_KEYS.FROM}`));
        });
        act(() => {
            fireEvent.press(screen.getByTestId(`hover-${FILTER_KEYS.TO}`));
        });
        act(() => {
            fireEvent.press(screen.getByTestId(`hover-${FILTER_KEYS.FROM}`));
        });

        expect(mockOnContentCreated.mock.calls.filter(([filterKey]) => filterKey === FILTER_KEYS.FROM)).toHaveLength(1);
    });

    it('switches content on keyboard focus', () => {
        render(<SearchAdvancedFiltersPopup queryJSON={queryJSON} />);

        act(() => {
            fireEvent.press(screen.getByTestId(`focus-${FILTER_KEYS.FROM}`));
        });

        expect(screen.getByTestId(`filter-content-${FILTER_KEYS.FROM}`)).toBeTruthy();
    });
});
