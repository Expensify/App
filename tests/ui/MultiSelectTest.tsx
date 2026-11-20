import {act, render} from '@testing-library/react-native';

import MultiSelect from '@components/Search/FilterComponents/MultiSelect';
import type {MultiSelectItem} from '@components/Search/FilterComponents/MultiSelect';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock(
    '@components/Search/FilterComponents/ListFilterViewWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({pb0: {}})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('MultiSelect', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    // Pre-selected rows are only floated to the top once the list reaches STANDARD_LIST_ITEM_LIMIT, so build
    // enough options to exceed that threshold (see moveInitialSelectionToTop in SelectionListOrderUtils).
    const OPTION_COUNT = CONST.STANDARD_LIST_ITEM_LIMIT + 2;
    const buildItem = (index: number): MultiSelectItem<string> => ({
        text: `Item ${index}`,
        value: `item-${index}`,
    });
    const buildItems = (count: number): Array<MultiSelectItem<string>> => Array.from({length: count}, (_, index) => buildItem(index));
    const items = buildItems(OPTION_COUNT);
    const keysOf = (data: ListItem[]) => data.map((item) => item.keyForList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('uses the latest item metadata for disabling and tooltips without changing the row renderer', () => {
        // Given a selected item whose parent marks it required
        const item: MultiSelectItem<string> = {text: 'Required item', value: 'required', isDisabled: true, tooltipText: 'Required'};
        const onChange = jest.fn();
        const {rerender} = render(
            <MultiSelect
                value={[item]}
                items={[item]}
                onChange={onChange}
            />,
        );
        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        const row = initialProps?.data.at(0);
        if (!row) {
            throw new Error('Missing selected row');
        }

        // When the disabled row is selected, then its metadata blocks the change
        expect(row).toEqual(expect.objectContaining({isDisabled: true, tooltipText: 'Required'}));
        act(() => initialProps?.onSelectRow?.(row));
        expect(onChange).not.toHaveBeenCalled();

        // When the parent removes the restriction, even though the selected item still holds the old metadata
        rerender(
            <MultiSelect
                value={[item]}
                items={[{...item, isDisabled: false, tooltipText: undefined}]}
                onChange={onChange}
            />,
        );
        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        const updatedRow = updatedProps?.data.at(0);
        if (!updatedRow) {
            throw new Error('Missing updated row');
        }

        // Then the latest items control availability and the stable renderer can remove the row normally
        expect(updatedProps?.ListItem).toBe(initialProps?.ListItem);
        expect(updatedRow).toEqual(expect.objectContaining({isDisabled: false, tooltipText: undefined}));
        act(() => updatedProps?.onSelectRow?.(updatedRow));
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('floats pre-selected items to the top on first render', () => {
        const preselected = buildItem(10);

        render(
            <MultiSelect
                value={[preselected]}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.data.at(0)).toEqual(expect.objectContaining({keyForList: preselected.value, isSelected: true}));
        const expectedOrder = [preselected.value, ...items.map((item) => item.value).filter((value) => value !== preselected.value)];
        expect(keysOf(props?.data ?? [])).toEqual(expectedOrder);
    });

    it('does not reorder the list when a row is toggled after first render (no jump to the top)', () => {
        const preselected = buildItem(10);
        const toggled = buildItem(3);

        render(
            <MultiSelect
                value={[preselected]}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const expectedOrder = [preselected.value, ...items.map((item) => item.value).filter((value) => value !== preselected.value)];

        // Simulate the user toggling another row on. The ordering keys off the snapshot of the selection taken on
        // first render (useInitialValue), so the newly selected row must stay in its natural position.
        const onSelectRow = mockedSelectionList.mock.lastCall?.[0].onSelectRow;
        act(() => {
            onSelectRow?.({text: toggled.text, keyForList: toggled.value, isSelected: false});
        });

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.data.at(0)?.keyForList).toBe(preselected.value);
        expect(keysOf(props?.data ?? [])).toEqual(expectedOrder);
        expect(props?.data.find((item) => item.keyForList === toggled.value)).toEqual(expect.objectContaining({isSelected: true}));
    });

    it('leaves a short list in its natural order even with a selection', () => {
        const shortItems = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT - 1);

        render(
            <MultiSelect
                value={[buildItem(5)]}
                items={shortItems}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(keysOf(props?.data ?? [])).toEqual(shortItems.map((item) => item.value));
    });

    it('passes shouldUpdateFocusedIndex so the focused index follows a row that reorders on selection', () => {
        render(
            <MultiSelect
                value={[buildItem(10)]}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('passes undefined footerContent when neither isLoadingMore nor footer is provided', () => {
        render(
            <MultiSelect
                value={[]}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.footerContent).toBeUndefined();
    });

    it('passes footerContent when footer is provided', () => {
        render(
            <MultiSelect
                value={[]}
                items={items}
                onChange={jest.fn()}
                footer={<View />}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.footerContent).toBeDefined();
    });

    it('passes footerContent when isLoadingMore is true', () => {
        render(
            <MultiSelect
                value={[]}
                items={items}
                onChange={jest.fn()}
                isLoadingMore
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.footerContent).toBeDefined();
    });
});
