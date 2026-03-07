import type {OnyxCollection} from 'react-native-onyx';
import {typeOptionsPoliciesSelector} from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import {advancedSearchPoliciesSelector} from '@hooks/useAdvancedSearchFilters';
import {exportedToPoliciesSelector} from '@hooks/useExportedToFilterOptions';
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
        it('returns undefined input as-is', () => {
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

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {id: '1', taxRates: {}} as unknown as Policy,
                [POLICY_KEY_2]: undefined,
            };

            const result = policiesSelector(policies);

            expect(result).toEqual({[POLICY_KEY]: {taxRates: {}}});
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });

    describe('reportsSelector', () => {
        it('returns undefined input as-is', () => {
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

        it('skips undefined report entries', () => {
            const reports: OnyxCollection<Report> = {
                [REPORT_KEY]: {reportID: '100'} as Report,
                [REPORT_KEY_2]: undefined,
            };

            const result = reportsSelector(reports);

            expect(result).toEqual({[REPORT_KEY]: {reportID: '100'}});
        });
    });

    describe('policyCategoriesSelector', () => {
        it('returns undefined input as-is', () => {
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

        it('skips undefined collection entries', () => {
            const categories: OnyxCollection<PolicyCategories> = {
                [CATEGORIES_KEY]: {
                    Food: {name: 'Food'} as PolicyCategories[string],
                } as unknown as PolicyCategories,
                [CATEGORIES_KEY_2]: undefined,
            };

            const result = policyCategoriesSelector(categories);

            expect(result).toEqual({[CATEGORIES_KEY]: {Food: {name: 'Food'}}});
            expect(result).not.toHaveProperty(CATEGORIES_KEY_2);
        });
    });

    describe('policyTagsSelector', () => {
        it('returns undefined input as-is', () => {
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

        it('skips undefined collection entries', () => {
            const tags: OnyxCollection<PolicyTagLists> = {
                [TAGS_KEY]: {
                    Department: {
                        tags: {
                            Engineering: {name: 'Engineering'},
                        },
                    },
                } as unknown as PolicyTagLists,
                [TAGS_KEY_2]: undefined,
            };

            const result = policyTagsSelector(tags);

            expect(result).toEqual({
                [TAGS_KEY]: {
                    Department: {tags: {Engineering: {name: 'Engineering'}}},
                },
            });
            expect(result).not.toHaveProperty(TAGS_KEY_2);
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

    describe('exportedToPoliciesSelector', () => {
        it('returns undefined input as-is', () => {
            expect(exportedToPoliciesSelector(undefined)).toBeUndefined();
        });

        it('extracts only id, name, connections, and exportLayouts', () => {
            const connections = {quickbooksOnline: {config: {}, lastSync: {isConnected: true}}};
            const exportLayouts = {template1: {name: 'Template 1'}};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {
                    id: '1',
                    name: 'Policy 1',
                    connections,
                    exportLayouts,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    employeeList: {'a@b.com': {email: 'a@b.com', role: 'user'}},
                    taxRates: {name: 'Tax', taxes: {}},
                    customUnits: {unit1: {name: 'Miles'}},
                } as unknown as Policy,
            };

            const result = exportedToPoliciesSelector(policies);

            expect(result?.[POLICY_KEY]).toEqual({id: '1', name: 'Policy 1', connections, exportLayouts});
            expect(result?.[POLICY_KEY]).not.toHaveProperty('employeeList');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('taxRates');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('customUnits');
        });

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {id: '1', name: 'P1', connections: undefined, exportLayouts: undefined} as unknown as Policy,
                [POLICY_KEY_2]: undefined,
            };

            const result = exportedToPoliciesSelector(policies);

            expect(result).toHaveProperty(POLICY_KEY);
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });

    describe('typeOptionsPoliciesSelector', () => {
        it('returns undefined input as-is', () => {
            expect(typeOptionsPoliciesSelector(undefined)).toBeUndefined();
        });

        it('extracts only fields needed for getTypeOptions', () => {
            const employeeList =
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {'a@b.com': {email: 'a@b.com', role: 'admin'}};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {
                    id: '1',
                    type: 'team',
                    role: 'admin',
                    employeeList,
                    pendingAction: undefined,
                    errors: {},
                    areInvoicesEnabled: true,
                    isJoinRequestPending: false,
                    owner: 'a@b.com',
                    name: 'Policy 1',
                    connections: {quickbooksOnline: {}},
                    taxRates: {name: 'Tax', taxes: {}},
                    customUnits: {unit1: {name: 'Miles'}},
                    fieldList: {field1: {name: 'Field 1'}},
                } as unknown as Policy,
            };

            const result = typeOptionsPoliciesSelector(policies);

            expect(result?.[POLICY_KEY]).toEqual({
                id: '1',
                name: 'Policy 1',
                type: 'team',
                role: 'admin',
                employeeList,
                pendingAction: undefined,
                errors: {},
                areInvoicesEnabled: true,
                isJoinRequestPending: false,
                owner: 'a@b.com',
            });
            expect(result?.[POLICY_KEY]).not.toHaveProperty('connections');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('taxRates');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('customUnits');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('fieldList');
        });

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {id: '1', type: 'team'} as unknown as Policy,
                [POLICY_KEY_2]: undefined,
            };

            const result = typeOptionsPoliciesSelector(policies);

            expect(result).toHaveProperty(POLICY_KEY);
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });

    describe('advancedSearchPoliciesSelector', () => {
        it('returns undefined input as-is', () => {
            expect(advancedSearchPoliciesSelector(undefined)).toBeUndefined();
        });

        it('extracts all fields needed for advanced search filter checks', () => {
            const employeeList =
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {'a@b.com': {email: 'a@b.com', role: 'admin'}};
            const taxRates = {name: 'Tax', defaultValue: '10%', taxes: {tax1: {name: 'VAT', value: '20%'}}};
            const tax = {trackingEnabled: true};
            const fieldList = {field1: {name: 'Project', type: 'text'}};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {
                    id: '1',
                    name: 'Policy 1',
                    type: 'team',
                    role: 'admin',
                    employeeList,
                    owner: 'a@b.com',
                    avatarURL: 'https://example.com/avatar.png',
                    isJoinRequestPending: false,
                    pendingAction: undefined,
                    errors: {},
                    taxRates,
                    tax,
                    areCategoriesEnabled: true,
                    areTagsEnabled: true,
                    areInvoicesEnabled: false,
                    isAttendeeTrackingEnabled: false,
                    fieldList,
                    connections: {quickbooksOnline: {config: {}, lastSync: {}}},
                    customUnits: {unit1: {name: 'Miles'}},
                    rules: {approvalRules: []},
                    exportLayouts: {template1: {name: 'T1'}},
                } as unknown as Policy,
            };

            const result = advancedSearchPoliciesSelector(policies);

            expect(result?.[POLICY_KEY]).toEqual({
                id: '1',
                name: 'Policy 1',
                type: 'team',
                role: 'admin',
                employeeList,
                owner: 'a@b.com',
                avatarURL: 'https://example.com/avatar.png',
                isJoinRequestPending: false,
                pendingAction: undefined,
                errors: {},
                taxRates,
                tax,
                areCategoriesEnabled: true,
                areTagsEnabled: true,
                areInvoicesEnabled: false,
                isAttendeeTrackingEnabled: false,
                fieldList,
            });
            expect(result?.[POLICY_KEY]).not.toHaveProperty('connections');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('customUnits');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('rules');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('exportLayouts');
        });

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: {id: '1', name: 'P1', type: 'team'} as unknown as Policy,
                [POLICY_KEY_2]: undefined,
            };

            const result = advancedSearchPoliciesSelector(policies);

            expect(result).toHaveProperty(POLICY_KEY);
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });
});
