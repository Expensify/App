import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';

import PushRowModal from '@src/components/PushRowWithModal/PushRowModal';
import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

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
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
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
    // Pre-selected rows are only pinned to the top once the list reaches STANDARD_LIST_ITEM_LIMIT (when the
    // search input is shown), so build enough options to exceed that threshold (see moveInitialSelectionToTop).
    const optionsList = Object.fromEntries(Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT + 2}, (_, index) => [`option-${index + 1}`, `Option ${index + 1}`]));
    const selectedOptionKey = 'option-10';

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the saved option to the top on reopen', () => {
        render(
            <PushRowModal
                isVisible
                selectedOptions={[selectedOptionKey]}
                onOptionChange={jest.fn()}
                onClose={jest.fn()}
                optionsList={optionsList}
                headerTitle="Options"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: selectedOptionKey,
                value: selectedOptionKey,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(selectedOptionKey);
    });

    it('keeps the modal open while toggling rows and commits the selection from Save when canSelectMultiple', () => {
        const onOptionChange = jest.fn();
        const onConfirm = jest.fn();
        const onClose = jest.fn();
        render(
            <PushRowModal
                isVisible
                canSelectMultiple
                selectedOptions={['option-1']}
                onOptionChange={onOptionChange}
                onConfirm={onConfirm}
                onClose={onClose}
                optionsList={optionsList}
                headerTitle="Options"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        const secondRow = selectionListProps?.data.at(1);
        expect(selectionListProps?.canSelectMultiple).toBe(true);
        expect(secondRow).toBeDefined();
        if (!secondRow) {
            return;
        }
        act(() => selectionListProps?.onSelectRow(secondRow));

        expect(onOptionChange).toHaveBeenCalledWith(secondRow.value);
        expect(onClose).not.toHaveBeenCalled();

        act(() => selectionListProps?.confirmButtonOptions?.onConfirm?.());
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <PushRowModal
                isVisible
                selectedOptions={[selectedOptionKey]}
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
                isSelected: key === selectedOptionKey,
                searchValue: StringUtils.sanitizeString(value),
            })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
    });
});
