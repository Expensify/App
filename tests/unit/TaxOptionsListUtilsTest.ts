import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {TaxRatesOption} from '@libs/TaxOptionsListUtils';
import {getTaxRatesSection} from '@libs/TaxOptionsListUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy, TaxRatesWithDefault, Transaction} from '@src/types/onyx';
import {localeCompare} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('TaxOptionsListUtils', () => {
    function buildPolicyWithTaxes(taxes: Array<{code: string; name: string; value: string; pendingAction?: 'delete'}>): Policy {
        return {
            taxRates: {
                name: 'Tax',
                defaultExternalID: '',
                defaultValue: '',
                foreignTaxDefault: '',
                taxes: Object.fromEntries(
                    taxes.map((tax) => [
                        tax.code,
                        {
                            ...tax,
                            modifiedName: `${tax.name} (${tax.value})`,
                        },
                    ]),
                ),
            },
        } as Policy;
    }

    beforeAll(() => {
        IntlStore.load('en');
        return waitForBatchedUpdates();
    });

    it('keeps natural sorted order for small lists without forcing the selected tax to the top', () => {
        const policy = buildPolicyWithTaxes([
            {code: 'CODE_C', name: 'Tax C', value: '3%'},
            {code: 'CODE_A', name: 'Tax A', value: '1%'},
            {code: 'CODE_D', name: 'Tax D', value: '4%'},
            {code: 'CODE_B', name: 'Tax B', value: '2%'},
        ]);

        const result = getTaxRatesSection({
            policy,
            searchValue: '',
            localeCompare,
            selectedOptions: [{modifiedName: 'Tax C (3%)'}],
        });

        expect(result).toHaveLength(1);
        expect(result.at(0)?.data.map((tax) => tax.searchText)).toEqual(['Tax A (1%)', 'Tax B (2%)', 'Tax C (3%)', 'Tax D (4%)']);
        expect(result.at(0)?.data.at(2)).toEqual(expect.objectContaining({searchText: 'Tax C (3%)', isSelected: true}));
    });

    it('keeps a selected section on top for lists above the reorder threshold', () => {
        const taxes = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 1}, (_, index) => {
            const letter = String.fromCharCode(65 + index);

            return {
                code: `CODE_${letter}`,
                name: `Tax ${letter}`,
                value: `${index + 1}%`,
            };
        });

        const policy = buildPolicyWithTaxes(taxes);
        const selectedTaxName = 'Tax E (5%)';

        const result = getTaxRatesSection({
            policy,
            searchValue: '',
            localeCompare,
            selectedOptions: [{modifiedName: selectedTaxName}],
        });

        expect(result).toHaveLength(2);
        expect(result.at(0)?.data).toEqual([expect.objectContaining({searchText: selectedTaxName, isSelected: true})]);
        expect(result.at(1)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({searchText: selectedTaxName})]));
    });

    it('shows a disabled previously selected tax when it is the only available selected option', () => {
        const policy = buildPolicyWithTaxes([{code: 'CODE_A', name: 'Tax A', value: '1%', pendingAction: 'delete'}]);

        const result = getTaxRatesSection({
            policy,
            searchValue: '',
            localeCompare,
            selectedOptions: [{modifiedName: 'Tax A (1%)'}],
        });

        expect(result).toHaveLength(1);
        expect(result.at(0)?.data).toEqual([expect.objectContaining({searchText: 'Tax A (1%)', isSelected: true, isDisabled: true})]);
    });

    it('supports default ordering and search results for mixed enabled and deleted taxes', () => {
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
                        isSelected: false,
                        keyForList: 'Tax exempt 1 (0%) • Default-0',
                        searchText: 'Tax exempt 1 (0%) • Default',
                        text: 'Tax exempt 1 (0%) • Default',
                        tooltipText: 'Tax exempt 1 (0%) • Default',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE3',
                        isDisabled: false,
                        isSelected: false,
                        keyForList: 'Tax option 3 (5%)-1',
                        searchText: 'Tax option 3 (5%)',
                        text: 'Tax option 3 (5%)',
                        tooltipText: 'Tax option 3 (5%)',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE2',
                        isDisabled: true,
                        isSelected: false,
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
    });
});
