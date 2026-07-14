import {act, render} from '@testing-library/react-native';

import SingleSelect from '@components/Search/FilterComponents/SingleSelect';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock(
    '@components/Search/FilterComponents/ListFilterViewWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({pb0: {}})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('SingleSelect', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    // Pre-selected rows are only floated to the top once the list reaches STANDARD_LIST_ITEM_LIMIT, so build
    // enough options to exceed that threshold (see moveInitialSelectionToTop in SelectionListOrderUtils).
    const OPTION_COUNT = CONST.STANDARD_LIST_ITEM_LIMIT + 2;
    const buildItem = (index: number): SingleSelectItem<string> => ({
        text: `Item ${index}`,
        value: `item-${index}`,
    });
    const buildItems = (count: number): Array<SingleSelectItem<string>> => Array.from({length: count}, (_, index) => buildItem(index));
    const items = buildItems(OPTION_COUNT);
    const keysOf = (data: ListItem[]) => data.map((item) => item.keyForList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('floats the pre-selected item to the top on first render', () => {
        const preselected = buildItem(10);

        render(
            <SingleSelect
                value={preselected}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.data.at(0)).toEqual(expect.objectContaining({keyForList: preselected.value, isSelected: true}));
        const expectedOrder = [preselected.value, ...items.map((item) => item.value).filter((value) => value !== preselected.value)];
        expect(keysOf(props?.data ?? [])).toEqual(expectedOrder);
    });

    it('does not reorder the list when the selection changes after first render (no jump to the top)', () => {
        const preselected = buildItem(10);
        const reselected = buildItem(3);

        render(
            <SingleSelect
                value={preselected}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const expectedOrder = [preselected.value, ...items.map((item) => item.value).filter((value) => value !== preselected.value)];

        // Changing the selection after open must not re-pin: ordering keys off the snapshot taken on first render.
        const onSelectRow = mockedSelectionList.mock.lastCall?.[0].onSelectRow;
        act(() => {
            onSelectRow?.({text: reselected.text, keyForList: reselected.value, isSelected: false});
        });

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.data.at(0)?.keyForList).toBe(preselected.value);
        expect(keysOf(props?.data ?? [])).toEqual(expectedOrder);
        expect(props?.data.find((item) => item.keyForList === reselected.value)).toEqual(expect.objectContaining({isSelected: true}));
    });

    it('leaves a short list in its natural order even with a selection', () => {
        const shortItems = buildItems(CONST.STANDARD_LIST_ITEM_LIMIT - 1);

        render(
            <SingleSelect
                value={buildItem(5)}
                items={shortItems}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(keysOf(props?.data ?? [])).toEqual(shortItems.map((item) => item.value));
    });

    it('passes shouldUpdateFocusedIndex so the focused index follows a row that reorders on selection', () => {
        render(
            <SingleSelect
                value={buildItem(10)}
                items={items}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });
});
