/* eslint-disable @typescript-eslint/naming-convention */
import {getCategoryListSections, getCategoryOptionTree, sortCategories} from '@libs/CategoryOptionListUtils';
import type {Category, CategoryTreeSection} from '@libs/CategoryOptionListUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {PolicyCategories} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('CategoryOptionListUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });
    it('getCategoryListSections()', () => {
        const search = 'Food';
        const emptySearch = '';
        const wrongSearch = 'bla bla';
        const employeeSearch = 'Employee Office';
        const recentlyUsedCategories = ['Taxi', 'Restaurant'];
        const selectedOptions: Category[] = [
            {
                name: 'Medical',
                enabled: true,
            },
        ];
        const smallCategoriesList: PolicyCategories = {
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
        const smallResultList: CategoryTreeSection[] = [
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
        const smallSearchResultList: CategoryTreeSection[] = [
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
        const smallWrongSearchResultList: CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const largeCategoriesList: PolicyCategories = {
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
            Entertainment: {
                enabled: true,
                name: 'Entertainment',
                unencodedName: 'Entertainment',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Office Supplies': {
                enabled: true,
                name: 'Office Supplies',
                unencodedName: 'Office Supplies',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Utilities: {
                enabled: true,
                name: 'Utilities',
                unencodedName: 'Utilities',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
        };
        const largeResultList: CategoryTreeSection[] = [
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
                indexOffset: 14,
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
                        text: 'Entertainment',
                        keyForList: 'Entertainment',
                        searchText: 'Entertainment',
                        tooltipText: 'Entertainment',
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
                        text: 'Office Supplies',
                        keyForList: 'Office Supplies',
                        searchText: 'Office Supplies',
                        tooltipText: 'Office Supplies',
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
                    {
                        text: 'Utilities',
                        keyForList: 'Utilities',
                        searchText: 'Utilities',
                        tooltipText: 'Utilities',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        const largeSearchResultList: CategoryTreeSection[] = [
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
        const largeWrongSearchResultList: CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const emptyCategoriesList = {};
        const emptySelectedResultList: CategoryTreeSection[] = [
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

        const employeeSearchResultList: CategoryTreeSection[] = [
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

        const smallResult = getCategoryListSections({
            searchValue: emptySearch,
            localeCompare,
            categories: smallCategoriesList,
            translate: translateLocal,
        });
        expect(smallResult).toStrictEqual(smallResultList);

        const smallSearchResult = getCategoryListSections({searchValue: search, categories: smallCategoriesList, localeCompare, translate: translateLocal});
        expect(smallSearchResult).toStrictEqual(smallSearchResultList);

        const smallWrongSearchResult = getCategoryListSections({searchValue: wrongSearch, categories: smallCategoriesList, localeCompare, translate: translateLocal});
        expect(smallWrongSearchResult).toStrictEqual(smallWrongSearchResultList);

        const employeeSearchResult = getCategoryListSections({searchValue: employeeSearch, categories: smallCategoriesList, localeCompare, translate: translateLocal});
        expect(employeeSearchResult).toStrictEqual(employeeSearchResultList);

        const largeResult = getCategoryListSections({
            searchValue: emptySearch,
            selectedOptions,
            categories: largeCategoriesList,
            recentlyUsedCategories,
            localeCompare,
            translate: translateLocal,
        });
        expect(largeResult).toStrictEqual(largeResultList);

        const largeSearchResult = getCategoryListSections({
            searchValue: search,
            selectedOptions,
            categories: largeCategoriesList,
            recentlyUsedCategories,
            localeCompare,
            translate: translateLocal,
        });
        expect(largeSearchResult).toStrictEqual(largeSearchResultList);

        const largeWrongSearchResult = getCategoryListSections({
            searchValue: wrongSearch,
            selectedOptions,
            categories: largeCategoriesList,
            recentlyUsedCategories,
            localeCompare,
            translate: translateLocal,
        });
        expect(largeWrongSearchResult).toStrictEqual(largeWrongSearchResultList);

        const emptyResult = getCategoryListSections({searchValue: search, selectedOptions, categories: emptyCategoriesList, localeCompare, translate: translateLocal});
        expect(emptyResult).toStrictEqual(emptySelectedResultList);
    });

    it('getCategoryOptionTree()', () => {
        const categories = {
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
        const result = [
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
        const resultOneLine = [
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

        expect(getCategoryOptionTree(categories)).toStrictEqual(result);
        expect(getCategoryOptionTree(categories, true)).toStrictEqual(resultOneLine);
    });

    it('sortCategories', () => {
        const categoriesIncorrectOrdering = {
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
                pendingAction: 'delete' as PendingAction,
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
        const result = [
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
        const categoriesIncorrectOrdering2 = {
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
        const result2 = [
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
        const categoriesIncorrectOrdering3 = {
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
        const result3 = [
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

        expect(sortCategories(categoriesIncorrectOrdering, localeCompare)).toStrictEqual(result);
        expect(sortCategories(categoriesIncorrectOrdering2, localeCompare)).toStrictEqual(result2);
        expect(sortCategories(categoriesIncorrectOrdering3, localeCompare)).toStrictEqual(result3);
    });
});
