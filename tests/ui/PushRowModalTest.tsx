import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import PushRowModal from '@src/components/PushRowWithModal/PushRowModal';

const mockUseState = React.useState;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Modal', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/RadioListItem', () => jest.fn(() => null));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('PushRowModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const optionsList = {
        one: 'Option 1',
        two: 'Option 2',
        three: 'Option 3',
        four: 'Option 4',
        five: 'Option 5',
        six: 'Option 6',
        seven: 'Option 7',
        eight: 'Option 8',
        nine: 'Option 9',
        ten: 'Option 10',
    };

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the saved option to the top on reopen', () => {
        render(
            <PushRowModal
                isVisible
                selectedOption="ten"
                onOptionChange={jest.fn()}
                onClose={jest.fn()}
                optionsList={optionsList}
                headerTitle="Options"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'ten',
                value: 'ten',
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('ten');
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <PushRowModal
                isVisible
                selectedOption="ten"
                onOptionChange={jest.fn()}
                onClose={jest.fn()}
                optionsList={optionsList}
                headerTitle="Options"
                searchInputTitle="Search"
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('Option 1');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        const expectedSearchResults = searchOptions(
            'Option 1',
            Object.entries(optionsList).map(([key, value]) => ({
                value: key,
                keyForList: key,
                text: value,
                isSelected: key === 'ten',
                searchValue: StringUtils.sanitizeString(value),
            })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
    });
});
