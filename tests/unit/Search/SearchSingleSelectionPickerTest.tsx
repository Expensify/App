import * as NativeNavigation from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import type {SearchSingleSelectionPickerItem} from '@components/Search/SearchSingleSelectionPicker';
import type Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ReactLocal.forwardRef<
        {scrollToIndex: (params: {index: number}) => void},
        Omit<React.ComponentProps<typeof RN.ScrollView>, 'children'> & {
            data?: unknown[];
            renderItem?: (info: {item: unknown; index: number; target: string}) => React.ReactNode;
            keyExtractor?: (item: unknown, index: number) => string;
            ListHeaderComponent?: React.ReactNode;
            ListFooterComponent?: React.ReactNode;
            getItemType?: unknown;
            extraData?: unknown;
            initialScrollIndex?: number;
            onEndReached?: unknown;
            onEndReachedThreshold?: unknown;
            ListFooterComponentStyle?: unknown;
        }
    >(
        (
            {
                data,
                renderItem,
                keyExtractor,
                ListHeaderComponent,
                ListFooterComponent,
                getItemType: _getItemType,
                extraData: _extraData,
                initialScrollIndex: _initialScrollIndex,
                onEndReached: _onEndReached,
                onEndReachedThreshold: _onEndReachedThreshold,
                ListFooterComponentStyle: _ListFooterComponentStyle,
                ...scrollViewProps
            },
            ref,
        ) => {
            ReactLocal.useImperativeHandle(ref, () => ({scrollToIndex: jest.fn()}));

            return ReactLocal.createElement(
                RN.ScrollView,
                scrollViewProps,
                ListHeaderComponent ?? null,
                ...(data ?? []).map((item, index) =>
                    ReactLocal.createElement(ReactLocal.Fragment, {key: keyExtractor?.(item, index) ?? String(index)}, renderItem?.({item, index, target: 'Cell'})),
                ),
                ListFooterComponent ?? null,
            );
        },
    );

    return {FlashList};
});

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(() => true),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => {
            if (key === 'common.none') {
                return 'None';
            }
            if (key === 'common.search') {
                return 'Search';
            }
            if (key === 'common.noResultsFound') {
                return 'No results found';
            }
            return key;
        }),
        numberFormat: jest.fn((num: number) => num.toString()),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

const mockItems: SearchSingleSelectionPickerItem[] = [
    {name: 'Food', value: 'food'},
    {name: 'Travel', value: 'travel'},
    {name: 'Office', value: 'office'},
];

function renderPicker(props: Partial<React.ComponentProps<typeof SearchSingleSelectionPicker>> = {}) {
    const defaultProps: React.ComponentProps<typeof SearchSingleSelectionPicker> = {
        items: mockItems,
        initiallySelectedItem: undefined,
        onSaveSelection: jest.fn(),
        shouldAutoSave: true,
        ...props,
    };

    return render(
        <OnyxListItemProvider>
            <SearchSingleSelectionPicker
                items={defaultProps.items}
                initiallySelectedItem={defaultProps.initiallySelectedItem}
                onSaveSelection={defaultProps.onSaveSelection}
                shouldAutoSave={defaultProps.shouldAutoSave}
                allowNoneOption={defaultProps.allowNoneOption}
            />
        </OnyxListItemProvider>,
    );
}

describe('SearchSingleSelectionPicker', () => {
    beforeEach(() => {
        (NativeNavigation.useIsFocused as jest.Mock).mockReturnValue(true);
    });

    it('renders all items', () => {
        renderPicker();

        expect(screen.getByText('Food')).toBeTruthy();
        expect(screen.getByText('Travel')).toBeTruthy();
        expect(screen.getByText('Office')).toBeTruthy();
    });

    it('does not show None option when allowNoneOption is false', () => {
        renderPicker({allowNoneOption: false});

        expect(screen.queryByText('None')).toBeNull();
    });

    it('shows None option when allowNoneOption is true', () => {
        renderPicker({allowNoneOption: true});

        expect(screen.getByText('None')).toBeTruthy();
    });

    it('shows None option after the selected item', () => {
        renderPicker({
            allowNoneOption: true,
            initiallySelectedItem: mockItems.at(0),
        });

        expect(screen.getByText('Food')).toBeTruthy();
        expect(screen.getByText('None')).toBeTruthy();
    });

    it('calls onSaveSelection with empty string when None is tapped', () => {
        const onSaveSelection = jest.fn();
        renderPicker({
            allowNoneOption: true,
            initiallySelectedItem: mockItems.at(0),
            onSaveSelection,
            shouldAutoSave: true,
        });

        const noneOption = screen.getByText('None');
        fireEvent.press(noneOption);

        expect(onSaveSelection).toHaveBeenCalledWith('');
    });

    it('calls onSaveSelection with item value when a regular item is tapped', () => {
        const onSaveSelection = jest.fn();
        renderPicker({
            allowNoneOption: true,
            onSaveSelection,
            shouldAutoSave: true,
        });

        fireEvent.press(screen.getByText('Travel'));

        expect(onSaveSelection).toHaveBeenCalledWith('travel');
    });

    it('marks the initially selected item as selected', () => {
        renderPicker({
            initiallySelectedItem: mockItems.at(1),
        });

        const selectedItem = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}travel`);
        expect(selectedItem).toBeSelected();
    });

    it('marks None as selected when no item is initially selected', () => {
        renderPicker({
            allowNoneOption: true,
            initiallySelectedItem: undefined,
        });

        const noneItem = screen.getByTestId(`${CONST.BASE_LIST_ITEM_TEST_ID}${CONST.SEARCH.NONE_OPTION_KEY}`);
        expect(noneItem).toBeSelected();
    });
});
