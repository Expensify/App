import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import CountrySelectorModal from '@components/CountryPicker/CountrySelectorModal';
import SelectionList from '@components/SelectionList';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
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
            if (key.startsWith('allCountries.')) {
                const countryISO = key.split('.').at(-1) ?? '';
                return mockAllCountries[countryISO as keyof typeof mockAllCountries] ?? key;
            }

            return key;
        },
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        pb0: {},
    })),
);

describe('CountrySelectorModal', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the saved country to the top on reopen', () => {
        render(
            <CountrySelectorModal
                isVisible
                currentCountry="US"
                onCountrySelected={jest.fn()}
                onClose={jest.fn()}
                label="Country"
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
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <CountrySelectorModal
                isVisible
                currentCountry="US"
                onCountrySelected={jest.fn()}
                onClose={jest.fn()}
                label="Country"
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
    });
});
