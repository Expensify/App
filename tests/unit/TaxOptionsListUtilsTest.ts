import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getTaxRatesSection} from '@libs/TaxOptionsListUtils';

import IntlStore from '@src/languages/IntlStore';
import type {Policy, TaxRatesWithDefault, Transaction} from '@src/types/onyx';

import {localeCompare} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('TaxOptionsListUtils', () => {
    beforeAll(() => {
        IntlStore.load('en');
        return waitForBatchedUpdates();
    });
    it('getTaxRatesSection()', () => {
        const search = 'rate';
        const emptySearch = '';
        const tokenizeSearch = 'Tax 2';
        const wrongSearch = 'bla bla';

        const taxRatesWithDefault: TaxRatesWithDefault = {
            name: 'Tax',
            defaultExternalID: 'CODE1',
            defaultValue: '0%',
            foreignTaxDefault: 'CODE1',
            taxes: {
                CODE2: {
                    name: 'Tax rate 2',
                    value: '3%',
                    code: 'CODE2',
                    modifiedName: 'Tax rate 2 (3%)',
                    // A rate deleted while offline is marked with both pendingAction DELETE and isDisabled: true (see TaxRate.ts).
                    // It must still appear in the picker (struck-through and non-selectable) instead of disappearing.
                    isDisabled: true,
                    pendingAction: 'delete',
                },
                CODE3: {
                    name: 'Tax option 3',
                    value: '5%',
                    code: 'CODE3',
                    modifiedName: 'Tax option 3 (5%)',
                    pendingAction: undefined,
                },
                CODE1: {
                    name: 'Tax exempt 1',
                    value: '0%',
                    code: 'CODE1',
                    modifiedName: 'Tax exempt 1 (0%) • Default',
                    pendingAction: undefined,
                },
            },
        };
        const policy = {
            taxRates: taxRatesWithDefault,
        } as Policy;

        const transaction = {
            taxCode: 'CODE1',
        } as Transaction;

        const resultList: Array<Section<TaxRatesOption>> = [
            {
                data: [
                    {
                        code: 'CODE1',
                        isDisabled: false,
                        isSelected: undefined,
                        keyForList: 'Tax exempt 1 (0%) • Default-0',
                        searchText: 'Tax exempt 1 (0%) • Default',
                        text: 'Tax exempt 1 (0%) • Default',
                        tooltipText: 'Tax exempt 1 (0%) • Default',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE3',
                        isDisabled: false,
                        isSelected: undefined,
                        keyForList: 'Tax option 3 (5%)-1',
                        searchText: 'Tax option 3 (5%)',
                        text: 'Tax option 3 (5%)',
                        tooltipText: 'Tax option 3 (5%)',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE2',
                        isDisabled: true,
                        isSelected: undefined,
                        keyForList: 'Tax rate 2 (3%)-2',
                        searchText: 'Tax rate 2 (3%)',
                        text: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        pendingAction: 'delete',
                    },
                ],
                sectionIndex: 2,
                title: '',
            },
        ];

        const searchResultList: Array<Section<TaxRatesOption>> = [
            {
                data: [
                    {
                        code: 'CODE2',
                        isDisabled: true,
                        isSelected: undefined,
                        keyForList: 'Tax rate 2 (3%)-0',
                        searchText: 'Tax rate 2 (3%)',
                        text: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        pendingAction: 'delete',
                    },
                ],
                sectionIndex: 1,
                title: '',
            },
        ];

        const wrongSearchResultList: Array<Section<TaxRatesOption>> = [
            {
                data: [],
                sectionIndex: 1,
                title: '',
            },
        ];

        const result = getTaxRatesSection({
            policy,
            searchValue: emptySearch,
            localeCompare,
            transaction,
        });

        expect(result).toStrictEqual(resultList);

        const searchResult = getTaxRatesSection({
            policy,
            searchValue: search,
            localeCompare,
            transaction,
        });
        expect(searchResult).toStrictEqual(searchResultList);

        const tokenizeSearchResult = getTaxRatesSection({
            policy,
            searchValue: tokenizeSearch,
            localeCompare,
            transaction,
        });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);

        const wrongSearchResult = getTaxRatesSection({
            policy,
            searchValue: wrongSearch,
            localeCompare,
            transaction,
        });
        expect(wrongSearchResult).toStrictEqual(wrongSearchResultList);

        // A rate that is currently selected AND pending deletion must still render struck-through and non-selectable,
        // not as a selectable row (which could be submitted with an undefined code).
        const selectedDeletedResultList: Array<Section<TaxRatesOption>> = [
            {
                data: [
                    {
                        code: 'CODE2',
                        isDisabled: true,
                        isSelected: true,
                        keyForList: 'Tax rate 2 (3%)-0',
                        searchText: 'Tax rate 2 (3%)',
                        text: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        pendingAction: 'delete',
                    },
                    {
                        code: 'CODE1',
                        isDisabled: false,
                        isSelected: undefined,
                        keyForList: 'Tax exempt 1 (0%) • Default-1',
                        searchText: 'Tax exempt 1 (0%) • Default',
                        text: 'Tax exempt 1 (0%) • Default',
                        tooltipText: 'Tax exempt 1 (0%) • Default',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE3',
                        isDisabled: false,
                        isSelected: undefined,
                        keyForList: 'Tax option 3 (5%)-2',
                        searchText: 'Tax option 3 (5%)',
                        text: 'Tax option 3 (5%)',
                        tooltipText: 'Tax option 3 (5%)',
                        pendingAction: undefined,
                    },
                ],
                sectionIndex: 2,
                title: '',
            },
        ];

        const selectedDeletedResult = getTaxRatesSection({
            policy,
            searchValue: emptySearch,
            localeCompare,
            transaction,
            selectedOptions: [{modifiedName: 'Tax rate 2 (3%)'}],
        });
        expect(selectedDeletedResult).toStrictEqual(selectedDeletedResultList);
    });
});
