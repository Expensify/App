import {act, renderHook} from '@testing-library/react-native';

import {typeOptionsPoliciesSelector} from '@components/Search/FilterComponents/TypeSelector';

import {advancedSearchPoliciesSelector} from '@hooks/useAdvancedSearchFilters';
import {exportedToPoliciesSelector} from '@hooks/useExportedToFilterOptions';
import {policiesSelector, policyCategoriesSelector} from '@hooks/useFilterFormValues';
import useOnyx from '@hooks/useOnyx';

import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyReportField} from '@src/types/onyx';

import type {OnyxCollection, OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}1` satisfies OnyxKey;
const POLICY_KEY_2 = `${ONYXKEYS.COLLECTION.POLICY}2` satisfies OnyxKey;
const CATEGORIES_KEY = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}1` satisfies OnyxKey;
const CATEGORIES_KEY_2 = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}2` satisfies OnyxKey;

describe('useFilterFormValues selectors', () => {
    describe('policiesSelector', () => {
        it('returns undefined input as-is', () => {
            expect(policiesSelector(undefined)).toBeUndefined();
        });

        it('extracts only taxRates from each policy', () => {
            const taxRates = {name: 'Tax', defaultValue: '10%', taxes: {}};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: createMock<Policy>({id: '1', name: 'Policy 1', taxRates}),
                [POLICY_KEY_2]: createMock<Policy>({id: '2', name: 'Policy 2', taxRates: undefined}),
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
                [POLICY_KEY]: createMock<Policy>({id: '1', taxRates: {}}),
                [POLICY_KEY_2]: undefined,
            };

            const result = policiesSelector(policies);

            expect(result).toEqual({[POLICY_KEY]: {taxRates: {}}});
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });

    describe('policyCategoriesSelector', () => {
        it('returns undefined input as-is', () => {
            expect(policyCategoriesSelector(undefined)).toBeUndefined();
        });

        it('extracts only category names', () => {
            const categories: OnyxCollection<PolicyCategories> = {
                [CATEGORIES_KEY]: createMock<PolicyCategories>({
                    Food: {name: 'Food', enabled: true, unencodedName: 'Food', areCommentsRequired: false, externalID: '123', origin: 'abc'},
                    Travel: {name: 'Travel', enabled: false, unencodedName: 'Travel', areCommentsRequired: true, externalID: '456', origin: 'def'},
                }),
            };

            const result = policyCategoriesSelector(categories);

            expect(result?.[CATEGORIES_KEY]).toEqual({
                Food: {name: 'Food'},
                Travel: {name: 'Travel'},
            });
        });

        it('skips undefined collection entries', () => {
            const categories: OnyxCollection<PolicyCategories> = {
                [CATEGORIES_KEY]: createMock<PolicyCategories>({
                    Food: {name: 'Food'},
                }),
                [CATEGORIES_KEY_2]: undefined,
            };

            const result = policyCategoriesSelector(categories);

            expect(result).toEqual({[CATEGORIES_KEY]: {Food: {name: 'Food'}}});
            expect(result).not.toHaveProperty(CATEGORIES_KEY_2);
        });
    });

    describe('exportedToPoliciesSelector', () => {
        it('returns undefined input as-is', () => {
            expect(exportedToPoliciesSelector(undefined)).toBeUndefined();
        });

        it('extracts only the fields needed for exported-to options', () => {
            // Given a policy with currency, role and card settings used by exported-to options
            const connections = {quickbooksOnline: {config: {}, lastSync: {isConnected: true}}};
            const exportLayouts = {template1: {name: 'Template 1'}};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: createMock<Policy>({
                    id: '1',
                    name: 'Policy 1',
                    connections,
                    outputCurrency: 'USD',
                    role: 'admin',
                    areCompanyCardsEnabled: true,
                    areExpensifyCardsEnabled: false,
                    exportLayouts,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    employeeList: {'a@b.com': {email: 'a@b.com', role: 'user'}},
                    taxRates: {name: 'Tax', taxes: {}},
                    customUnits: {unit1: {name: 'Miles'}},
                }),
            };

            // When the production selector reduces the policy subscription
            const result = exportedToPoliciesSelector(policies);

            // Then every consumed field survives while unrelated metadata is omitted
            expect(result?.[POLICY_KEY]).toEqual({
                id: '1',
                name: 'Policy 1',
                connections,
                outputCurrency: 'USD',
                role: 'admin',
                areCompanyCardsEnabled: true,
                areExpensifyCardsEnabled: false,
            });
            expect(result?.[POLICY_KEY]).not.toHaveProperty('exportLayouts');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('employeeList');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('taxRates');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('customUnits');
        });

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: createMock<Policy>({id: '1', name: 'P1', connections: undefined, exportLayouts: undefined}),
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
                [POLICY_KEY]: createMock<Policy>({
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
                }),
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
                [POLICY_KEY]: createMock<Policy>({id: '1', type: 'team'}),
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
            // Given an archived policy whose archive date affects advanced search filter checks
            const employeeList =
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {'a@b.com': {email: 'a@b.com', role: 'admin'}};
            const taxRates = {name: 'Tax', defaultValue: '10%', taxes: {tax1: {name: 'VAT', value: '20%'}}};
            const tax = {trackingEnabled: true};
            const fieldList = {field1: createMock<PolicyReportField>({name: 'Project', type: 'text'})};
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: createMock<Policy>({
                    id: '1',
                    name: 'Policy 1',
                    type: 'team',
                    role: 'admin',
                    employeeList,
                    owner: 'a@b.com',
                    avatarURL: 'https://example.com/avatar.png',
                    archivedDate: '2024-01-01 00:00:00',
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
                }),
            };

            // When the production selector projects the fields needed by advanced search
            const result = advancedSearchPoliciesSelector(policies);

            // Then archive state and every existing search field survive without heavy metadata
            expect(result?.[POLICY_KEY]).toEqual({
                id: '1',
                name: 'Policy 1',
                type: 'team',
                role: 'admin',
                employeeList,
                owner: 'a@b.com',
                avatarURL: 'https://example.com/avatar.png',
                archivedDate: '2024-01-01 00:00:00',
                isJoinRequestPending: false,
                pendingAction: undefined,
                errors: {},
                taxRates,
                tax,
                areTagsEnabled: true,
                areInvoicesEnabled: false,
                isAttendeeTrackingEnabled: false,
                fieldList,
            });
            expect(result?.[POLICY_KEY]).not.toHaveProperty('areCategoriesEnabled');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('connections');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('customUnits');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('rules');
            expect(result?.[POLICY_KEY]).not.toHaveProperty('exportLayouts');
        });

        it('skips undefined policy entries', () => {
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: createMock<Policy>({id: '1', name: 'P1', type: 'team'}),
                [POLICY_KEY_2]: undefined,
            };

            const result = advancedSearchPoliciesSelector(policies);

            expect(result).toHaveProperty(POLICY_KEY);
            expect(result).not.toHaveProperty(POLICY_KEY_2);
        });
    });
    describe('projection consumers', () => {
        it('passes exact tax and category projections through the real filter builder', () => {
            // Given two policies with overlapping tax keys and disabled categories whose names remain searchable
            const policies: OnyxCollection<Policy> = {
                [POLICY_KEY]: createMock<Policy>({id: '1', name: 'One', taxRates: {taxes: {vat: {name: 'VAT', value: '20%'}, local: {name: 'Local', value: '5%'}}}}),
                [POLICY_KEY_2]: createMock<Policy>({id: '2', name: 'Two', taxRates: {taxes: {vat: {name: 'VAT', value: '10%'}, other: {name: 'VAT', value: '15%'}}}}),
                [`${ONYXKEYS.COLLECTION.POLICY}3`]: undefined,
            };
            const categories: OnyxCollection<PolicyCategories> = {
                [CATEGORIES_KEY]: {foodKey: {name: 'Food', enabled: false}},
                [CATEGORIES_KEY_2]: {travelKey: {name: 'Travel', enabled: true}},
                [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}3`]: undefined,
            };
            const projectedPolicies = policiesSelector(policies);
            const projectedCategories = policyCategoriesSelector(categories);
            const taxes = getAllTaxRates(projectedPolicies);
            // When each scoped query is restored from the reduced subscriptions
            const positive = buildSearchQueryJSON('category:Food,Travel tax-rate:vat,other,missing policyID:1');
            const negative = buildSearchQueryJSON('category:Food,Travel -policyID:1');
            expect(positive).toBeDefined();
            expect(negative).toBeDefined();
            if (!positive || !negative) {
                throw new Error('The production parser did not build the search fixtures');
            }
            const form = buildFilterFormValuesFromQuery(positive, projectedCategories, {}, undefined, undefined, undefined, taxes);
            const negatedForm = buildFilterFormValuesFromQuery(negative, projectedCategories, {}, undefined, undefined, undefined, taxes);
            // Then key/name projection, deduplication and policy scoping survive without invented metadata
            expect(projectedPolicies?.[POLICY_KEY]).toEqual({taxRates: policies[POLICY_KEY]?.taxRates});
            expect(projectedCategories).toEqual({[CATEGORIES_KEY]: {foodKey: {name: 'Food'}}, [CATEGORIES_KEY_2]: {travelKey: {name: 'Travel'}}});
            expect(taxes).toEqual({VAT: ['vat', 'other'], Local: ['local']});
            expect(form.category).toEqual(['Food']);
            expect(form.taxRate).toEqual(['vat', 'other']);
            expect(negatedForm.category).toEqual(['Travel']);
            expect(policiesSelector({})).toEqual({});
            expect(policyCategoriesSelector({})).toEqual({});
            expect(getAllTaxRates(undefined)).toEqual({});
        });

        it('does not notify projected subscriptions for unrelated metadata but does for consumed values', async () => {
            // Given real Onyx subscriptions to the two production selectors
            Onyx.init({keys: ONYXKEYS});
            await act(async () => {
                await Onyx.clear();
                await Onyx.set(POLICY_KEY, createMock<Policy>({id: '1', name: 'One', taxRates: {taxes: {vat: {name: 'VAT', value: '20%'}}}}));
                await Onyx.set(CATEGORIES_KEY, {foodKey: {name: 'Food', enabled: true}});
            });
            let policyRenders = 0;
            let categoryRenders = 0;
            const policyHook = renderHook(() => {
                policyRenders += 1;
                return useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector})[0];
            });
            const categoryHook = renderHook(() => {
                categoryRenders += 1;
                return useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {selector: policyCategoriesSelector})[0];
            });
            await waitForBatchedUpdatesWithAct();
            const policiesBefore = policyHook.result.current;
            const categoriesBefore = categoryHook.result.current;
            const policyRendersBefore = policyRenders;
            const categoryRendersBefore = categoryRenders;
            // When only omitted policy/category metadata changes
            await act(async () => {
                await Onyx.merge(POLICY_KEY, {name: 'Renamed'});
                await Onyx.merge(CATEGORIES_KEY, {foodKey: {enabled: false}});
            });
            await waitForBatchedUpdatesWithAct();
            // Then the actual subscriptions retain their selected values without rendering
            expect(policyHook.result.current).toBe(policiesBefore);
            expect(categoryHook.result.current).toBe(categoriesBefore);
            expect(policyRenders).toBe(policyRendersBefore);
            expect(categoryRenders).toBe(categoryRendersBefore);
            await act(async () => {
                await Onyx.merge(POLICY_KEY, {taxRates: {taxes: {vat: {name: 'New VAT'}}}});
                await Onyx.merge(CATEGORIES_KEY, {foodKey: {name: 'Dining'}});
            });
            await waitForBatchedUpdatesWithAct();
            expect(getAllTaxRates(policyHook.result.current)).toEqual(Object.fromEntries([['New VAT', ['vat']]]));
            expect(categoryHook.result.current?.[CATEGORIES_KEY]).toEqual({foodKey: {name: 'Dining'}});
            expect(policyRenders).toBeGreaterThan(policyRendersBefore);
            expect(categoryRenders).toBeGreaterThan(categoryRendersBefore);
            policyHook.unmount();
            categoryHook.unmount();
            await act(async () => Onyx.clear());
        });
    });
});
