import {render, screen} from '@testing-library/react-native';

import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import useFilterFeedValue from '@components/Search/hooks/useFilterFeedValue';
import useFilterTaxRateValue from '@components/Search/hooks/useFilterTaxRateValue';
import SearchFilterBar from '@components/Search/SearchPageHeader/SearchFilterBar';
import type {FilterItem} from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import Text from '@components/Text';

import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';

jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: () => false}}));

const FIRST_CARD: Card = {
    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD,
    cardID: 123,
    domainName: 'first-card.example',
    fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
    lastUpdated: '',
    nameValuePairs: createMock<NonNullable<Card['nameValuePairs']>>({cardTitle: 'First card'}),
    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
};
const SECOND_CARD: Card = {
    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD,
    cardID: 456,
    domainName: 'second-card.example',
    fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
    lastUpdated: '',
    nameValuePairs: createMock<NonNullable<Card['nameValuePairs']>>({cardTitle: 'Second card'}),
    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
};

const CARD_LIST: CardList = {
    [FIRST_CARD.cardID]: FIRST_CARD,
    [SECOND_CARD.cardID]: SECOND_CARD,
};

jest.mock('@components/Search/FilterDropdowns/DropdownButton', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@components/Search/hooks/useFilterFeedValue', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@components/Search/hooks/useFilterTaxRateValue', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

const mockDropdownButton = jest.mocked(DropdownButton);
const mockUseFilterFeedValue = jest.mocked(useFilterFeedValue);
const mockUseFilterTaxRateValue = jest.mocked(useFilterTaxRateValue);

const FIRST_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#first-domain`;
const SECOND_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#second-domain`;
const FIRST_TAX_RATE = 'id_TAX_RATE_1';
const SECOND_TAX_RATE = 'id_TAX_RATE_2';

function createCardFilter(value: string): SearchFilter & FilterItem {
    return {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
        label: 'Cards',
        value,
        PopoverComponent: () => null,
        sentryLabel: 'Search-Filter-cardID',
        onClosePress: jest.fn(),
    };
}

function createFeedFilter(value: string | string[]): SearchFilter & FilterItem {
    return {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED,
        label: 'Feeds',
        value,
        PopoverComponent: () => null,
        sentryLabel: 'Search-Filter-feed',
        onClosePress: jest.fn(),
    };
}

function createTaxRateFilter(value: string | string[]): SearchFilter & FilterItem {
    return {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
        label: 'Tax rates',
        value,
        PopoverComponent: () => null,
        sentryLabel: 'Search-Filter-taxRate',
        onClosePress: jest.fn(),
    };
}

describe('SearchFilterBar descriptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockDropdownButton.mockImplementation(({label, value}) => {
            const selectedItems = Array.isArray(value) ? value.join(', ') : value;
            return <Text>{selectedItems ? `${label}: ${selectedItems}` : label}</Text>;
        });

        await Onyx.clear();
        await Onyx.set(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, CARD_LIST);
    });

    it('renders the description for one scalar card ID', () => {
        render(<SearchFilterBar item={createCardFilter(FIRST_CARD.cardID.toString())} />);

        expect(screen.getByText('Cards: First card')).toBeOnTheScreen();
    });

    it('renders both descriptions for joined scalar card IDs in card-list order', () => {
        render(<SearchFilterBar item={createCardFilter(`${FIRST_CARD.cardID}, ${SECOND_CARD.cardID}`)} />);

        expect(screen.getByText('Cards: First card, Second card')).toBeOnTheScreen();
    });

    it('normalizes a scalar feed before rendering its display label', () => {
        mockUseFilterFeedValue.mockReturnValue('Chase');

        render(<SearchFilterBar item={createFeedFilter(FIRST_FEED)} />);

        expect(mockUseFilterFeedValue).toHaveBeenCalledWith([FIRST_FEED]);
        expect(mockDropdownButton.mock.calls.at(-1)?.[0].value).toBe('Chase');
    });

    it('preserves ordered feed identifiers before rendering their display labels', () => {
        mockUseFilterFeedValue.mockReturnValue('Chase, Visa');

        render(<SearchFilterBar item={createFeedFilter([FIRST_FEED, SECOND_FEED])} />);

        expect(mockUseFilterFeedValue).toHaveBeenCalledWith([FIRST_FEED, SECOND_FEED]);
        expect(mockDropdownButton.mock.calls.at(-1)?.[0].value).toBe('Chase, Visa');
    });

    it('normalizes a scalar tax rate before rendering its display label', () => {
        mockUseFilterTaxRateValue.mockReturnValue('5%');

        render(<SearchFilterBar item={createTaxRateFilter(FIRST_TAX_RATE)} />);

        expect(mockUseFilterTaxRateValue).toHaveBeenCalledWith([FIRST_TAX_RATE]);
        expect(mockDropdownButton.mock.calls.at(-1)?.[0].value).toBe('5%');
    });

    it('preserves ordered tax-rate identifiers before rendering their display labels', () => {
        mockUseFilterTaxRateValue.mockReturnValue('5%, 10%');

        render(<SearchFilterBar item={createTaxRateFilter([FIRST_TAX_RATE, SECOND_TAX_RATE])} />);

        expect(mockUseFilterTaxRateValue).toHaveBeenCalledWith([FIRST_TAX_RATE, SECOND_TAX_RATE]);
        expect(mockDropdownButton.mock.calls.at(-1)?.[0].value).toBe('5%, 10%');
    });
});
