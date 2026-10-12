import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import BaseSelectionList from '@components/SelectionList/BaseSelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import BaseSelectionListWithSections from '@components/SelectionList/SelectionListWithSections/BaseSelectionListWithSections';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';

import type Navigation from '@libs/Navigation/Navigation';

import type ReactNative from 'react-native';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

// Records what BaseSelectionList / BaseSelectionListWithSections hand to the shortcuts hook, so the tests can assert
// on the gated `focusedIndex` (-1 disables the list's plain-Enter shortcut and lets the keypress reach the confirm button).
const mockUseSelectionListShortcuts = jest.fn<void, [{focusedIndex: number}]>();
jest.mock('@components/SelectionList/hooks/useSelectionListShortcuts', () => ({
    __esModule: true,
    default: (params: {focusedIndex: number}) => {
        mockUseSelectionListShortcuts(params);
    },
}));

// Mock FlashList so every row renders synchronously
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
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
        useNavigation: jest.fn(() => ({
            isFocused: jest.fn(() => true),
        })),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn((num: number) => num.toString()),
    })),
);

jest.mock('@hooks/useKeyboardShortcut', () => jest.fn());

/** Mirrors the Workspace Members invite list: one member picked with the mouse, nothing typed in the search field. */
const mouseSelectedItems: ListItem[] = [
    {text: 'Item 0', keyForList: '0', isSelected: true},
    {text: 'Item 1', keyForList: '1'},
    {text: 'Item 2', keyForList: '2'},
];

const noSelectionItems: ListItem[] = mouseSelectedItems.map((item) => ({...item, isSelected: false}));

/** A custom footer (like the invite pages' "Next" button) that owns Enter when it is enabled. */
const footerContent = <View testID="custom-footer" />;

/** The `focusedIndex` the list handed to `useSelectionListShortcuts` on its latest render. */
function getGatedFocusedIndex(): number {
    return mockUseSelectionListShortcuts.mock.calls.at(-1)?.[0].focusedIndex ?? Number.NaN;
}

type ListProps = {
    data?: ListItem[];
    confirmButtonOptions?: ConfirmButtonOptions<ListItem>;
    footerContent?: React.ReactNode;
    searchText?: string;
    shouldStopPropagation?: boolean;
};

function renderFlatList({data = mouseSelectedItems, confirmButtonOptions, footerContent: footer, searchText = '', shouldStopPropagation = false}: ListProps = {}) {
    return render(
        <OnyxListItemProvider>
            <BaseSelectionList
                data={data}
                ListItem={MultiSelectListItem}
                onSelectRow={jest.fn()}
                canSelectMultiple
                initiallyFocusedItemKey="0"
                shouldShowTextInput
                textInputOptions={{label: 'common.search', value: searchText, onChangeText: jest.fn()}}
                confirmButtonOptions={confirmButtonOptions}
                footerContent={footer}
                shouldStopPropagation={shouldStopPropagation}
            />
        </OnyxListItemProvider>,
    );
}

function renderSectionedList({data = mouseSelectedItems, confirmButtonOptions, footerContent: footer, searchText = '', shouldStopPropagation = false}: ListProps = {}) {
    return render(
        <OnyxListItemProvider>
            <BaseSelectionListWithSections
                sections={[{data, sectionIndex: 0}]}
                ListItem={MultiSelectListItem}
                onSelectRow={jest.fn()}
                canSelectMultiple
                initiallyFocusedItemKey="0"
                shouldShowTextInput
                textInputOptions={{label: 'common.search', value: searchText, onChangeText: jest.fn()}}
                confirmButtonOptions={confirmButtonOptions}
                footerContent={footer}
                shouldStopPropagation={shouldStopPropagation}
            />
        </OnyxListItemProvider>,
    );
}

describe.each([
    ['BaseSelectionList', renderFlatList],
    ['BaseSelectionListWithSections', renderSectionedList],
])('%s Enter/confirm-button gate', (_name, renderList) => {
    beforeEach(() => {
        mockUseSelectionListShortcuts.mockClear();
        jest.mocked(NativeNavigation.useIsFocused).mockReturnValue(true);
    });

    it('yields plain Enter to an enabled custom footer confirm when rows were selected with the mouse and the search field is empty', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn()}});

        expect(getGatedFocusedIndex()).toBe(-1);
    });

    it('yields plain Enter to an enabled built-in confirm button', () => {
        renderList({confirmButtonOptions: {showButton: true, onConfirm: jest.fn(), text: 'Next'}});

        expect(getGatedFocusedIndex()).toBe(-1);
    });

    it('keeps plain Enter on the focused row when a custom footer hides the built-in confirm button and the footer cannot handle Enter', () => {
        // Footer renders footerContent instead of the built-in button, so the built-in button's Enter
        // listener never mounts. The footer path must govern, otherwise Enter reaches nothing at all.
        renderList({footerContent, confirmButtonOptions: {showButton: true, onConfirm: jest.fn(), text: 'Next', isFooterConfirmEnterKeyEnabled: false}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row while a search query is typed', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn()}, searchText: 'Item 1'});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('treats a whitespace-only search query as empty and still yields plain Enter to the confirm', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn()}, searchText: '   '});

        expect(getGatedFocusedIndex()).toBe(-1);
    });

    it('keeps plain Enter on the focused row once the user navigates with the keyboard', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn()}});
        expect(getGatedFocusedIndex()).toBe(-1);

        fireEvent(screen.getByTestId('selection-list-text-input'), 'keyPress', {nativeEvent: {key: 'Tab'}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row when the built-in confirm button is disabled', () => {
        renderList({confirmButtonOptions: {showButton: true, onConfirm: jest.fn(), text: 'Next', isDisabled: true}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row when the footer confirm cannot handle Enter on this platform', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn(), isFooterConfirmEnterKeyEnabled: false}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row when the owner reports the footer confirm as disabled', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn(), isFooterConfirmEnabled: false}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('yields plain Enter when the owner reports the footer confirm as enabled even though no rendered row is selected', () => {
        renderList({data: noSelectionItems, footerContent, confirmButtonOptions: {onConfirm: jest.fn(), isFooterConfirmEnabled: true}});

        expect(getGatedFocusedIndex()).toBe(-1);
    });

    it('keeps plain Enter on the focused row when nothing is selected, so the footer confirm is inferred to be disabled', () => {
        renderList({data: noSelectionItems, footerContent, confirmButtonOptions: {onConfirm: jest.fn()}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row for option-driven onConfirm lists that render no confirm control', () => {
        renderList({confirmButtonOptions: {onConfirm: jest.fn()}});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row when the list is configured to stop propagation', () => {
        renderList({footerContent, confirmButtonOptions: {onConfirm: jest.fn()}, shouldStopPropagation: true});

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });

    it('keeps plain Enter on the focused row when there is no confirm button at all', () => {
        renderList();

        expect(getGatedFocusedIndex()).toBeGreaterThanOrEqual(0);
    });
});
