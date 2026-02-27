import type {OnyxCollection} from 'react-native-onyx';
import {policiesSelector, policyCategoriesSelector, policyTagsSelector, reportsSelector} from '@hooks/useFilterFormValues';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';

const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}1`;
const POLICY_KEY_2 = `${ONYXKEYS.COLLECTION.POLICY}2`;
const REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}1`;
const REPORT_KEY_2 = `${ONYXKEYS.COLLECTION.REPORT}2`;
const CATEGORIES_KEY = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}1`;
const CATEGORIES_KEY_2 = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}2`;
const TAGS_KEY = `${ONYXKEYS.COLLECTION.POLICY_TAGS}1`;
const TAGS_KEY_2 = `${ONYXKEYS.COLLECTION.POLICY_TAGS}2`;

describe('useFilterFormValues selectors', () => {
    describe('policiesSelector', () => {
        it('returns null/undefined input as-is', () => {
            expect(policiesSelector(null)).toBeNull();
            expect(policiesSelector(undefined)).toBeUndefined();
        });

        it('extracts only taxRates from each policy', () => {
            const taxRates = {name: 'Tax', defaultValue: '10%', taxes: {}};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {id: '1', name: 'Policy 1', taxRates, employeeList: [{email: 'a@b.com'}]} as unknown as Policy,
                [POLICY_KEY_2]: {id: '2', name: 'Policy 2', taxRates: undefined, employeeList: [{email: 'c@d.com'}]} as unknown as Policy,
            };

            const result = policiesSelector(policies);

            expect(result).toEqual({
                [POLICY_KEY]: {taxRates},
                [POLICY_KEY_2]: {taxRates: undefined},
            });
            expect(result?.[POLICY_KEY]).not.toHaveProperty('employeeList');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('name');
        });

        it('skips null policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {id: '1', taxRates: {}} as unknown as Policy,
                [POLICY_KEY_2]: null,
            };

            const result = policiesSelector(policies);

            expect(result).toEqual({[POLICY_KEY]: {taxRates: {}}});
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });

    describe('reportsSelector', () => {
        it('returns null/undefined input as-is', () => {
            expect(reportsSelector(null)).toBeNull();
            expect(reportsSelector(undefined)).toBeUndefined();
        });

        it('extracts only reportID from each report', () => {
            const reports: OnyxCollection<Report> = {
                [REPORT_KEY]: {reportID: '100', reportName: 'Expense Report', chatType: 'policyExpenseChat'} as unknown as Report,
                [REPORT_KEY_2]: {reportID: '200', reportName: 'Invoice', chatType: 'invoice'} as unknown as Report,
            };

            const result = reportsSelector(reports);

            expect(result).toEqual({
                [REPORT_KEY]: {reportID: '100'},
                [REPORT_KEY_2]: {reportID: '200'},
            });
            expect(result?.[REPORT_KEY]).not.toHaveProperty('reportName');
        });

        it('skips null report entries', () => {
            const reports: OnyxCollection<Report> = {
                [REPORT_KEY]: {reportID: '100'} as Report,
                [REPORT_KEY_2]: null,
            };

            const result = reportsSelector(reports);

            expect(result).toEqual({[REPORT_KEY]: {reportID: '100'}});
        });
    });

    describe('policyCategoriesSelector', () => {
        it('returns null/undefined input as-is', () => {
            expect(policyCategoriesSelector(null)).toBeNull();
            expect(policyCategoriesSelector(undefined)).toBeUndefined();
        });

        it('extracts only category names', () => {
            const categories: OnyxCollection<PolicyCategories> = {
                [CATEGORIES_KEY]: {
                    Food: {name: 'Food', enabled: true, unencodedName: 'Food', areCommentsRequired: false, externalID: '123', origin: 'abc'},
                    Travel: {name: 'Travel', enabled: false, unencodedName: 'Travel', areCommentsRequired: true, externalID: '456', origin: 'def'},
                } as unknown as PolicyCategories,
            };

            const result = policyCategoriesSelector(categories);

            expect(result?.[CATEGORIES_KEY]).toEqual({
                Food: {name: 'Food'},
                Travel: {name: 'Travel'},
            });
        });

        it('skips null collection and category entries', () => {
            const categories: OnyxCollection<PolicyCategories> = {
                [CATEGORIES_KEY]: {
                    Food: {name: 'Food'} as PolicyCategories[string],
                    Empty: null,
                } as unknown as PolicyCategories,
                [CATEGORIES_KEY_2]: null,
            };

            const result = policyCategoriesSelector(categories);

            expect(result).toEqual({[CATEGORIES_KEY]: {Food: {name: 'Food'}}});
        });
    });

    describe('policyTagsSelector', () => {
        it('returns null/undefined input as-is', () => {
            expect(policyTagsSelector(null)).toBeNull();
            expect(policyTagsSelector(undefined)).toBeUndefined();
        });

        it('extracts only tag names', () => {
            const tags: OnyxCollection<PolicyTagLists> = {
                [TAGS_KEY]: {
                    Department: {
                        name: 'Department',
                        required: true,
                        tags: {
                            Engineering: {name: 'Engineering', enabled: true},
                            Marketing: {name: 'Marketing', enabled: false},
                        },
                    },
                } as unknown as PolicyTagLists,
            };

            const result = policyTagsSelector(tags);

            expect(result?.[TAGS_KEY]).toEqual({
                Department: {
                    tags: {
                        Engineering: {name: 'Engineering'},
                        Marketing: {name: 'Marketing'},
                    },
                },
            });
        });

        it('skips null entries at all levels', () => {
            const tags: OnyxCollection<PolicyTagLists> = {
                [TAGS_KEY]: {
                    Department: {
                        tags: {
                            Engineering: {name: 'Engineering'},
                            Empty: null,
                        },
                    },
                    Empty: null,
                } as unknown as PolicyTagLists,
                [TAGS_KEY_2]: null,
            };

            const result = policyTagsSelector(tags);

            expect(result).toEqual({
                [TAGS_KEY]: {
                    Department: {tags: {Engineering: {name: 'Engineering'}}},
                },
            });
        });

        it('handles tag lists with empty tags object', () => {
            const tags: OnyxCollection<PolicyTagLists> = {
                [TAGS_KEY]: {
                    Department: {
                        name: 'Department',
                        tags: {},
                    },
                } as unknown as PolicyTagLists,
            };

            const result = policyTagsSelector(tags);

            expect(result?.[TAGS_KEY]).toEqual({
                Department: {tags: {}},
            });
        });
    });
});
