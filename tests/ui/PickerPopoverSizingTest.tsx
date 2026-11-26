import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import CategoryPickerModal from '@components/CategoryPicker/CategoryPickerModal';
import type PopoverWithMeasuredContentProps from '@components/PopoverWithMeasuredContent/types';
import type SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {SelectionListViewportProps} from '@components/SelectionList/SelectionListWithSections/SelectionListViewport';
import type {ListItem, SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useOnyx from '@hooks/useOnyx';
import usePickerPopoverRowCount from '@hooks/usePickerPopoverRowCount';

import * as CategoryOptionListUtils from '@libs/CategoryOptionListUtils';
import getSelectionListPopoverContentHeight from '@libs/getSelectionListPopoverContentHeight';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {TextInput, TextProps} from 'react-native';

import React from 'react';

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/CategoryOptionListUtils', () => {
    const actual = jest.requireActual<typeof CategoryOptionListUtils>('@libs/CategoryOptionListUtils');
    return {...actual, getCategoryListSections: jest.fn(actual.getCategoryListSections)};
});
const mockLoadingCategories = React.createContext(false);
jest.mock('@hooks/useLoadPolicyCategories', () => jest.fn(() => ({isLoadingPolicyCategories: jest.requireActual<typeof React>('react').useContext(mockLoadingCategories)})));
jest.mock('@hooks/useLoadPolicyTags', () => jest.fn(() => ({isLoadingPolicyTags: false})));
jest.mock('@hooks/useAutoFocusInput', () => jest.fn(() => ({inputCallbackRef: jest.fn()})));
let mockIsSmallScreenWidth = false;
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        isSmallScreenWidth: mockIsSmallScreenWidth,
        shouldUseNarrowLayout: mockIsSmallScreenWidth,
        isInLandscapeMode: false,
    })),
);
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    localeCompare: (first: string, second: string) => first.localeCompare(second),
}));

// Keep the real section and sizing logic, without depending on the modal animation or list virtualization.
let mockPopoverHeight: number | undefined;
jest.mock('@components/PopoverWithMeasuredContent', () => {
    const {Fragment: MockFragment} = jest.requireActual<typeof React>('react');
    return ({popoverDimensions, isVisible, children}: PopoverWithMeasuredContentProps) => {
        mockPopoverHeight = popoverDimensions?.height;
        // Switching between a bottom sheet and a popover remounts the picker.
        return isVisible ? <MockFragment key={String(mockIsSmallScreenWidth)}>{children}</MockFragment> : null;
    };
});

jest.mock('@components/SelectionList/SelectionListWithSections', () => {
    const {Text: MockText, TextInput: MockTextInput} = jest.requireActual<{Text: React.ComponentType<TextProps>; TextInput: typeof TextInput}>('react-native');
    const LegacyList = ({sections, textInputOptions, shouldShowTextInput, shouldShowLoadingPlaceholder}: SelectionListWithSectionsProps<ListItem>) => (
        <>
            {shouldShowLoadingPlaceholder && <MockText testID="loading-placeholder" />}
            {shouldShowTextInput && (
                <MockTextInput
                    accessibilityLabel={textInputOptions?.label}
                    value={textInputOptions?.value}
                    onChangeText={textInputOptions?.onChangeText}
                />
            )}
            {sections.flatMap(({sectionIndex, data}) => data.map(({keyForList, text}) => <MockText key={`${sectionIndex}-${keyForList}`}>{text}</MockText>))}
        </>
    );
    return Object.assign(LegacyList, {
        Root: ({children}: {children: React.ReactNode}) => children,
        SearchInput: ({label, value, onChangeText}: React.ComponentProps<typeof SelectionListWithSections.SearchInput>) => (
            <MockTextInput
                accessibilityLabel={label}
                value={value}
                onChangeText={onChangeText}
            />
        ),
        SearchStatus: () => null,
        Viewport: ({sections, loading}: SelectionListViewportProps<ListItem>) => (
            <>
                {loading}
                {sections.flatMap(({sectionIndex, data}) => data.map(({keyForList, text}) => <MockText key={`${sectionIndex}-${keyForList}`}>{text}</MockText>))}
            </>
        ),
    });
});

const POLICY_ID = 'policy1';
const popoverProps = {
    policyID: POLICY_ID,
    onClose: jest.fn(),
    anchorPosition: {horizontal: 0, vertical: 500},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    popoverHeight: 500,
    shouldFitContentHeight: true,
    isVisible: true,
};

describe('picker popover sizing', () => {
    beforeEach(() => {
        jest.useFakeTimers({doNotFake: ['nextTick']});
        mockPopoverHeight = undefined;
        mockIsSmallScreenWidth = false;
        jest.mocked(useLoadPolicyCategories).mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('uses the final search edit when back-to-back updates are batched', () => {
        // Given two available rows and no active query.
        const {result, rerender} = renderHook((rowCount: number) => usePickerPopoverRowCount(() => [{data: Array.from({length: rowCount})}], 0), {initialProps: 2});
        expect(result.current.rowCount).toBe(2);

        // When the user types and clears before the first update commits.
        act(() => {
            result.current.setRowCountFrozen(true);
            result.current.setRowCountFrozen(false);
        });

        // Then a newly available row can change the unfiltered height.
        rerender(3);
        expect(result.current.rowCount).toBe(3);

        // When the user clears an active search and resumes typing in the same batch.
        act(() => result.current.setRowCountFrozen(true));
        act(() => {
            result.current.setRowCountFrozen(false);
            result.current.setRowCountFrozen(true);
        });

        // Then further rows do not change the height while the query is active.
        rerender(4);
        expect(result.current.rowCount).toBe(3);
    });

    it('fits nested category rows and holds that height until the debounced search clears', () => {
        // Given two categories under one parent, and search enabled for this list
        let categoryNames = ['Travel: Flights', 'Travel: Hotels'];
        jest.mocked(useOnyx).mockImplementation((key) => {
            const categories = Object.fromEntries(categoryNames.map((name) => [name, {name, unencodedName: name, enabled: true}]));
            return [key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}` ? categories : undefined, {status: 'loaded'}];
        });
        const modal = (
            <CategoryPickerModal
                {...popoverProps}
                searchInputThreshold={2}
            />
        );
        const {rerender} = render(modal);
        expect(screen.getByText('Travel')).toBeOnTheScreen();
        const initialHeight = getSelectionListPopoverContentHeight({
            optionCount: 4,
            isSearchable: true,
        });
        expect(mockPopoverHeight).toBe(initialHeight);

        // When the user filters the list and another category arrives in the background
        fireEvent.changeText(screen.getByLabelText('common.search'), 'Flights');
        act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY));
        expect(screen.queryByText('Hotels')).not.toBeOnTheScreen();
        const buildSections = jest.mocked(CategoryOptionListUtils.getCategoryListSections);
        buildSections.mockClear();
        categoryNames = [...categoryNames, 'Meals'];
        rerender(React.cloneElement(modal));

        // Then the search box stays put until the unfiltered list is shown again
        expect(mockPopoverHeight).toBe(initialHeight);
        expect(buildSections.mock.calls.map(([options]) => options.searchValue)).toEqual(['Flights']);
        fireEvent.changeText(screen.getByLabelText('common.search'), '');
        expect(mockPopoverHeight).toBe(initialHeight);
        act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY));
        expect(screen.getByText('Meals')).toBeOnTheScreen();
        expect(mockPopoverHeight).toBe(
            getSelectionListPopoverContentHeight({
                optionCount: 5,
                isSearchable: true,
            }),
        );

        // A viewport change replaces the list. An old pending search must not apply to the new list.
        fireEvent.changeText(screen.getByLabelText('common.search'), 'Flights');
        mockIsSmallScreenWidth = true;
        rerender(React.cloneElement(modal));
        act(() => jest.advanceTimersByTime(CONST.TIMING.USE_DEBOUNCED_STATE_DELAY));
        expect(screen.getByText('Meals')).toBeOnTheScreen();
        expect(screen.getByLabelText('common.search')).toHaveProp('value', '');
    });

    it('keeps the tag list at its unfiltered height while searching and starts fresh on reopen', () => {
        // Given a searchable tag list with a recent tag and its own section heading
        let names = ['Engineering', 'Design'];
        jest.mocked(useOnyx).mockImplementation((key, options) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY_TAGS}${POLICY_ID}`) {
                const tags = Object.fromEntries(names.map((name) => [name, {name, enabled: true}]));
                return [
                    {
                        Department: {
                            name: 'Department',
                            orderWeight: 0,
                            required: false,
                            tags,
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${POLICY_ID}`) {
                const recentlyUsed = {Department: ['Engineering']};
                const value = options?.selector ? options.selector(recentlyUsed) : recentlyUsed;
                return [value && typeof value === 'object' ? value : undefined, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        const modal = (
            <TagPickerModal
                {...popoverProps}
                searchInputThreshold={2}
            />
        );
        const {rerender} = render(modal);
        const initialHeight = getSelectionListPopoverContentHeight({
            optionCount: 5,
            isSearchable: true,
        });
        expect(mockPopoverHeight).toBe(initialHeight);

        // When the user narrows the list and more tags become available
        fireEvent.changeText(screen.getByLabelText('common.search'), 'Design');
        names = [...names, 'Support'];
        rerender(React.cloneElement(modal));

        // Then the dropdown stays the same height until the user closes it and opens the full list again
        expect(screen.getByText('Design')).toBeOnTheScreen();
        expect(screen.queryByText('Engineering')).not.toBeOnTheScreen();
        expect(mockPopoverHeight).toBe(initialHeight);
        rerender(React.cloneElement(modal, {isVisible: false}));
        rerender(React.cloneElement(modal));
        expect(screen.getByText('Support')).toBeOnTheScreen();
        expect(mockPopoverHeight).toBe(
            getSelectionListPopoverContentHeight({
                optionCount: 6,
                isSearchable: true,
            }),
        );
    });

    it('loads categories only when opened and fits the flat list once loaded', () => {
        // Given a closed picker without categories in the cache
        const categoryNames = ['Flights', 'Hotels', 'Meals'];
        const categories = Object.fromEntries(categoryNames.map((name) => [name, {name, unencodedName: name, enabled: true}]));
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loaded'}]);
        const getModal = (isVisible: boolean, isLoading: boolean) => (
            <mockLoadingCategories.Provider value={isLoading}>
                <CategoryPickerModal
                    {...popoverProps}
                    selectedCategory="Flights"
                    isVisible={isVisible}
                />
            </mockLoadingCategories.Provider>
        );
        const {rerender} = render(getModal(false, true));
        expect(useLoadPolicyCategories).not.toHaveBeenCalled();

        // When the picker opens before the category list arrives
        rerender(getModal(true, true));
        expect(useLoadPolicyCategories).toHaveBeenCalledWith(POLICY_ID);
        expect(screen.getByTestId('loading-placeholder')).toBeOnTheScreen();
        expect(screen.queryByText('Flights')).not.toBeOnTheScreen();
        jest.mocked(useOnyx).mockImplementation((key) => [key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}` ? categories : undefined, {status: 'loaded'}]);
        rerender(getModal(true, false));

        // Then the three categories replace the skeleton and fit without a search box
        expect(screen.queryByTestId('loading-placeholder')).not.toBeOnTheScreen();
        expect(screen.getByText('Meals')).toBeOnTheScreen();
        expect(screen.queryByLabelText('common.search')).not.toBeOnTheScreen();
        expect(mockPopoverHeight).toBe(
            getSelectionListPopoverContentHeight({
                optionCount: 3,
                isSearchable: false,
            }),
        );
    });
});
