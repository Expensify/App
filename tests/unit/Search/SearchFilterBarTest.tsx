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
    default: ({label, value}: Pick<DropdownButtonProps, 'label' | 'value'>) => <MockText testID="filter-value">{value ? `${label}: ${String(value)}` : label}</MockText>,
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

    it('matches whole card IDs, decodes producer-joined IDs, and keeps card-list order', async () => {
        // Given cards whose IDs overlap and descriptions come from the card Onyx writer.
        const card12 = createMock<Card>({cardID: 12, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, cardName: 'Card 12'});
        const card123 = createMock<Card>({cardID: 123, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, cardName: 'Card 123'});
        const card456 = createMock<Card>({cardID: 456, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV, cardName: 'Card 456'});
        await Onyx.merge(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, {
            [String(card12.cardID)]: card12,
            [String(card123.cardID)]: card123,
            [String(card456.cardID)]: card456,
        });

        // When a scalar ID, an array, and the producer's joined string reach the display adapter.
        const scalar = renderFilter(FILTER_KEYS.CARD_ID, '123');
        // Then a substring ID cannot select another card.
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: Card 123');
        scalar.unmount();

        const multiple = renderFilter(FILTER_KEYS.CARD_ID, ['456', '12']);
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: Card 12, Card 456');
        multiple.unmount();

        const joined = renderFilter(FILTER_KEYS.CARD_ID, '123, 456');
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: Card 123, Card 456');
        joined.unmount();

        const nonProducer = renderFilter(FILTER_KEYS.CARD_ID, '123,456');
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter');
        nonProducer.unmount();

        renderFilter(FILTER_KEYS.CARD_ID, []);
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter');
    });

    it('selects exact feed IDs and displays multiple feeds in localized option order', async () => {
        // Given two feed records using the same company-card settings shape as the Onyx writer.
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

        // When scalar and array IDs reach the real feed value hook.
        const scalar = renderFilter(FILTER_KEYS.FEED, '123_vcf');
        // Then overlapping IDs stay distinct and labels follow locale-sorted options.
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: Alpha Feed');
        scalar.unmount();

        const multiple = renderFilter(FILTER_KEYS.FEED, ['23_vcf', '123_vcf']);
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: Alpha Feed, Zulu Feed');
        multiple.unmount();

        renderFilter(FILTER_KEYS.FEED, []);
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter');
    });

    it('selects exact tax keys and keeps policy tax order', async () => {
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

        // When scalar and array keys reach the real tax value hook.
        const scalar = renderFilter(FILTER_KEYS.TAX_RATE, 'TAX123');
        // Then only the complete key matches, while multiple names retain policy order.
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: Second Tax');
        scalar.unmount();

        const multiple = renderFilter(FILTER_KEYS.TAX_RATE, ['TAX123', 'TAX12']);
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter: First Tax, Second Tax');
        multiple.unmount();

        renderFilter(FILTER_KEYS.TAX_RATE, []);
        expect(screen.getByTestId('filter-value').props.children).toBe('Filter');
    });
});
