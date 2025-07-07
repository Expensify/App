"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TaxOptionsListUtils_1 = require("@libs/TaxOptionsListUtils");
var IntlStore_1 = require("@src/languages/IntlStore");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('TaxOptionsListUtils', function () {
    beforeAll(function () {
        IntlStore_1.default.load('en');
        return (0, waitForBatchedUpdates_1.default)();
    });
    it('getTaxRatesSection()', function () {
        var search = 'rate';
        var emptySearch = '';
        var tokenizeSearch = 'Tax 2';
        var wrongSearch = 'bla bla';
        var taxRatesWithDefault = {
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
        var policy = {
            taxRates: taxRatesWithDefault,
        };
        var transaction = {
            taxCode: 'CODE1',
        };
        var resultList = [
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
        var searchResultList = [
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
        var wrongSearchResultList = [
            {
                data: [],
                shouldShow: true,
                title: '',
            },
        ];
        var result = (0, TaxOptionsListUtils_1.getTaxRatesSection)({
            policy: policy,
            searchValue: emptySearch,
            transaction: transaction,
        });
        expect(result).toStrictEqual(resultList);
        var searchResult = (0, TaxOptionsListUtils_1.getTaxRatesSection)({
            policy: policy,
            searchValue: search,
            transaction: transaction,
        });
        expect(searchResult).toStrictEqual(searchResultList);
        var tokenizeSearchResult = (0, TaxOptionsListUtils_1.getTaxRatesSection)({
            policy: policy,
            searchValue: tokenizeSearch,
            transaction: transaction,
        });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
        var wrongSearchResult = (0, TaxOptionsListUtils_1.getTaxRatesSection)({
            policy: policy,
            searchValue: wrongSearch,
            transaction: transaction,
        });
        expect(wrongSearchResult).toStrictEqual(wrongSearchResultList);
    });
});
