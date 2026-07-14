import {act, render} from '@testing-library/react-native';

import MultiSelect from '@components/Search/FilterComponents/MultiSelect';
import type {MultiSelectItem} from '@components/Search/FilterComponents/MultiSelect';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

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
    const buildItems = (count: number): Array<MultiSelectItem<string>> =>
        Array.from({length: count}, (_, index) => ({
            text: `Item ${index}`,
            value: `item-${index}`,
        }));
    const items = buildItems(OPTION_COUNT);
    const keysOf = (data: ListItem[]) => data.map((item) => item.keyForList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('floats pre-selected items to the top on first render', () => {
        const preselected = items[10];

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
        const preselected = items[10];
        const toggled = items[3];

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
                value={[shortItems[5]]}
                items={shortItems}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(keysOf(props?.data ?? [])).toEqual(shortItems.map((item) => item.value));
    });
});
