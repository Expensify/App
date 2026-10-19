import {render, screen} from '@testing-library/react-native';

import type {DropdownButtonProps} from '@components/Search/FilterDropdowns/DropdownButton';
import SearchFilterBar from '@components/Search/SearchPageHeader/SearchFilterBar';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';

import type {SearchFilter} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const MockText = Text;

jest.mock('@components/Search/FilterDropdowns/DropdownButton', () => ({
    __esModule: true,
    default: ({label, value}: Pick<DropdownButtonProps, 'label' | 'value'>) => <MockText>{value ? `${label}: ${String(value)}` : label}</MockText>,
}));
jest.mock('@hooks/useLocalize');

const mockUseLocalize = jest.mocked(useLocalize);
const FILTER_KEYS = CONST.SEARCH.SYNTAX_FILTER_KEYS;

function renderFilter(key: SearchFilter['key'], value: SearchFilter['value']) {
    const item = {
        key,
        value,
        label: 'Filter',
        PopoverComponent: () => null,
        sentryLabel: 'Search-Filter',
        onClosePress: undefined,
    };
    return render(<SearchFilterBar item={item} />);
}

describe('SearchFilterBar value adapters', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockUseLocalize.mockReturnValue(
            createMock<ReturnType<typeof useLocalize>>({
                translate: <TPath extends TranslationPaths>(path: TPath, ...[,]: TranslationParameters<TPath>) => String(path),
                localeCompare: (a: string, b: string) => a.localeCompare(b),
            }),
        );
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([
        {scenario: 'a scalar ID overlapping another card ID', value: '123', expected: 'Filter: Card 123'},
        {scenario: 'an array shown in card-list order', value: ['456', '12'], expected: 'Filter: Card 12, Card 456'},
        {scenario: 'IDs joined with the producer delimiter', value: '123, 456', expected: 'Filter: Card 123, Card 456'},
        {scenario: 'IDs joined without the producer space', value: '123,456', expected: 'Filter'},
        {scenario: 'an empty selection', value: [], expected: 'Filter'},
    ])('labels cards for $scenario', async ({value, expected}) => {
        // Given cards whose IDs overlap and descriptions come from the card Onyx writer.
        const card12 = createMock<Card>({cardID: 12, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, cardName: 'Card 12'});
        const card123 = createMock<Card>({cardID: 123, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, cardName: 'Card 123'});
        const card456 = createMock<Card>({cardID: 456, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, cardName: 'Card 456'});
        await Onyx.merge(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, {
            [String(card12.cardID)]: card12,
            [String(card123.cardID)]: card123,
            [String(card456.cardID)]: card456,
        });

        // When the adapter receives a card selection, only the producer's exact delimiter should separate scalar IDs.
        renderFilter(FILTER_KEYS.CARD_ID, value);

        // Then whole IDs select cards in card-list order, while unrecognized or empty selections keep the base label.
        expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it.each([
        {scenario: 'a scalar ID overlapping another feed ID', value: '123_vcf', expected: 'Filter: Alpha Feed'},
        {scenario: 'an array shown in localized option order', value: ['23_vcf', '123_vcf'], expected: 'Filter: Alpha Feed, Zulu Feed'},
        {scenario: 'an empty selection', value: [], expected: 'Filter'},
    ])('labels feeds for $scenario', async ({value, expected}) => {
        // Given overlapping feed IDs with names ordered differently from insertion order to expose incorrect matching or sorting.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}23`, {
            settings: {
                companyCards: {vcf: {}},
                companyCardNicknames: {vcf: 'Zulu Feed'},
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}123`, {
            settings: {
                companyCards: {vcf: {}},
                companyCardNicknames: {vcf: 'Alpha Feed'},
            },
        });

        // When the adapter receives a feed selection, the real hook must resolve complete option IDs.
        renderFilter(FILTER_KEYS.FEED, value);

        // Then overlapping IDs stay distinct, names follow localized option order, and an empty selection keeps the base label.
        expect(screen.getByText(expected)).toBeOnTheScreen();
    });

    it.each([
        {scenario: 'a scalar key overlapping another tax key', value: 'TAX123', expected: 'Filter: Second Tax'},
        {scenario: 'an array shown in policy tax order', value: ['TAX123', 'TAX12'], expected: 'Filter: First Tax, Second Tax'},
        {scenario: 'an empty selection', value: [], expected: 'Filter'},
    ])('labels tax rates for $scenario', async ({value, expected}) => {
        // Given a policy tax collection with colliding key prefixes.
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.POLICY}1`,
            createMock<Policy>({
                id: '1',
                taxRates: {
                    name: 'Tax',
                    defaultExternalID: '',
                    defaultValue: '',
                    foreignTaxDefault: '',
                    taxes: {
                        TAX12: {name: 'First Tax', value: '12%'},
                        TAX123: {name: 'Second Tax', value: '123%'},
                    },
                },
            }),
        );

        // When the adapter receives a tax selection, the real hook must distinguish complete keys despite their shared prefix.
        renderFilter(FILTER_KEYS.TAX_RATE, value);

        // Then names retain policy order rather than selection order, and an empty selection keeps the base label.
        expect(screen.getByText(expected)).toBeOnTheScreen();
    });
});
