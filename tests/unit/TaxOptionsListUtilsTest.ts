import type {CategorySection} from '@libs/OptionsListUtils';
import * as TaxOptionsListUtils from '@libs/TaxOptionsListUtils';
import type {Policy, TaxRatesWithDefault, Transaction} from '@src/types/onyx';

describe('TaxOptionsListUtils', () => {
    it('getTaxRatesSection()', () => {
        const search = 'rate';
        const emptySearch = '';
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

        const resultList: CategorySection[] = [
            {
                data: [
                    {
                        code: 'CODE1',
                        isDisabled: false,
                        isSelected: undefined,
                        keyForList: 'Tax exempt 1 (0%) • Default',
                        searchText: 'Tax exempt 1 (0%) • Default',
                        text: 'Tax exempt 1 (0%) • Default',
                        tooltipText: 'Tax exempt 1 (0%) • Default',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE3',
                        isDisabled: false,
                        isSelected: undefined,
                        keyForList: 'Tax option 3 (5%)',
                        searchText: 'Tax option 3 (5%)',
                        text: 'Tax option 3 (5%)',
                        tooltipText: 'Tax option 3 (5%)',
                        pendingAction: undefined,
                    },
                    {
                        code: 'CODE2',
                        isDisabled: true,
                        isSelected: undefined,
                        keyForList: 'Tax rate 2 (3%)',
                        searchText: 'Tax rate 2 (3%)',
                        text: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        pendingAction: 'delete',
                    },
                ],
                shouldShow: false,
                title: '',
            },
        ];

        const searchResultList: CategorySection[] = [
            {
                data: [
                    {
                        code: 'CODE2',
                        isDisabled: true,
                        isSelected: undefined,
                        keyForList: 'Tax rate 2 (3%)',
                        searchText: 'Tax rate 2 (3%)',
                        text: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        pendingAction: 'delete',
                    },
                ],
                shouldShow: true,
                title: '',
            },
        ];

        const wrongSearchResultList: CategorySection[] = [
            {
                data: [],
                shouldShow: true,
                title: '',
            },
        ];

        const result = TaxOptionsListUtils.getTaxRatesSection({
            policy,
            searchValue: emptySearch,
            transaction,
        });

        expect(result).toStrictEqual(resultList);

        const searchResult = TaxOptionsListUtils.getTaxRatesSection({
            policy,
            searchValue: search,
            transaction,
        });
        expect(searchResult).toStrictEqual(searchResultList);

        const wrongSearchResult = TaxOptionsListUtils.getTaxRatesSection({
            policy,
            searchValue: wrongSearch,
            transaction,
        });
        expect(wrongSearchResult).toStrictEqual(wrongSearchResultList);
    });
});
