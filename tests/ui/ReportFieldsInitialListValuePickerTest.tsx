import {render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import ReportFieldsInitialListValuePicker from '@pages/workspace/reports/InitialListValueSelector/ReportFieldsInitialListValuePicker';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);

type MockListItem = {value: string; keyForList?: string; isSelected?: boolean; text?: string};

type MockSelectionListProps = {
    data: MockListItem[];
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
};

/** Build `count` list values "00".."{count-1}" (zero-padded so the alphabetical sort is numeric). */
function buildValues(count: number): string[] {
    return Array.from({length: count}, (_, index) => String(index).padStart(2, '0'));
}

const LONG_LIST = buildValues(CONST.STANDARD_LIST_ITEM_LIMIT + 2);

function pickerElement(value: string, listValues: string[]) {
    return (
        <ReportFieldsInitialListValuePicker
            listValues={listValues}
            disabledOptions={listValues.map(() => false)}
            value={value}
            onValueChange={jest.fn()}
        />
    );
}

describe('ReportFieldsInitialListValuePicker', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initially selected value to the top on open', () => {
        // "07" sorts to the middle, so seeing it first proves pinning (not the sort) put it there.
        render(pickerElement('07', LONG_LIST));

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('07');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // Alphabetically "00" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('00');
        expect(props?.initiallyFocusedItemKey).toBe('07');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the originally pinned value at the top while the live selection changes', () => {
        const {rerender} = render(pickerElement('07', LONG_LIST));

        // The parent re-passes a new selection; the frozen pin must not jump to it.
        rerender(pickerElement('03', LONG_LIST));

        const props = getSelectionListProps();
        const order = props?.data.map((item) => item.value) ?? [];
        expect(order.at(0)).toBe('07');
        expect(order.indexOf('07')).toBeLessThan(order.indexOf('03'));
        // The checkmark still follows the live value.
        expect(props?.data.find((item) => item.value === '03')?.isSelected).toBe(true);
        expect(props?.data.find((item) => item.value === '07')?.isSelected).toBe(false);
    });

    it('does not reorder when the list is under the item-limit threshold', () => {
        render(pickerElement('05', buildValues(CONST.STANDARD_LIST_ITEM_LIMIT - 2)));

        const props = getSelectionListProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so natural alphabetical order is kept.
        expect(props?.data.at(0)?.value).toBe('00');
    });
});
