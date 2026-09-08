import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import CustomCloseDateSelectionList from '@pages/workspace/companyCards/WorkspaceCompanyCardStatementCloseDateSelectionList/CustomCloseDateSelectionList';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

const mockUseState = React.useState;

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
jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);

type MockListItem = {value: number; keyForList?: string; isSelected?: boolean; text?: string};

type MockSelectionListProps = {
    data: MockListItem[];
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    onSelectRow?: (item: MockListItem) => void;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

function renderList(initiallySelectedDay: number) {
    return render(
        <CustomCloseDateSelectionList
            initiallySelectedDay={initiallySelectedDay}
            onConfirmSelectedDay={jest.fn()}
        />,
    );
}

describe('CustomCloseDateSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initially selected day to the top on open', () => {
        // Day 15 sorts to the middle of 1-28, so seeing it first proves pinning (not the natural order) put it there.
        renderList(15);

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe(15);
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // Day 1 would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe(1);
        expect(props?.initiallyFocusedItemKey).toBe('15');
        // Anti-jump props: don't scroll to the pinned row on mount, and keep the focused index in sync on select.
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the frozen day pinned while the live selection changes', () => {
        renderList(15);

        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: 20, keyForList: '20', text: '20'});
        });

        const props = getSelectionListProps();
        // The frozen day (15) stays pinned at the top even though the live selection moved to 20.
        expect(props?.data.at(0)?.value).toBe(15);
        expect(props?.data.at(0)?.isSelected).toBe(false);
        // The checkmark follows the live selection.
        expect(props?.data.find((day) => day.value === 20)?.isSelected).toBe(true);
    });

    it('keeps the pinned day at the top of the search results', () => {
        renderList(15);

        // "5" matches 5, 15 and 25; the pinned day must still lead.
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('5');
        });

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe(15);
        expect(props?.data.map((day) => day.value)).toEqual(expect.arrayContaining([5, 15, 25]));
    });
});
