import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';

import DynamicStateSelectionPage from '@pages/settings/Profile/PersonalDetails/DynamicStateSelectionPage';

import type * as ReactNavigation from '@react-navigation/native';
import type {ComponentProps} from 'react';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';

import createMock from '../utils/createMock';

type DynamicStateSelectionPageProps = ComponentProps<typeof DynamicStateSelectionPage>;

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
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/profile/address'));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => {
            if (!key.startsWith('allStates.')) {
                return key;
            }

            const [, stateKey, property] = key.split('.');
            const stateEntry = Object.entries(mockStates).find(([keyName]) => keyName === stateKey);
            if (!stateEntry) {
                throw new Error(`Unknown state key: ${stateKey}`);
            }
            const state = stateEntry[1];

            if (property === 'stateName') {
                return state.stateName;
            }

            return state.stateISO;
        },
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

describe('DynamicStateSelectionPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the saved state to the top on reopen and wires debounced focus sync', () => {
        render(
            <DynamicStateSelectionPage
                route={createMock<DynamicStateSelectionPageProps['route']>({params: {state: 'NY'}})}
                navigation={createMock<DynamicStateSelectionPageProps['navigation']>({})}
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
        expect(selectionListProps?.searchValueForFocusSync).toBe('');
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <DynamicStateSelectionPage
                route={createMock<DynamicStateSelectionPageProps['route']>({params: {state: 'NY'}})}
                navigation={createMock<DynamicStateSelectionPageProps['navigation']>({})}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('New');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        const expectedSearchResults = searchOptions(
            'New',
            Object.values(mockStates).map((state) => ({
                value: state.stateISO,
                keyForList: state.stateISO,
                text: state.stateName,
                isSelected: state.stateISO === 'NY',
                searchValue: StringUtils.sanitizeString(`${state.stateISO}${state.stateName}`),
            })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
        expect(searchedProps?.searchValueForFocusSync).toBe('New');
    });

    it('renders without crashing when the route has no params', () => {
        render(
            <DynamicStateSelectionPage
                route={createMock<DynamicStateSelectionPageProps['route']>({})}
                navigation={createMock<DynamicStateSelectionPageProps['navigation']>({})}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.initiallyFocusedItemKey).toBeUndefined();
        expect(selectionListProps?.data.every((item) => !item.isSelected)).toBe(true);
    });
});
