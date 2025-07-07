"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var CategoryOptionListUtils_1 = require("@libs/CategoryOptionListUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('CategoryOptionListUtils', function () {
    beforeAll(function () {
        IntlStore_1.default.load(CONST_1.default.LOCALES.DEFAULT);
        return (0, waitForBatchedUpdates_1.default)();
    });
    it('getCategoryListSections()', function () {
        var search = 'Food';
        var emptySearch = '';
        var wrongSearch = 'bla bla';
        var employeeSearch = 'Employee Office';
        var recentlyUsedCategories = ['Taxi', 'Restaurant'];
        var selectedOptions = [
            {
                name: 'Medical',
                enabled: true,
            },
        ];
        var smallCategoriesList = {
            Taxi: {
                enabled: false,
                name: 'Taxi',
                unencodedName: 'Taxi',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: undefined,
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
                unencodedName: 'Restaurant',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: 'delete',
            },
            Food: {
                enabled: true,
                name: 'Food',
                unencodedName: 'Food',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: undefined,
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
                unencodedName: 'Food: Meat',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: undefined,
            },
            'Employee Meals Office': {
                enabled: true,
                name: 'Employee Meals Office',
                unencodedName: 'Employee Meals Office',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: undefined,
            },
        };
        var smallResultList = [
            {
                title: '',
                shouldShow: false,
                data: [
                    {
                        text: 'Employee Meals Office',
                        keyForList: 'Employee Meals Office',
                        searchText: 'Employee Meals Office',
                        tooltipText: 'Employee Meals Office',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: 'delete',
                    },
                ],
                indexOffset: 4,
            },
        ];
        var smallSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 2,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var smallWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        var largeCategoriesList = {
            Taxi: {
                enabled: false,
                name: 'Taxi',
                unencodedName: 'Taxi',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
                unencodedName: 'Restaurant',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Food: {
                enabled: true,
                name: 'Food',
                unencodedName: 'Food',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
                unencodedName: 'Food: Meat',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Milk': {
                enabled: true,
                name: 'Food: Milk',
                unencodedName: 'Food: Milk',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Vegetables': {
                enabled: false,
                name: 'Food: Vegetables',
                unencodedName: 'Food: Vegetables',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
                unencodedName: 'Cars: Audi',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Cars: BMW': {
                enabled: false,
                name: 'Cars: BMW',
                unencodedName: 'Cars: BMW',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
                unencodedName: 'Cars: Mercedes-Benz',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Medical: {
                enabled: false,
                name: 'Medical',
                unencodedName: 'Medical',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
                unencodedName: 'Travel: Meals',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
                unencodedName: 'Travel: Meals: Breakfast',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals: Dinner': {
                enabled: false,
                name: 'Travel: Meals: Dinner',
                unencodedName: 'Travel: Meals: Dinner',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
                unencodedName: 'Travel: Meals: Lunch',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
        };
        var largeResultList = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 1,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: true,
                        isSelected: true,
                        pendingAction: undefined,
                    },
                ],
            },
            {
                title: 'Recent',
                shouldShow: true,
                indexOffset: 1,
                data: [
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
            {
                title: 'All',
                shouldShow: true,
                indexOffset: 11,
                data: [
                    {
                        text: 'Cars',
                        keyForList: 'Cars',
                        searchText: 'Cars',
                        tooltipText: 'Cars',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Audi',
                        keyForList: 'Cars: Audi',
                        searchText: 'Cars: Audi',
                        tooltipText: 'Audi',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Mercedes-Benz',
                        keyForList: 'Cars: Mercedes-Benz',
                        searchText: 'Cars: Mercedes-Benz',
                        tooltipText: 'Mercedes-Benz',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Milk',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Travel',
                        keyForList: 'Travel',
                        searchText: 'Travel',
                        tooltipText: 'Travel',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Meals',
                        keyForList: 'Travel: Meals',
                        searchText: 'Travel: Meals',
                        tooltipText: 'Meals',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '        Breakfast',
                        keyForList: 'Travel: Meals: Breakfast',
                        searchText: 'Travel: Meals: Breakfast',
                        tooltipText: 'Breakfast',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '        Lunch',
                        keyForList: 'Travel: Meals: Lunch',
                        searchText: 'Travel: Meals: Lunch',
                        tooltipText: 'Lunch',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var largeSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 3,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food: Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Food: Milk',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var largeWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        var emptyCategoriesList = {};
        var emptySelectedResultList = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 1,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: true,
                        isSelected: true,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var employeeSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 1,
                data: [
                    {
                        text: 'Employee Meals Office',
                        keyForList: 'Employee Meals Office',
                        searchText: 'Employee Meals Office',
                        tooltipText: 'Employee Meals Office',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var smallResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({
            searchValue: emptySearch,
            categories: smallCategoriesList,
        });
        expect(smallResult).toStrictEqual(smallResultList);
        var smallSearchResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({ searchValue: search, categories: smallCategoriesList });
        expect(smallSearchResult).toStrictEqual(smallSearchResultList);
        var smallWrongSearchResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({ searchValue: wrongSearch, categories: smallCategoriesList });
        expect(smallWrongSearchResult).toStrictEqual(smallWrongSearchResultList);
        var employeeSearchResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({ searchValue: employeeSearch, categories: smallCategoriesList });
        expect(employeeSearchResult).toStrictEqual(employeeSearchResultList);
        var largeResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({
            searchValue: emptySearch,
            selectedOptions: selectedOptions,
            categories: largeCategoriesList,
            recentlyUsedCategories: recentlyUsedCategories,
        });
        expect(largeResult).toStrictEqual(largeResultList);
        var largeSearchResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({
            searchValue: search,
            selectedOptions: selectedOptions,
            categories: largeCategoriesList,
            recentlyUsedCategories: recentlyUsedCategories,
        });
        expect(largeSearchResult).toStrictEqual(largeSearchResultList);
        var largeWrongSearchResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({
            searchValue: wrongSearch,
            selectedOptions: selectedOptions,
            categories: largeCategoriesList,
            recentlyUsedCategories: recentlyUsedCategories,
        });
        expect(largeWrongSearchResult).toStrictEqual(largeWrongSearchResultList);
        var emptyResult = (0, CategoryOptionListUtils_1.getCategoryListSections)({ searchValue: search, selectedOptions: selectedOptions, categories: emptyCategoriesList });
        expect(emptyResult).toStrictEqual(emptySelectedResultList);
    });
    it('getCategoryOptionTree()', function () {
        var categories = {
            Meals: {
                enabled: true,
                name: 'Meals',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
            },
            Food: {
                enabled: true,
                name: 'Food',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
            },
            'Food: Milk': {
                enabled: true,
                name: 'Food: Milk',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
            },
            Plain: {
                enabled: true,
                name: 'Plain',
            },
            Audi: {
                enabled: true,
                name: 'Audi',
            },
            Health: {
                enabled: true,
                name: 'Health',
            },
            'A: B: C': {
                enabled: true,
                name: 'A: B: C',
            },
            'A: B: C: D: E': {
                enabled: true,
                name: 'A: B: C: D: E',
            },
        };
        var result = [
            {
                text: 'Meals',
                keyForList: 'Meals',
                searchText: 'Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Meat',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Milk',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Cars',
                keyForList: 'Cars',
                searchText: 'Cars',
                tooltipText: 'Cars',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Mercedes-Benz',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel',
                keyForList: 'Travel',
                searchText: 'Travel',
                tooltipText: 'Travel',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '        Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Breakfast',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '        Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Lunch',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'A',
                keyForList: 'A',
                searchText: 'A',
                tooltipText: 'A',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    B',
                keyForList: 'A: B',
                searchText: 'A: B',
                tooltipText: 'B',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '        C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'C',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '            D',
                keyForList: 'A: B: C: D',
                searchText: 'A: B: C: D',
                tooltipText: 'D',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '                E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'E',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
        ];
        var resultOneLine = [
            {
                text: 'Meals',
                keyForList: 'Meals',
                searchText: 'Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food: Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Food: Meat',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food: Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Food: Milk',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Cars: Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Cars: Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Cars: Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Cars: Mercedes-Benz',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel: Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Travel: Meals',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel: Meals: Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Travel: Meals: Breakfast',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel: Meals: Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Travel: Meals: Lunch',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'A: B: C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'A: B: C',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'A: B: C: D: E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'A: B: C: D: E',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
        ];
        expect((0, CategoryOptionListUtils_1.getCategoryOptionTree)(categories)).toStrictEqual(result);
        expect((0, CategoryOptionListUtils_1.getCategoryOptionTree)(categories, true)).toStrictEqual(resultOneLine);
    });
    it('sortCategories', function () {
        var categoriesIncorrectOrdering = {
            Taxi: {
                name: 'Taxi',
                enabled: false,
            },
            'Test1: Sub-test2': {
                name: 'Test1: Sub-test2',
                enabled: true,
            },
            'Test: Test1: Sub-test4': {
                name: 'Test: Test1: Sub-test4',
                enabled: true,
            },
            Taxes: {
                name: 'Taxes',
                enabled: true,
            },
            Test: {
                name: 'Test',
                enabled: true,
                pendingAction: 'delete',
            },
            Test1: {
                name: 'Test1',
                enabled: true,
            },
            'Travel: Nested-Travel': {
                name: 'Travel: Nested-Travel',
                enabled: true,
            },
            'Test1: Sub-test1': {
                name: 'Test1: Sub-test1',
                enabled: true,
            },
            'Test: Test1': {
                name: 'Test: Test1',
                enabled: true,
            },
            'Test: Test1: Sub-test1': {
                name: 'Test: Test1: Sub-test1',
                enabled: true,
            },
            'Test: Test1: Sub-test3': {
                name: 'Test: Test1: Sub-test3',
                enabled: false,
            },
            'Test: Test1: Sub-test2': {
                name: 'Test: Test1: Sub-test2',
                enabled: true,
            },
            'Test: Test2': {
                name: 'Test: Test2',
                enabled: true,
            },
            Travel: {
                name: 'Travel',
                enabled: true,
            },
            Utilities: {
                name: 'Utilities',
                enabled: true,
            },
            'Test: Test3: Sub-test1': {
                name: 'Test: Test3: Sub-test1',
                enabled: true,
            },
            'Test1: Sub-test3': {
                name: 'Test1: Sub-test3',
                enabled: true,
            },
        };
        var result = [
            {
                name: 'Taxes',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Taxi',
                enabled: false,
                pendingAction: undefined,
            },
            {
                name: 'Test',
                enabled: true,
                pendingAction: 'delete',
            },
            {
                name: 'Test: Test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Sub-test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Sub-test2',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Sub-test3',
                enabled: false,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Sub-test4',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test2',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test3: Sub-test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1: Sub-test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1: Sub-test2',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1: Sub-test3',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Travel',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Travel: Nested-Travel',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Utilities',
                enabled: true,
                pendingAction: undefined,
            },
        ];
        var categoriesIncorrectOrdering2 = {
            'Cars: BMW': {
                enabled: false,
                name: 'Cars: BMW',
            },
            Medical: {
                enabled: false,
                name: 'Medical',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
            },
            Food: {
                enabled: true,
                name: 'Food',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
            },
            'Travel: Meals: Dinner': {
                enabled: false,
                name: 'Travel: Meals: Dinner',
            },
            'Food: Vegetables': {
                enabled: false,
                name: 'Food: Vegetables',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
            },
            Taxi: {
                enabled: false,
                name: 'Taxi',
            },
            'Food: Milk': {
                enabled: true,
                name: 'Food: Milk',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
            },
        };
        var result2 = [
            {
                enabled: true,
                name: 'Cars: Audi',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Cars: BMW',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Food',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Food: Meat',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Food: Milk',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Food: Vegetables',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Medical',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Restaurant',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Taxi',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Travel: Meals',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Travel: Meals: Dinner',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Travel: Meals: Lunch',
                pendingAction: undefined,
            },
        ];
        var categoriesIncorrectOrdering3 = {
            'Movies: Mr. Nobody': {
                enabled: true,
                name: 'Movies: Mr. Nobody',
            },
            Movies: {
                enabled: true,
                name: 'Movies',
            },
            'House, M.D.': {
                enabled: true,
                name: 'House, M.D.',
            },
            'Dr. House': {
                enabled: true,
                name: 'Dr. House',
            },
            'Many.dots.on.the.way.': {
                enabled: true,
                name: 'Many.dots.on.the.way.',
            },
            'More.Many.dots.on.the.way.': {
                enabled: false,
                name: 'More.Many.dots.on.the.way.',
            },
        };
        var result3 = [
            {
                enabled: true,
                name: 'Dr. House',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'House, M.D.',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Many.dots.on.the.way.',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'More.Many.dots.on.the.way.',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Movies',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Movies: Mr. Nobody',
                pendingAction: undefined,
            },
        ];
        expect((0, CategoryOptionListUtils_1.sortCategories)(categoriesIncorrectOrdering)).toStrictEqual(result);
        expect((0, CategoryOptionListUtils_1.sortCategories)(categoriesIncorrectOrdering2)).toStrictEqual(result2);
        expect((0, CategoryOptionListUtils_1.sortCategories)(categoriesIncorrectOrdering3)).toStrictEqual(result3);
    });
});
