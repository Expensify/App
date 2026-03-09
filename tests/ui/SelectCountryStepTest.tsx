import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import useOnyx from '@hooks/useOnyx';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import SelectCountryStep from '@pages/workspace/companyCards/addNew/SelectCountryStep';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const mockUseState = React.useState;
const mockAllCountries = CONST.ALL_COUNTRIES;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
        useRoute: jest.fn(() => ({params: {backTo: ''}})),
    };
});

jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/RadioListItem', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListState: jest.fn(() => ({
        currencyList: {},
    })),
}));
jest.mock('@hooks/useDebouncedState', () => {
    return jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    });
});
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
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({outputCurrency: 'USD'})));
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
    const mockedUseOnyx = jest.mocked(useOnyx);

    let addNewCardCountry: string | undefined;

    beforeEach(() => {
        addNewCardCountry = undefined;
        mockedSelectionList.mockClear();
        mockedUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COUNTRY) {
                return ['US', jest.fn()] as never;
            }

            if (key === ONYXKEYS.ADD_NEW_COMPANY_CARD) {
                return [{data: {selectedCountry: addNewCardCountry}}, jest.fn()] as never;
            }

            return [undefined, jest.fn()] as never;
        });
    });

    it('pins the saved country to the top on reopen and disables focus-driven scroll', () => {
        addNewCardCountry = 'US';

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
        expect(selectionListProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBeUndefined();
    });

    it('keeps the initially pinned country at the top while the live selection changes during the same mount', () => {
        addNewCardCountry = 'US';

        render(<SelectCountryStep policyID="policyID" />);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.onSelectRow?.({keyForList: 'GB'});
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

    it('refreshes the pinned country when the page is reopened with a different saved country', () => {
        addNewCardCountry = 'US';

        const {unmount} = render(<SelectCountryStep policyID="policyID" />);
        unmount();
        mockedSelectionList.mockClear();

        addNewCardCountry = 'GB';

        render(<SelectCountryStep policyID="policyID" />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'GB',
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe('GB');
    });

    it('keeps natural filtered ordering while search is active', () => {
        addNewCardCountry = 'US';

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
                    text: CONST.ALL_COUNTRIES[countryISO as keyof typeof CONST.ALL_COUNTRIES],
                    isSelected: countryISO === 'US',
                    searchValue: StringUtils.sanitizeString(`${countryISO}${CONST.ALL_COUNTRIES[countryISO as keyof typeof CONST.ALL_COUNTRIES]}`),
                })),
        );

        expect(searchedProps?.data.map((item) => item.keyForList)).toEqual(expectedSearchResults.map((item) => item.keyForList));
    });
});
