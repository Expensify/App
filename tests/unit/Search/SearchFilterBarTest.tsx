import {render, screen} from '@testing-library/react-native';

import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
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

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

const mockDropdownButton = jest.mocked(DropdownButton);

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

describe('SearchFilterBar card descriptions', () => {
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
});
