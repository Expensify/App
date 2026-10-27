import {act, render} from '@testing-library/react-native';

import CurrencySelectionList from '@components/CurrencySelectionList';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

// Codes chosen so several contain "U" (case-insensitive) — this lets the search test match more than the pinned row.
const mockCurrencyList = {
    AUD: {name: 'Australian Dollar'},
    EUR: {name: 'Euro'},
    GBP: {name: 'British Pound'},
    HUF: {name: 'Hungarian Forint'},
    JPY: {name: 'Japanese Yen'},
    UAH: {name: 'Ukrainian Hryvnia'},
    USD: {name: 'United States Dollar'},
    UYU: {name: 'Uruguayan Peso'},
};

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListState: jest.fn(() => ({currencyList: mockCurrencyList})),
    useCurrencyListActions: jest.fn(() => ({getCurrencySymbol: jest.fn(() => '$')})),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);

type MockSection = {sectionIndex: number; title?: string; data: Array<{currencyCode: string; isSelected?: boolean}>};

type MockSelectionListProps = {
    sections: MockSection[];
    initiallyFocusedItemKey?: string;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void; headerMessage?: string};
};

function renderCurrencyList(props: Partial<React.ComponentProps<typeof CurrencySelectionList>> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only props stub; the component only needs onSelect + the currency inputs
    const merged = {onSelect: jest.fn(), ...props} as React.ComponentProps<typeof CurrencySelectionList>;
    return render(<CurrencySelectionList {...merged} />);
}

describe('CurrencySelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: narrow the props captured from the mocked SelectionListWithSections
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;
    const pinnedCurrencyCodes = () =>
        getSelectionListProps()
            ?.sections.at(0)
            ?.data.map((option) => option.currencyCode);
    const totalRows = () => getSelectionListProps()?.sections.reduce((count, section) => count + section.data.length, 0) ?? 0;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it.each([
        {initiallySelectedCurrencyCode: 'USD', recentlyUsedCurrencies: ['EUR']},
        {initiallySelectedCurrencyCode: 'USD', recentlyUsedCurrencies: []},
        {initiallySelectedCurrencyCode: '', recentlyUsedCurrencies: ['EUR']},
        {initiallySelectedCurrencyCode: '', recentlyUsedCurrencies: []},
    ])('puts Any currency first under All with selection "$initiallySelectedCurrencyCode" and recents $recentlyUsedCurrencies', (props) => {
        // Given an optional currency picker with a saved selection and optional recent currencies.
        renderCurrencyList({...props, shouldAllowEmptySelection: true});

        // When the picker builds its selected, recent, and All sections.
        const sections = getSelectionListProps()?.sections;
        const allSection = sections?.at(-1);

        // Then Any currency leads All, stays out of earlier sections, and reflects the empty selection.
        expect(allSection?.title).toBe('common.all');
        expect(allSection?.data.at(0)).toMatchObject({currencyCode: '', text: 'common.anyCurrency', isSelected: props.initiallySelectedCurrencyCode === ''});
        expect(getSelectionListProps()?.initiallyFocusedItemKey).toBe(props.initiallySelectedCurrencyCode || 'any-currency');
        expect(sections?.slice(0, -1).flatMap((section) => section.data.map((item) => item.currencyCode))).not.toContain('');
        if (props.initiallySelectedCurrencyCode) {
            expect(pinnedCurrencyCodes()).toEqual(['USD']);
        }
    });

    it('searches Any currency as a list option', () => {
        // Given a picker that permits comparisons without a currency.
        renderCurrencyList({shouldAllowEmptySelection: true});

        // When the search matches the Any currency label rather than a currency code.
        act(() => getSelectionListProps()?.textInputOptions?.onChangeText?.('any'));

        // Then the option remains under All and does not show a no-results message.
        expect(getSelectionListProps()?.sections.at(0)?.title).toBe('common.all');
        expect(getSelectionListProps()?.sections.at(0)?.data).toMatchObject([{currencyCode: ''}]);
        expect(getSelectionListProps()?.textInputOptions?.headerMessage).toBeUndefined();

        // When the search only matches USD, then Any currency is filtered out like other options.
        act(() => getSelectionListProps()?.textInputOptions?.onChangeText?.('USD'));
        expect(getSelectionListProps()?.sections.at(0)?.data).toMatchObject([{currencyCode: 'USD'}]);
    });

    it('omits Any currency when a currency is required', () => {
        // Given a picker that requires an actual currency code.
        // When the default list is built without enabling empty selections.
        renderCurrencyList();

        // Then no empty currency option or optional All header is offered.
        expect(getSelectionListProps()?.sections.flatMap((section) => section.data.map((item) => item.currencyCode))).not.toContain('');
        expect(getSelectionListProps()?.sections.at(0)?.title).toBeUndefined();
    });

    it('pins the initially selected currency to its own top section on open', () => {
        renderCurrencyList({initiallySelectedCurrencyCode: 'USD'});

        const props = getSelectionListProps();

        expect(pinnedCurrencyCodes()).toEqual(['USD']);
        expect(props?.sections.at(0)?.data.at(0)?.isSelected).toBe(true);
        // shouldUpdateFocusedIndex keeps focusedIndex on the pressed row so the selected-item focus sync does not scroll the list on select.
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the original currency pinned when the selected currency changes', () => {
        const {rerender} = renderCurrencyList({initiallySelectedCurrencyCode: 'USD'});

        // The selection moves to EUR, but the pinned row stays frozen to the currency that was selected on open.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only props stub
        const nextProps = {onSelect: jest.fn(), initiallySelectedCurrencyCode: 'EUR'} as unknown as React.ComponentProps<typeof CurrencySelectionList>;
        rerender(<CurrencySelectionList {...nextProps} />);

        expect(pinnedCurrencyCodes()).toEqual(['USD']);
    });

    it('keeps the pinned currency at the top while searching', () => {
        renderCurrencyList({initiallySelectedCurrencyCode: 'USD'});

        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('U');
        });

        expect(pinnedCurrencyCodes()).toEqual(['USD']);
        // More than just the pinned row matched "U", so its top position is meaningful.
        expect(totalRows()).toBeGreaterThan(1);
    });
});
