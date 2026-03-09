import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList/ListItem/RadioListItem', () => jest.fn(() => null));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({
        getCurrencySymbol: (currencyCode: string) => {
            if (currencyCode === 'CAD') {
                return 'C$';
            }
            if (currencyCode === 'BRL') {
                return 'R$';
            }
            return '$';
        },
    })),
    useCurrencyListState: jest.fn(() => ({
        currencyList: {
            AUD: {name: 'Australian Dollar', retired: false},
            BRL: {name: 'Brazilian Real', retired: false},
            CAD: {name: 'Canadian Dollar', retired: false},
            USD: {name: 'US Dollar', retired: false},
        },
    })),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('CurrencySelectionList', () => {
    const mockedSelectionListWithSections = jest.mocked(SelectionListWithSections);

    beforeEach(() => {
        mockedSelectionListWithSections.mockClear();
    });

    it('survives search updates and parent rerenders when selectedCurrencies is omitted', () => {
        const onSelect = jest.fn();
        const {rerender} = render(
            <CurrencySelectionList
                searchInputLabel="common.search"
                initiallySelectedCurrencyCode="USD"
                onSelect={onSelect}
            />,
        );

        const initialProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(initialProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                currencyCode: 'USD',
                isSelected: true,
            }),
        );

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('cad');
        });

        const searchedProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(searchedProps?.sections).toHaveLength(1);
        expect(searchedProps?.sections.at(0)?.data).toEqual([
            expect.objectContaining({
                currencyCode: 'CAD',
                isSelected: false,
            }),
        ]);

        rerender(
            <CurrencySelectionList
                searchInputLabel="common.search"
                initiallySelectedCurrencyCode="USD"
                onSelect={onSelect}
            />,
        );

        const rerenderedProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(rerenderedProps?.textInputOptions?.value).toBe('cad');
        expect(rerenderedProps?.sections.at(0)?.data).toEqual([
            expect.objectContaining({
                currencyCode: 'CAD',
                isSelected: false,
            }),
        ]);
    });
});
