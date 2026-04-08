import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import DynamicCountrySelectionPage from '@pages/settings/Profile/PersonalDetails/DynamicCountrySelectionPage';
import CONST from '@src/CONST';

const mockUseState = React.useState;
const mockAllCountries = CONST.ALL_COUNTRIES;

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
jest.mock('@components/SelectionList/ListItem/RadioListItem', () => jest.fn(() => null));
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
            if (key.startsWith('allCountries.')) {
                const countryISO = key.split('.').at(-1) ?? '';
                return mockAllCountries[countryISO as keyof typeof mockAllCountries] ?? key;
            }

            return key;
        },
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

describe('DynamicCountrySelectionPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the saved country to the top on reopen and wires debounced focus sync', () => {
        render(
            <DynamicCountrySelectionPage
                route={{params: {country: 'US'}} as never}
                navigation={jest.fn() as never}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'US',
                value: 'US',
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('US');
        expect(selectionListProps?.searchValueForFocusSync).toBe('');
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <DynamicCountrySelectionPage
                route={{params: {country: 'US'}} as never}
                navigation={jest.fn() as never}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('Uni');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        const expectedSearchResults = searchOptions(
            'Uni',
            Object.keys(CONST.ALL_COUNTRIES).map((countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: CONST.ALL_COUNTRIES[countryISO as keyof typeof CONST.ALL_COUNTRIES],
                isSelected: countryISO === 'US',
                searchValue: StringUtils.sanitizeString(`${countryISO}${CONST.ALL_COUNTRIES[countryISO as keyof typeof CONST.ALL_COUNTRIES]}`),
            })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
        expect(searchedProps?.searchValueForFocusSync).toBe('Uni');
    });
});
