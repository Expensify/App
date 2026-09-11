import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import type {SelectedTagOption, TagOption} from '@libs/TagsOptionsListUtils';
import {getEnabledTags, getTagListSections, getTagVisibility, getUpdatedTransactionTag, sortTags} from '@libs/TagsOptionsListUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {PolicyTagLists, PolicyTags} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('TagsOptionsListUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });
    it('getTagListSections()', () => {
        const search = 'ing';
        const emptySearch = '';
        const wrongSearch = 'bla bla';
        const employeeSearch = 'Employee Office';
        const recentlyUsedTags = ['Engineering', 'HR'];

        const selectedOptions: SelectedTagOption[] = [
            {
                name: 'Medical',
                enabled: true,
                accountID: undefined,
            },
        ];
        const smallTagsList: Record<string, SelectedTagOption> = {
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
        const smallResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 2,
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
        const smallSearchResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 1,
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
        const employeeSearchResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 1,
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
        const smallWrongSearchResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 1,
                data: [],
            },
        ];
        const largeTagsList: Record<string, SelectedTagOption> = {
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
            Communications: {
                enabled: true,
                name: 'Communications',
                accountID: undefined,
            },
            Legal: {
                enabled: true,
                name: 'Legal',
                accountID: undefined,
            },
            Marketing: {
                enabled: true,
                name: 'Marketing',
                accountID: undefined,
            },
            Operations: {
                enabled: true,
                name: 'Operations',
                accountID: undefined,
            },
        };
        const largeResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 3,
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
                sectionIndex: 4,
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
                sectionIndex: 5,
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
                        text: 'Communications',
                        keyForList: 'Communications',
                        searchText: 'Communications',
                        tooltipText: 'Communications',
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
                        text: 'Legal',
                        keyForList: 'Legal',
                        searchText: 'Legal',
                        tooltipText: 'Legal',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Marketing',
                        keyForList: 'Marketing',
                        searchText: 'Marketing',
                        tooltipText: 'Marketing',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Operations',
                        keyForList: 'Operations',
                        searchText: 'Operations',
                        tooltipText: 'Operations',
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
        const largeSearchResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 1,
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
                    {
                        text: 'Marketing',
                        keyForList: 'Marketing',
                        searchText: 'Marketing',
                        tooltipText: 'Marketing',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                ],
            },
        ];
        const largeWrongSearchResultList: Array<Section<TagOption>> = [
            {
                title: '',
                sectionIndex: 1,
                data: [],
            },
        ];

        const smallResult = getTagListSections({searchValue: emptySearch, tags: smallTagsList, localeCompare, translate: translateLocal});
        expect(smallResult).toStrictEqual(smallResultList);

        const smallSearchResult = getTagListSections({searchValue: search, tags: smallTagsList, localeCompare, translate: translateLocal});
        expect(smallSearchResult).toStrictEqual(smallSearchResultList);

        const employeeSearchResult = getTagListSections({searchValue: employeeSearch, tags: smallTagsList, localeCompare, translate: translateLocal});
        expect(employeeSearchResult).toStrictEqual(employeeSearchResultList);

        const smallWrongSearchResult = getTagListSections({searchValue: wrongSearch, tags: smallTagsList, localeCompare, translate: translateLocal});
        expect(smallWrongSearchResult).toStrictEqual(smallWrongSearchResultList);

        const largeResult = getTagListSections({searchValue: emptySearch, selectedOptions, tags: largeTagsList, recentlyUsedTags, localeCompare, translate: translateLocal});
        expect(largeResult).toStrictEqual(largeResultList);

        const largeSearchResult = getTagListSections({searchValue: search, selectedOptions, tags: largeTagsList, recentlyUsedTags, localeCompare, translate: translateLocal});
        expect(largeSearchResult).toStrictEqual(largeSearchResultList);

        const largeWrongSearchResult = getTagListSections({
            searchValue: wrongSearch,
            selectedOptions,
            tags: largeTagsList,
            recentlyUsedTags,
            localeCompare,
            translate: translateLocal,
        });
        expect(largeWrongSearchResult).toStrictEqual(largeWrongSearchResultList);
    });

    it('sortTags', () => {
        const createTagObjects = (names: string[]) => names.map((name) => ({name, enabled: true}));

        const unorderedTagNames = ['10bc', 'b', '0a', '1', '中国', 'b10', '!', '2', '0', '@', 'a1', 'a', '3', 'b1', '日本', '$', '20', '20a', '#', 'a20', 'c', '10'];
        const expectedOrderNames = ['!', '@', '#', '$', '0', '0a', '1', '2', '3', '10', '10bc', '20', '20a', 'a', 'a1', 'a20', 'b', 'b1', 'b10', 'c', '中国', '日本'];
        const unorderedTags = createTagObjects(unorderedTagNames);
        const expectedOrder = createTagObjects(expectedOrderNames);
        expect(sortTags(unorderedTags, localeCompare)).toStrictEqual(expectedOrder);

        const unorderedTagNames2 = ['0', 'a1', '1', 'b1', '3', '10', 'b10', 'a', '2', 'c', '20', 'a20', 'b'];
        const expectedOrderNames2 = ['0', '1', '2', '3', '10', '20', 'a', 'a1', 'a20', 'b', 'b1', 'b10', 'c'];
        const unorderedTags2 = createTagObjects(unorderedTagNames2);
        const expectedOrder2 = createTagObjects(expectedOrderNames2);
        expect(sortTags(unorderedTags2, localeCompare)).toStrictEqual(expectedOrder2);

        const unorderedTagNames3 = [
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
        const expectedOrderNames3 = [
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
        const unorderedTags3 = createTagObjects(unorderedTagNames3);
        const expectedOrder3 = createTagObjects(expectedOrderNames3);
        expect(sortTags(unorderedTags3, localeCompare)).toStrictEqual(expectedOrder3);
    });

    it('sortTags by object works the same', () => {
        const tagsObject = {
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

        const sorted = sortTags(tagsObject.tags, localeCompare);
        expect(Array.isArray(sorted)).toBe(true);
        // Expect to be sorted alphabetically
        expect(sorted.at(0)?.name).toBe('Car');
        expect(sorted.at(1)?.name).toBe('DisabledTag');
        expect(sorted.at(2)?.name).toBe('OfficeSupplies');
    });

    describe('getTagVisibility', () => {
        const mockPolicy = createRandomPolicy(1, 'corporate', 'Test Policy');
        const mockTransaction = createRandomTransaction(1);
        const mockPolicyTags: PolicyTagLists = {
            tagList1: {
                name: 'Category',
                required: true,
                tags: {
                    tag1: {name: 'Tag1', enabled: true},
                    tag2: {name: 'Tag2', enabled: false},
                },
                orderWeight: 0,
            },
            tagList2: {
                name: 'Subcategory',
                required: false,
                tags: {
                    tag3: {name: 'Tag3', enabled: true},
                    tag4: {name: 'Tag4', enabled: true},
                },
                orderWeight: 1,
            },
        };

        it('should hide all tags when shouldShowTags is false', () => {
            const result = getTagVisibility({
                shouldShowTags: false,
                policy: mockPolicy,
                policyTags: mockPolicyTags,
                transaction: mockTransaction,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: false},
                {isTagRequired: false, shouldShow: false},
            ]);
        });

        it('should show all tags when shouldShowTags is true and no dependent/multilevel tags', () => {
            const result = getTagVisibility({
                shouldShowTags: true,
                policy: mockPolicy,
                policyTags: mockPolicyTags,
                transaction: mockTransaction,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: false, shouldShow: true},
            ]);
        });

        it('should show tags when multilevel tags are enabled and have enabled options', () => {
            const policyTagsWithEnabledOptions: PolicyTagLists = {
                tagList1: {
                    name: 'Category',
                    required: true,
                    tags: {
                        tag1: {name: 'Tag1', enabled: true},
                        tag2: {name: 'Tag2', enabled: true},
                    },
                    orderWeight: 0,
                },
                tagList2: {
                    name: 'Subcategory',
                    required: false,
                    tags: {
                        tag3: {name: 'Tag3', enabled: true},
                        tag4: {name: 'Tag4', enabled: true},
                    },
                    orderWeight: 1,
                },
            };

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: mockPolicy,
                policyTags: policyTagsWithEnabledOptions,
                transaction: mockTransaction,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: false, shouldShow: true},
            ]);
        });

        it('should hide tags when multilevel tags are enabled but have no enabled options', () => {
            const policyTagsWithDisabledOptions: PolicyTagLists = {
                tagList1: {
                    name: 'Category',
                    required: true,
                    tags: {
                        tag1: {name: 'Tag1', enabled: false},
                        tag2: {name: 'Tag2', enabled: false},
                    },
                    orderWeight: 0,
                },
                tagList2: {
                    name: 'Subcategory',
                    required: false,
                    tags: {
                        tag3: {name: 'Tag3', enabled: false},
                        tag4: {name: 'Tag4', enabled: false},
                    },
                    orderWeight: 1,
                },
            };

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: mockPolicy,
                policyTags: policyTagsWithDisabledOptions,
                transaction: mockTransaction,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: false},
                {isTagRequired: false, shouldShow: false},
            ]);
        });

        it('should handle empty policyTags', () => {
            const result = getTagVisibility({
                shouldShowTags: true,
                policy: mockPolicy,
                policyTags: undefined,
                transaction: mockTransaction,
            });

            expect(result).toEqual([]);
        });

        it('should handle undefined policy', () => {
            const result = getTagVisibility({
                shouldShowTags: true,
                policy: undefined,
                policyTags: mockPolicyTags,
                transaction: mockTransaction,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: false, shouldShow: true},
            ]);
        });

        it('should handle undefined transaction', () => {
            const result = getTagVisibility({
                shouldShowTags: true,
                policy: mockPolicy,
                policyTags: mockPolicyTags,
                transaction: undefined,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: false, shouldShow: true},
            ]);
        });

        it('should fall back to policy.requiresTag when tag list required is undefined', () => {
            const policyWithRequiresTag = {...mockPolicy, requiresTag: true};
            // Intentionally omitting 'required' to simulate backend sync stripping the field
            const policyTagsWithoutRequired = {
                tagList1: {
                    name: 'Department',
                    tags: {
                        tag1: {name: 'Engineering', enabled: true},
                        tag2: {name: 'Sales', enabled: true},
                    },
                    orderWeight: 0,
                },
            } satisfies Record<string, Omit<NonNullable<PolicyTagLists[string]>, 'required'>>;

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: policyWithRequiresTag,
                // @ts-expect-error -- backend sync can omit `required`; this scenario verifies the policy fallback.
                policyTags: policyTagsWithoutRequired,
                transaction: mockTransaction,
            });

            expect(result).toEqual([{isTagRequired: true, shouldShow: true}]);
        });

        it('should not mark tags as required when policy.requiresTag is false and tag list required is undefined', () => {
            const policyWithoutRequiresTag = {...mockPolicy, requiresTag: false};
            // Intentionally omitting 'required' to simulate backend sync stripping the field
            const policyTagsWithoutRequired = {
                tagList1: {
                    name: 'Department',
                    tags: {
                        tag1: {name: 'Engineering', enabled: true},
                    },
                    orderWeight: 0,
                },
            } satisfies Record<string, Omit<NonNullable<PolicyTagLists[string]>, 'required'>>;

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: policyWithoutRequiresTag,
                // @ts-expect-error -- backend sync can omit `required`; this scenario verifies the policy fallback.
                policyTags: policyTagsWithoutRequired,
                transaction: mockTransaction,
            });

            expect(result).toEqual([{isTagRequired: false, shouldShow: true}]);
        });

        it('should mark tags as required when policy.requiresTag is true even if tag list required is false', () => {
            const policyWithRequiresTag = {...mockPolicy, requiresTag: true};
            const policyTagsExplicitFalse: PolicyTagLists = {
                tagList1: {
                    name: 'Department',
                    required: false,
                    tags: {
                        tag1: {name: 'Engineering', enabled: true},
                    },
                    orderWeight: 0,
                },
            };

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: policyWithRequiresTag,
                policyTags: policyTagsExplicitFalse,
                transaction: mockTransaction,
            });

            expect(result).toEqual([{isTagRequired: true, shouldShow: true}]);
        });

        it('should only mark the per-level required tags for independent multi-level tags even when policy.requiresTag is true', () => {
            const policyWithRequiresTag = {...mockPolicy, requiresTag: true};
            const multiLevelTags: PolicyTagLists = {
                tagList1: {
                    name: 'Level A',
                    required: true,
                    tags: {tagA: {name: 'A', enabled: true}},
                    orderWeight: 0,
                },
                tagList2: {
                    name: 'Level B',
                    required: false,
                    tags: {tagB: {name: 'B', enabled: true}},
                    orderWeight: 1,
                },
                tagList3: {
                    name: 'Level C',
                    required: false,
                    tags: {tagC: {name: 'C', enabled: true}},
                    orderWeight: 2,
                },
            };

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: policyWithRequiresTag,
                policyTags: multiLevelTags,
                transaction: mockTransaction,
            });

            expect(result).toEqual([
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: false, shouldShow: true},
                {isTagRequired: false, shouldShow: true},
            ]);
        });

        it('should keep marking every level required for dependent multi-level tags when policy.requiresTag is true even if a level required is false', () => {
            const policyWithRequiresTag = {...mockPolicy, requiresTag: true, hasMultipleTagLists: true};
            const dependentMultiLevelTags: PolicyTagLists = {
                tagList1: {
                    name: 'Level A',
                    required: false,
                    tags: {tagA: {name: 'A', enabled: true, rules: {parentTagsFilter: ''}}},
                    orderWeight: 0,
                },
                tagList2: {
                    name: 'Level B',
                    required: false,
                    tags: {tagB: {name: 'B', enabled: true, rules: {parentTagsFilter: 'A'}}},
                    orderWeight: 1,
                },
                tagList3: {
                    name: 'Level C',
                    required: false,
                    tags: {tagC: {name: 'C', enabled: true, rules: {parentTagsFilter: 'A:B'}}},
                    orderWeight: 2,
                },
            };

            const result = getTagVisibility({
                shouldShowTags: true,
                policy: policyWithRequiresTag,
                policyTags: dependentMultiLevelTags,
                transaction: {...mockTransaction, tag: 'A:B:C'},
            });

            // Dependent tags block submission on every level once requiresTag is on, so the badge must
            // stay "Required" on every level regardless of each level's own `required` flag.
            expect(result).toEqual([
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: true, shouldShow: true},
                {isTagRequired: true, shouldShow: true},
            ]);
        });
    });

    describe('getEnabledTags', () => {
        it('returns only enabled tags when no parent filter present', () => {
            const tags: PolicyTags = {
                a: {name: 'A', enabled: true},
                b: {name: 'B', enabled: false},
                c: {name: 'C', enabled: true},
            };

            const result = getEnabledTags(tags, 'A', 1);

            expect(result.map((t) => t.name).sort()).toEqual(['A', 'C']);
        });

        it('filters tags by parentTagsFilter regex', () => {
            const tags: PolicyTags = {
                north: {name: 'North', enabled: true, parentTagsFilter: '^California$'},
                south: {name: 'South', enabled: true, parentTagsFilter: '^Texas$'},
                general: {name: 'General', enabled: true},
                disabled: {name: 'Disabled', enabled: false},
            };

            const result = getEnabledTags(tags, 'California:North', 1);
            const names = result.map((t) => t.name);

            expect(names).toEqual(expect.arrayContaining(['North', 'General']));
            expect(names).not.toContain('South');
            expect(names).not.toContain('Disabled');
        });

        it('does not include tags whose filter does not match parent', () => {
            const tags: PolicyTags = {
                withFilter: {name: 'WithFilter', enabled: true, parentTagsFilter: '^California$'},
            };

            const result = getEnabledTags(tags, 'Texas:City', 1);

            expect(result).toEqual([]);
        });
    });

    describe('getTagListSections GL code display', () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- PolicyTag GL Code field uses backend naming
        const tagsWithGLCode: Record<string, {name: string; enabled: boolean; 'GL Code'?: string}> = {
            ProjectA: {name: 'Project A', enabled: true, 'GL Code': 'SP4100'}, // eslint-disable-line @typescript-eslint/naming-convention
            ProjectB: {name: 'Project B', enabled: true},
        };

        it('sets alternateText when shouldShowGLCode is true and tag has a GL code', () => {
            const result = getTagListSections({
                searchValue: '',
                tags: tagsWithGLCode,
                localeCompare,
                translate: translateLocal,
                shouldShowGLCode: true,
            });

            const projectA = result.at(0)?.data.find((option) => option.keyForList === 'Project A');
            const projectB = result.at(0)?.data.find((option) => option.keyForList === 'Project B');

            expect(projectA?.alternateText).toBe('SP4100');
            expect(projectA?.text).toBe('Project A');
            expect(projectA?.searchText).toBe('Project A');
            expect(projectB?.alternateText).toBeUndefined();
        });

        it('does not set alternateText when shouldShowGLCode is false', () => {
            const result = getTagListSections({
                searchValue: '',
                tags: tagsWithGLCode,
                localeCompare,
                translate: translateLocal,
                shouldShowGLCode: false,
            });

            const projectA = result.at(0)?.data.find((option) => option.keyForList === 'Project A');
            expect(projectA?.alternateText).toBeUndefined();
        });

        it('finds tags by GL code when shouldShowGLCode is true', () => {
            const result = getTagListSections({
                searchValue: 'SP4100',
                tags: tagsWithGLCode,
                localeCompare,
                translate: translateLocal,
                shouldShowGLCode: true,
            });

            expect(result.at(0)?.data).toHaveLength(1);
            expect(result.at(0)?.data.at(0)?.keyForList).toBe('Project A');
        });

        it('does not find tags by GL code when shouldShowGLCode is false', () => {
            const result = getTagListSections({
                searchValue: 'SP4100',
                tags: tagsWithGLCode,
                localeCompare,
                translate: translateLocal,
                shouldShowGLCode: false,
            });

            expect(result.at(0)?.data).toHaveLength(0);
        });
    });

    describe('getUpdatedTransactionTag', () => {
        const dependentPolicyTags: PolicyTagLists = {
            company: {
                name: 'Company',
                required: true,
                orderWeight: 0,
                tags: {
                    acmeCorp: {name: 'Acme Corp', enabled: true},
                    otherCo: {name: 'Other Co', enabled: true},
                },
            },
            costCenter: {
                name: 'Cost Center',
                required: true,
                orderWeight: 1,
                tags: {
                    admin: {name: 'Admin', enabled: true, rules: {parentTagsFilter: '^Acme Corp$'}},
                    sales: {name: 'Sales', enabled: true, rules: {parentTagsFilter: '^Acme Corp$'}},
                    support: {name: 'Support', enabled: true, rules: {parentTagsFilter: '^Other Co$'}},
                },
            },
            glCode: {
                name: 'GL Code',
                required: true,
                orderWeight: 2,
                tags: {
                    gl100: {name: 'GL-100', enabled: true, rules: {parentTagsFilter: '^Acme Corp:Admin$'}},
                    gl200: {name: 'GL-200', enabled: true, rules: {parentTagsFilter: '^Acme Corp:Sales$'}},
                    gl900: {name: 'GL-900', enabled: true, rules: {parentTagsFilter: '^Other Co:Support$'}},
                },
            },
        };

        const dependentTagParams = {
            hasDependentTags: true,
            hasMultipleTagLists: true,
            policyTags: dependentPolicyTags,
        };

        it('auto-selects the next tag when the parent selection leaves exactly one enabled option', () => {
            const result = getUpdatedTransactionTag({
                ...dependentTagParams,
                transactionTag: 'Acme Corp',
                selectedTagName: 'Admin',
                currentTag: '',
                tagListIndex: 1,
            });

            expect(result).toBe('Acme Corp:Admin:GL-100');
        });

        it('does not auto-select when multiple child tags match the parent', () => {
            const result = getUpdatedTransactionTag({
                ...dependentTagParams,
                transactionTag: '',
                selectedTagName: 'Acme Corp',
                currentTag: '',
                tagListIndex: 0,
            });

            expect(result).toBe('Acme Corp');
        });

        it('auto-selects chained unique children when each remaining level has one option', () => {
            const result = getUpdatedTransactionTag({
                ...dependentTagParams,
                transactionTag: '',
                selectedTagName: 'Other Co',
                currentTag: '',
                tagListIndex: 0,
            });

            expect(result).toBe('Other Co:Support:GL-900');
        });

        it('clears this level and children when the selected tag is deselected', () => {
            const result = getUpdatedTransactionTag({
                ...dependentTagParams,
                transactionTag: 'Acme Corp:Admin:GL-100',
                selectedTagName: 'Admin',
                currentTag: 'Admin',
                tagListIndex: 1,
            });

            expect(result).toBe('Acme Corp');
        });
    });
});
