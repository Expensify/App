import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import SelectionList from '@components/SelectionList';
import type {SelectionListHandle} from '@components/SelectionList/types';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import CountrySelectionList from '@pages/settings/Wallet/CountrySelectionList';
import CONST from '@src/CONST';

const mockUseState = React.useState;
const mockAllCountries = CONST.ALL_COUNTRIES;
const mockScrollToIndex = jest.fn();
let mockFocusEffectCallbacks: Array<() => void> = [];
const mockSelectionListHandle: SelectionListHandle<{keyForList: string}> = {
    scrollAndHighlightItem: jest.fn(),
    scrollToIndex: mockScrollToIndex,
    updateFocusedIndex: jest.fn(),
    scrollToFocusedInput: jest.fn(),
    focusTextInput: jest.fn(),
};

function attachSelectionListHandle(ref: React.Ref<SelectionListHandle<{keyForList: string}>> | undefined) {
    if (typeof ref === 'function') {
        ref(mockSelectionListHandle as never);
        return;
    }

    if (!ref) {
        return;
    }

    const refObject = ref;
    refObject.current = mockSelectionListHandle as never;
}

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn((callback: () => void) => {
            mockFocusEffectCallbacks.push(callback);
        }),
    };
});

jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
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
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        ph5: {},
        textHeadlineLineHeightXXL: {},
        mb6: {},
        mt5: {},
    })),
);
jest.mock('@src/components/Text', () => jest.fn(() => null));

describe('CountrySelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const countries = Object.keys(CONST.ALL_COUNTRIES).slice(0, CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2);
    const initialCountry = countries.at(-1) ?? '';
    const updatedCountry = countries.at(-2) ?? '';

    beforeEach(() => {
        mockFocusEffectCallbacks = [];
        mockedSelectionList.mockClear();
        mockScrollToIndex.mockClear();
        mockedSelectionList.mockImplementation(({ref}) => {
            attachSelectionListHandle(ref);

            return <View />;
        });
    });

    it('pins the saved country to the top on reopen and disables focus-driven scroll', () => {
        render(
            <CountrySelectionList
                selectedCountry={initialCountry}
                countries={countries}
                onCountrySelected={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: initialCountry,
                value: initialCountry,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(initialCountry);
        expect(selectionListProps?.searchValueForFocusSync).toBe('');
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(true);
        expect(selectionListProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('refreshes the pinned country and resets the viewport once when focus returns in the wallet flow', () => {
        const {rerender} = render(
            <CountrySelectionList
                selectedCountry={initialCountry}
                countries={countries}
                onCountrySelected={jest.fn()}
                onConfirm={jest.fn()}
                shouldResetViewportOnFocusReturn
            />,
        );

        expect(mockScrollToIndex).not.toHaveBeenCalled();

        act(() => {
            for (const callback of mockFocusEffectCallbacks.slice(-2)) {
                callback();
            }
        });

        rerender(
            <CountrySelectionList
                selectedCountry={updatedCountry}
                countries={countries}
                onCountrySelected={jest.fn()}
                onConfirm={jest.fn()}
                shouldResetViewportOnFocusReturn
            />,
        );

        act(() => {
            for (const callback of mockFocusEffectCallbacks.slice(-2)) {
                callback();
            }
        });

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: updatedCountry,
                value: updatedCountry,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(updatedCountry);
        expect(mockScrollToIndex).toHaveBeenCalledTimes(1);
        expect(mockScrollToIndex).toHaveBeenCalledWith(0);
    });

    it('keeps the initially pinned country at the top while the live selection changes during the same mount', () => {
        const {rerender} = render(
            <CountrySelectionList
                selectedCountry={initialCountry}
                countries={countries}
                onCountrySelected={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );

        rerender(
            <CountrySelectionList
                selectedCountry={updatedCountry}
                countries={countries}
                onCountrySelected={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: initialCountry,
                isSelected: false,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(initialCountry);
        expect(selectionListProps?.data.find((item) => item.keyForList === updatedCountry)).toEqual(
            expect.objectContaining({
                keyForList: updatedCountry,
                isSelected: true,
            }),
        );
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <CountrySelectionList
                selectedCountry={initialCountry}
                countries={countries}
                onCountrySelected={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('Uni');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        const expectedSearchResults = searchOptions(
            'Uni',
            countries.map((countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: CONST.ALL_COUNTRIES[countryISO as keyof typeof CONST.ALL_COUNTRIES],
                isSelected: countryISO === initialCountry,
                searchValue: StringUtils.sanitizeString(`${countryISO}${CONST.ALL_COUNTRIES[countryISO as keyof typeof CONST.ALL_COUNTRIES]}`),
            })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
        expect(searchedProps?.searchValueForFocusSync).toBe('Uni');
    });
});
