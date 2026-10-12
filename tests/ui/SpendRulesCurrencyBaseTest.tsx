import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import SpendRulesCurrencyBase from '@components/SpendRules/configuration/SpendRulesCurrencyBase';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;
const SETTLEMENT_CURRENCY = 'USD';

let mockCurrencyOptions: Array<{value: string; text: string; searchableText: string}>;

/** Build the settlement currency plus `count` others (C01…), so the component lists `count` selectable currencies. */
function buildCurrencyOptions(count: number) {
    const options = [{value: SETTLEMENT_CURRENCY, text: 'US Dollar', searchableText: SETTLEMENT_CURRENCY}];
    for (let index = 1; index <= count; index++) {
        const code = `C${String(index).padStart(2, '0')}`;
        options.push({value: code, text: `Currency ${String(index).padStart(2, '0')}`, searchableText: code});
    }
    return options;
}

// Capture the latest focus-effect callback so a test can simulate the page regaining focus (e.g. returning to the browser).
const mockFocus: {callback?: () => void} = {};
jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn((callback: () => void) => {
            mockFocus.callback = callback;
        }),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/FormAlertWithSubmitButton', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useTheme', () => jest.fn(() => new Proxy({}, {get: () => ''})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({Lock: 'lock'}))}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListState: jest.fn(() => ({currencyList: {}})),
    useCurrencyListActions: jest.fn(() => ({getCurrencySymbol: () => '$'})),
}));
// useSearchResults returns [inputValue, setInputValue, filteredData]. Filter the pre-pinned list by value
// substring, preserving order so the test can exercise the search path.
jest.mock('@hooks/useSearchResults', () =>
    jest.fn((data: Array<{value?: string}>) => {
        const [input, setInput] = mockUseState('');
        const filtered = input ? data.filter((item) => item.value?.includes(input)) : data;
        return [input, setInput, filtered];
    }),
);

jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn(() => false)}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/SearchUIUtils', () => ({getCurrencyOptions: () => mockCurrencyOptions}));

type MockCurrencyItem = {value?: string; keyForList?: string; isSelected?: boolean};

type MockSelectionListProps = {
    data: MockCurrencyItem[];
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    disableMaintainingScrollPosition?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
    onSelectRow?: (item: MockCurrencyItem) => void;
};

function renderPage(currencies: string[]) {
    return render(
        <SpendRulesCurrencyBase
            currencies={currencies}
            settlementCurrency={SETTLEMENT_CURRENCY}
            onCurrenciesChange={jest.fn()}
        />,
    );
}

describe('SpendRulesCurrencyBase', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockCurrencyOptions = buildCurrencyOptions(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
    });

    it('pins the pre-selected currency to the top on open', () => {
        // "C07" sorts to the middle, so seeing it first proves pinning (not the sort) put it there.
        renderPage(['C07']);

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('C07');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // "C01" sorts first, so it would lead if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('C01');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
        // Prevents the list from scrolling the pinned rows below the fold when a search is cleared.
        expect(props?.disableMaintainingScrollPosition).toBe(true);
    });

    it('keeps a pinned currency at the top of the search results', () => {
        renderPage(['C12']);

        // "1" matches C01 and C10-C14. C01 sorts first, so C12 leading proves the pin held.
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('1');
        });

        expect(getSelectionListProps()?.data.at(0)?.value).toBe('C12');
    });

    it('does not pin unsaved currencies to the top when the page regains focus', () => {
        // Given a rule saved with only C07 selected
        renderPage(['C07']);

        // When the user selects another currency without saving...
        act(() => {
            getSelectionListProps()?.onSelectRow?.({value: 'C03'});
        });

        // ...and then leaves and returns to the browser (the focus effect fires)
        act(() => {
            mockFocus.callback?.();
        });

        const props = getSelectionListProps();
        // Then only the saved currency stays pinned. The unsaved pick keeps its sorted position
        expect(props?.data.at(0)?.value).toBe('C07');
        expect(props?.data.at(0)?.value).not.toBe('C03');
        // The unsaved currency is still checked (live selection), just not pinned to the top
        expect(props?.data.find((item) => item.value === 'C03')?.isSelected).toBe(true);
    });

    it('does not reorder when the currency list is under the item-limit threshold', () => {
        mockCurrencyOptions = buildCurrencyOptions(CONST.STANDARD_LIST_ITEM_LIMIT - 2);

        renderPage(['C05']);

        const props = getSelectionListProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural sorted order is preserved.
        expect(props?.data.at(0)?.value).toBe('C01');
    });
});
