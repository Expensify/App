import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';
import SelectionList from '@components/SelectionList';
import StateSelectorModal from '@components/StatePicker/StateSelectorModal';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';

const mockUseState = React.useState;
const mockStates = COMMON_CONST.STATES;

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
        translate: (key: string) => {
            if (!key.startsWith('allStates.')) {
                return key;
            }

            const [, stateKey, property] = key.split('.');
            const state = mockStates[stateKey as keyof typeof mockStates];

            if (property === 'stateName') {
                return state.stateName;
            }

            return state.stateISO;
        },
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        pb0: {},
    })),
);

describe('StateSelectorModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the saved state to the top on reopen', () => {
        render(
            <StateSelectorModal
                isVisible
                currentState="NY"
                onStateSelected={jest.fn()}
                onClose={jest.fn()}
                label="State"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'NY',
                value: 'NY',
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('NY');
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <StateSelectorModal
                isVisible
                currentState="NY"
                onStateSelected={jest.fn()}
                onClose={jest.fn()}
                label="State"
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('New');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        const expectedSearchResults = searchOptions(
            'New',
            Object.keys(mockStates).map((state) => ({
                value: mockStates[state as keyof typeof mockStates].stateISO,
                keyForList: mockStates[state as keyof typeof mockStates].stateISO,
                text: mockStates[state as keyof typeof mockStates].stateName,
                isSelected: mockStates[state as keyof typeof mockStates].stateISO === 'NY',
                searchValue: StringUtils.sanitizeString(`${mockStates[state as keyof typeof mockStates].stateISO}${mockStates[state as keyof typeof mockStates].stateName}`),
            })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
    });
});
