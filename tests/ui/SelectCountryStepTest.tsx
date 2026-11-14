import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import {getPlaidCountry} from '@libs/CardUtils';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';

import PersonalCardSelectCountryStep from '@pages/settings/Wallet/PersonalCards/steps/SelectCountryStep';
import SelectCountryStep from '@pages/workspace/companyCards/addNew/SelectCountryStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AddNewCompanyCardFeed} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseState = React.useState;
const mockAllCountries = CONST.ALL_COUNTRIES;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
        useIsFocused: jest.fn(() => true),
        useRoute: jest.fn(() => ({params: {backTo: ''}})),
    };
});

jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListState: jest.fn(() => ({
        currencyList: {},
    })),
}));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        translate: (key: string) => {
            if (key.startsWith('allCountries.')) {
                const countryISO = key.split('.').at(-1) ?? '';
                return Object.entries(mockAllCountries).find(([countryCode]) => countryCode === countryISO)?.[1] ?? key;
            }

            return key;
        },
    })),
);
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({outputCurrency: 'USD'})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({localCurrencyCode: 'EUR'})));
jest.mock('@userActions/PersonalCards', () => ({clearAddNewPersonalCardFlow: jest.fn(), setAddNewPersonalCardStepAndData: jest.fn()}));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        textHeadlineLineHeightXXL: {},
        ph5: {},
        mv3: {},
        ph3: {},
        mb3: {},
    })),
);
jest.mock('@libs/CardUtils', () => ({
    getPlaidCountry: jest.fn(() => 'US'),
    isPlaidSupportedCountry: jest.fn(() => true),
}));
jest.mock('@navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@userActions/CompanyCards', () => ({
    clearAddNewCardFlow: jest.fn(),
    setAddNewCompanyCardStepAndData: jest.fn(),
}));

describe('SelectCountryStep', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    const setAddNewCardCountry = async (country: string | undefined) => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, createMock<AddNewCompanyCardFeed>({data: {selectedCountry: country}}));
        });
        await waitForBatchedUpdatesWithAct();
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockedSelectionList.mockClear();
        await act(async () => {
            await Onyx.clear();
            await Onyx.merge(ONYXKEYS.COUNTRY, 'US');
        });
        await setAddNewCardCountry(undefined);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('pins the saved country to the top on reopen and disables focus-driven scroll', async () => {
        await setAddNewCardCountry('US');

        render(<SelectCountryStep policyID="policyID" />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'US',
                value: 'US',
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('US');
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the initially pinned country at the top while the live selection changes during the same mount', async () => {
        await setAddNewCardCountry('US');

        render(<SelectCountryStep policyID="policyID" />);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        const selectedCountry = initialProps?.data.find((item) => item.keyForList === 'GB');

        expect(selectedCountry).toBeDefined();

        act(() => {
            if (!selectedCountry) {
                return;
            }

            initialProps?.onSelectRow?.(selectedCountry);
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'US',
                isSelected: false,
            }),
        );
        expect(updatedProps?.initiallyFocusedItemKey).toBe('US');
        expect(updatedProps?.data.find((item) => item.keyForList === 'GB')).toEqual(
            expect.objectContaining({
                keyForList: 'GB',
                isSelected: true,
            }),
        );
    });

    it.each(['', 'IR'])('clears the personal-card error after selecting a valid country (initial: %s)', (initialCountry) => {
        // Given an invalid country has triggered the required-country error
        jest.mocked(getPlaidCountry).mockReturnValue(initialCountry);
        render(<PersonalCardSelectCountryStep />);
        act(() => mockedSelectionList.mock.lastCall?.[0].confirmButtonOptions?.onConfirm?.());
        expect(mockedSelectionList.mock.lastCall?.[0].children).toBeTruthy();
        // When a supported country is selected
        const country = mockedSelectionList.mock.lastCall?.[0].data.find((item) => item.keyForList === 'US');
        act(() => country && mockedSelectionList.mock.lastCall?.[0].onSelectRow?.(country));
        // Then the obsolete error is removed
        expect(mockedSelectionList.mock.lastCall?.[0].children).toBe(false);
    });

    it('keeps natural filtered ordering while search is active', async () => {
        await setAddNewCardCountry('US');

        render(<SelectCountryStep policyID="policyID" />);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('Uni');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        const expectedSearchResults = searchOptions(
            'Uni',
            Object.keys(CONST.ALL_COUNTRIES)
                .filter((countryISO) => !CONST.PLAID_EXCLUDED_COUNTRIES.includes(countryISO))
                .map((countryISO) => ({
                    value: countryISO,
                    keyForList: countryISO,
                    text: Object.entries(CONST.ALL_COUNTRIES).find(([countryCode]) => countryCode === countryISO)?.[1] ?? countryISO,
                    isSelected: false,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${Object.entries(CONST.ALL_COUNTRIES).find(([countryCode]) => countryCode === countryISO)?.[1] ?? countryISO}`),
                })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
    });
});
