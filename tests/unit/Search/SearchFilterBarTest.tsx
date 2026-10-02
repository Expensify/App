import {render, screen} from '@testing-library/react-native';

import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import SearchFilterBar from '@components/Search/SearchPageHeader/SearchFilterBar';
import type {FilterItem} from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import Text from '@components/Text';

import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds, CardList, Policy} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';

jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: () => false}}));

const COLLIDING_CARD: Card = {
    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD,
    cardID: 12,
    domainName: 'colliding-card.example',
    fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
    lastUpdated: '',
    nameValuePairs: createMock<NonNullable<Card['nameValuePairs']>>({cardTitle: 'Colliding card'}),
    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
};
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
    [COLLIDING_CARD.cardID]: COLLIDING_CARD,
    [FIRST_CARD.cardID]: FIRST_CARD,
    [SECOND_CARD.cardID]: SECOND_CARD,
};
const FIRST_FEED_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
const OVERLAPPING_FEED_NAME = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}2` satisfies CardFeedWithNumber;
const SECOND_FEED_NAME = CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD;
const FIRST_FEED = `123_${FIRST_FEED_NAME}`;
const OVERLAPPING_FEED = `123_${OVERLAPPING_FEED_NAME}`;
const SECOND_FEED = `123_${SECOND_FEED_NAME}`;
const COLLIDING_CARD_FEEDS = createMock<CardFeeds>({
    settings: {companyCards: {[FIRST_FEED_NAME]: {}}, companyCardNicknames: {[FIRST_FEED_NAME]: 'Colliding feed'}},
});
const CARD_FEEDS = createMock<CardFeeds>({
    settings: {
        companyCards: {[FIRST_FEED_NAME]: {}, [OVERLAPPING_FEED_NAME]: {}, [SECOND_FEED_NAME]: {}},
        companyCardNicknames: {[FIRST_FEED_NAME]: 'First feed', [OVERLAPPING_FEED_NAME]: 'Overlapping feed', [SECOND_FEED_NAME]: 'Second feed'},
    },
});
const COLLIDING_TAX_RATE = 'id_TAX_RATE';
const FIRST_TAX_RATE = 'id_TAX_RATE_1';
const SECOND_TAX_RATE = 'id_TAX_RATE_2';
const TAX_POLICY = createMock<Policy>({
    id: 'search-filter-bar',
    taxRates: {
        taxes: {
            [COLLIDING_TAX_RATE]: {name: 'Colliding tax', value: '1%'},
            [FIRST_TAX_RATE]: {name: 'First tax', value: '5%'},
            [SECOND_TAX_RATE]: {name: 'Second tax', value: '10%'},
        },
    },
});
jest.mock('@components/Search/FilterDropdowns/DropdownButton', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)}),
}));
const mockDropdownButton = jest.mocked(DropdownButton);

function createCardFilter(value: string | string[]): SearchFilter & FilterItem {
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}12`, COLLIDING_CARD_FEEDS);
        await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}123`, CARD_FEEDS);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${TAX_POLICY.id}`, TAX_POLICY);
    });

    it('renders the description for one scalar card ID', () => {
        render(<SearchFilterBar item={createCardFilter(SECOND_CARD.cardID.toString())} />);
        expect(screen.getByText('Cards: Second card')).toBeOnTheScreen();
    });

    it('renders only the exact card when scalar card IDs collide', () => {
        render(<SearchFilterBar item={createCardFilter(FIRST_CARD.cardID.toString())} />);
        expect(screen.getByText('Cards: First card')).toBeOnTheScreen();
    });

    it('renders both descriptions for joined scalar card IDs in card-list order', () => {
        render(<SearchFilterBar item={createCardFilter(`${FIRST_CARD.cardID}, ${SECOND_CARD.cardID}`)} />);
        expect(screen.getByText('Cards: First card, Second card')).toBeOnTheScreen();
    });

    it('does not parse joined card IDs without the producer delimiter', () => {
        render(<SearchFilterBar item={createCardFilter(`${FIRST_CARD.cardID},${SECOND_CARD.cardID}`)} />);
        expect(screen.getByText('Cards')).toBeOnTheScreen();
    });

    it('renders mutable card arrays in card-list order', () => {
        render(<SearchFilterBar item={createCardFilter([FIRST_CARD.cardID.toString(), SECOND_CARD.cardID.toString()])} />);
        expect(screen.getByText('Cards: First card, Second card')).toBeOnTheScreen();
    });

    it('normalizes a scalar feed before rendering its display label', () => {
        render(<SearchFilterBar item={createFeedFilter(FIRST_FEED)} />);
        expect(screen.getByText('Feeds: First feed')).toBeOnTheScreen();
    });

    it('renders only the exact feed when scalar feed identifiers overlap', () => {
        render(<SearchFilterBar item={createFeedFilter(OVERLAPPING_FEED)} />);
        expect(screen.getByText('Feeds: Overlapping feed')).toBeOnTheScreen();
    });

    it('preserves ordered feed identifiers before rendering their display labels', () => {
        render(<SearchFilterBar item={createFeedFilter([FIRST_FEED, SECOND_FEED])} />);
        expect(screen.getByText('Feeds: First feed, Second feed')).toBeOnTheScreen();
    });

    it('normalizes a scalar tax rate before rendering its display label', () => {
        render(<SearchFilterBar item={createTaxRateFilter(FIRST_TAX_RATE)} />);
        expect(screen.getByText('Tax rates: First tax')).toBeOnTheScreen();
    });

    it('preserves ordered tax-rate identifiers before rendering their display labels', () => {
        render(<SearchFilterBar item={createTaxRateFilter([FIRST_TAX_RATE, SECOND_TAX_RATE])} />);
        expect(screen.getByText('Tax rates: First tax, Second tax')).toBeOnTheScreen();
    });
});
