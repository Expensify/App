"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TagsOptionsListUtils_1 = require("@libs/TagsOptionsListUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('TagsOptionsListUtils', function () {
    beforeAll(function () {
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        return (0, waitForBatchedUpdates_1.default)();
    });
    it('getTagListSections()', function () {
        var search = 'ing';
        var emptySearch = '';
        var wrongSearch = 'bla bla';
        var employeeSearch = 'Employee Office';
        var recentlyUsedTags = ['Engineering', 'HR'];
        var selectedOptions = [
            {
                name: 'Medical',
                enabled: true,
                accountID: undefined,
            },
        ];
        var smallTagsList = {
            Engineering: {
                enabled: false,
                name: 'Engineering',
                accountID: undefined,
            },
            Medical: {
                enabled: true,
                name: 'Medical',
                accountID: undefined,
            },
            Accounting: {
                enabled: true,
                name: 'Accounting',
                accountID: undefined,
            },
            HR: {
                enabled: true,
                name: 'HR',
                accountID: undefined,
                pendingAction: 'delete',
            },
            EmployeeMealsOffice: {
                enabled: true,
                name: 'Employee Meals Office',
                accountID: undefined,
            },
        };
        var smallResultList = [
            {
                title: '',
                shouldShow: false,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
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
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: 'delete',
                    },
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var smallSearchResultList = [
            {
                title: '',
                shouldShow: true,
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        var employeeSearchResultList = [
            {
                title: '',
                shouldShow: true,
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
        var smallWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                data: [],
            },
        ];
        var largeTagsList = {
            Engineering: {
                enabled: false,
                name: 'Engineering',
                accountID: undefined,
            },
            Medical: {
                enabled: true,
                name: 'Medical',
                accountID: undefined,
            },
            Accounting: {
                enabled: true,
                name: 'Accounting',
                accountID: undefined,
            },
            HR: {
                enabled: true,
                name: 'HR',
                accountID: undefined,
            },
            Food: {
                enabled: true,
                name: 'Food',
                accountID: undefined,
            },
            Traveling: {
                enabled: false,
                name: 'Traveling',
                accountID: undefined,
            },
            Cleaning: {
                enabled: true,
                name: 'Cleaning',
                accountID: undefined,
            },
            Software: {
                enabled: true,
                name: 'Software',
                accountID: undefined,
            },
            OfficeSupplies: {
                enabled: false,
                name: 'Office Supplies',
                accountID: undefined,
            },
            Taxes: {
                enabled: true,
                name: 'Taxes',
                accountID: undefined,
                pendingAction: 'delete',
            },
            Benefits: {
                enabled: true,
                name: 'Benefits',
                accountID: undefined,
            },
        };
        var largeResultList = [
            {
                title: '',
                shouldShow: true,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                        isSelected: true,
                        pendingAction: undefined,
                    },
                ],
            },
            {
                title: 'Recent',
                shouldShow: true,
                data: [
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
            {
                title: 'All',
                shouldShow: true,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Benefits',
                        keyForList: 'Benefits',
                        searchText: 'Benefits',
                        tooltipText: 'Benefits',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Cleaning',
                        keyForList: 'Cleaning',
                        searchText: 'Cleaning',
                        tooltipText: 'Cleaning',
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
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Software',
                        keyForList: 'Software',
                        searchText: 'Software',
                        tooltipText: 'Software',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Taxes',
                        keyForList: 'Taxes',
                        searchText: 'Taxes',
                        tooltipText: 'Taxes',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: 'delete',
                    },
                ],
            },
        ];
        var largeSearchResultList = [
            {
                title: '',
                shouldShow: true,
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Cleaning',
                        keyForList: 'Cleaning',
                        searchText: 'Cleaning',
                        tooltipText: 'Cleaning',
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
                data: [],
            },
        ];
        var smallResult = (0, TagsOptionsListUtils_1.getTagListSections)({ searchValue: emptySearch, tags: smallTagsList });
        expect(smallResult).toStrictEqual(smallResultList);
        var smallSearchResult = (0, TagsOptionsListUtils_1.getTagListSections)({ searchValue: search, tags: smallTagsList });
        expect(smallSearchResult).toStrictEqual(smallSearchResultList);
        var employeeSearchResult = (0, TagsOptionsListUtils_1.getTagListSections)({ searchValue: employeeSearch, tags: smallTagsList });
        expect(employeeSearchResult).toStrictEqual(employeeSearchResultList);
        var smallWrongSearchResult = (0, TagsOptionsListUtils_1.getTagListSections)({ searchValue: wrongSearch, tags: smallTagsList });
        expect(smallWrongSearchResult).toStrictEqual(smallWrongSearchResultList);
        var largeResult = (0, TagsOptionsListUtils_1.getTagListSections)({ searchValue: emptySearch, selectedOptions: selectedOptions, tags: largeTagsList, recentlyUsedTags: recentlyUsedTags });
        expect(largeResult).toStrictEqual(largeResultList);
        var largeSearchResult = (0, TagsOptionsListUtils_1.getTagListSections)({ searchValue: search, selectedOptions: selectedOptions, tags: largeTagsList, recentlyUsedTags: recentlyUsedTags });
        expect(largeSearchResult).toStrictEqual(largeSearchResultList);
        var largeWrongSearchResult = (0, TagsOptionsListUtils_1.getTagListSections)({
            searchValue: wrongSearch,
            selectedOptions: selectedOptions,
            tags: largeTagsList,
            recentlyUsedTags: recentlyUsedTags,
        });
        expect(largeWrongSearchResult).toStrictEqual(largeWrongSearchResultList);
    });
    it('sortTags', function () {
        var createTagObjects = function (names) { return names.map(function (name) { return ({ name: name, enabled: true }); }); };
        var unorderedTagNames = ['10bc', 'b', '0a', '1', '中国', 'b10', '!', '2', '0', '@', 'a1', 'a', '3', 'b1', '日本', '$', '20', '20a', '#', 'a20', 'c', '10'];
        var expectedOrderNames = ['!', '@', '#', '$', '0', '0a', '1', '2', '3', '10', '10bc', '20', '20a', 'a', 'a1', 'a20', 'b', 'b1', 'b10', 'c', '中国', '日本'];
        var unorderedTags = createTagObjects(unorderedTagNames);
        var expectedOrder = createTagObjects(expectedOrderNames);
        expect((0, TagsOptionsListUtils_1.sortTags)(unorderedTags)).toStrictEqual(expectedOrder);
        var unorderedTagNames2 = ['0', 'a1', '1', 'b1', '3', '10', 'b10', 'a', '2', 'c', '20', 'a20', 'b'];
        var expectedOrderNames2 = ['0', '1', '2', '3', '10', '20', 'a', 'a1', 'a20', 'b', 'b1', 'b10', 'c'];
        var unorderedTags2 = createTagObjects(unorderedTagNames2);
        var expectedOrder2 = createTagObjects(expectedOrderNames2);
        expect((0, TagsOptionsListUtils_1.sortTags)(unorderedTags2)).toStrictEqual(expectedOrder2);
        var unorderedTagNames3 = [
            '61',
            '39',
            '97',
            '93',
            '77',
            '71',
            '22',
            '27',
            '30',
            '64',
            '91',
            '24',
            '33',
            '60',
            '21',
            '85',
            '59',
            '76',
            '42',
            '67',
            '13',
            '96',
            '84',
            '44',
            '68',
            '31',
            '62',
            '87',
            '50',
            '4',
            '100',
            '12',
            '28',
            '49',
            '53',
            '5',
            '45',
            '14',
            '55',
            '78',
            '11',
            '35',
            '75',
            '18',
            '9',
            '80',
            '54',
            '2',
            '34',
            '48',
            '81',
            '6',
            '73',
            '15',
            '98',
            '25',
            '8',
            '99',
            '17',
            '90',
            '47',
            '1',
            '10',
            '38',
            '66',
            '57',
            '23',
            '86',
            '29',
            '3',
            '65',
            '74',
            '19',
            '56',
            '63',
            '20',
            '7',
            '32',
            '46',
            '70',
            '26',
            '16',
            '83',
            '37',
            '58',
            '43',
            '36',
            '69',
            '79',
            '72',
            '41',
            '94',
            '95',
            '82',
            '51',
            '52',
            '89',
            '88',
            '40',
            '92',
        ];
        var expectedOrderNames3 = [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22',
            '23',
            '24',
            '25',
            '26',
            '27',
            '28',
            '29',
            '30',
            '31',
            '32',
            '33',
            '34',
            '35',
            '36',
            '37',
            '38',
            '39',
            '40',
            '41',
            '42',
            '43',
            '44',
            '45',
            '46',
            '47',
            '48',
            '49',
            '50',
            '51',
            '52',
            '53',
            '54',
            '55',
            '56',
            '57',
            '58',
            '59',
            '60',
            '61',
            '62',
            '63',
            '64',
            '65',
            '66',
            '67',
            '68',
            '69',
            '70',
            '71',
            '72',
            '73',
            '74',
            '75',
            '76',
            '77',
            '78',
            '79',
            '80',
            '81',
            '82',
            '83',
            '84',
            '85',
            '86',
            '87',
            '88',
            '89',
            '90',
            '91',
            '92',
            '93',
            '94',
            '95',
            '96',
            '97',
            '98',
            '99',
            '100',
        ];
        var unorderedTags3 = createTagObjects(unorderedTagNames3);
        var expectedOrder3 = createTagObjects(expectedOrderNames3);
        expect((0, TagsOptionsListUtils_1.sortTags)(unorderedTags3)).toStrictEqual(expectedOrder3);
    });
    it('sortTags by object works the same', function () {
        var _a, _b, _c;
        var tagsObject = {
            name: 'Tag',
            orderWeight: 0,
            required: false,
            tags: {
                OfficeSupplies: {
                    enabled: true,
                    name: 'OfficeSupplies',
                },
                DisabledTag: {
                    enabled: false,
                    name: 'DisabledTag',
                },
                Car: {
                    enabled: true,
                    name: 'Car',
                },
            },
        };
        var sorted = (0, TagsOptionsListUtils_1.sortTags)(tagsObject.tags);
        expect(Array.isArray(sorted)).toBe(true);
        // Expect to be sorted alphabetically
        expect((_a = sorted.at(0)) === null || _a === void 0 ? void 0 : _a.name).toBe('Car');
        expect((_b = sorted.at(1)) === null || _b === void 0 ? void 0 : _b.name).toBe('DisabledTag');
        expect((_c = sorted.at(2)) === null || _c === void 0 ? void 0 : _c.name).toBe('OfficeSupplies');
    });
});
