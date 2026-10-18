import {typeOptionsPoliciesSelector} from '@components/Search/FilterComponents/TypeSelector';

import {advancedSearchPoliciesSelector} from '@hooks/useAdvancedSearchFilters';
import {exportedToPoliciesSelector} from '@hooks/useExportedToFilterOptions';
import {policiesSelector, policyCategoriesSelector} from '@hooks/useFilterFormValues';

import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report} from '@src/types/onyx';

import {measureFunction} from 'reassure';

import {buildSearchQueryJSONOrThrow, CATEGORY_COUNT, POLICY_COUNT, REPORT_COUNT} from '../perf-test/FilterFormValuesPerfTestUtils';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

describe('useFilterFormValues', () => {
    describe('selector execution', () => {
        test('policiesSelector with 500 policies', async () => {
            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) => ({
                    ...createRandomPolicy(index),
                    taxRates: {
                        name: 'Tax',
                        defaultExternalID: '',
                        defaultValue: '10%',
                        foreignTaxDefault: '',
                        taxes: {tax1: {name: 'VAT', value: '20%', code: 'vat', modifiedName: 'VAT', isDisabled: false}},
                    },
                    employeeList: Object.fromEntries(Array.from({length: 100}, (_unused, i) => [`user${i}@test.com`, {email: `user${i}@test.com`, role: 'user'}])),
                }),
                POLICY_COUNT,
            );

            await measureFunction(() => policiesSelector(policies));
        });

        test('policyCategoriesSelector with 500 policy category collections', async () => {
            const categories = createCollection<PolicyCategories>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${index}`,
                () =>
                    createMock<PolicyCategories>(
                        Object.fromEntries(
                            Array.from({length: 40}, (_unused, i) => [
                                `Category${i}`,
                                {name: `Category${i}`, enabled: true, unencodedName: `Category${i}`, areCommentsRequired: false, externalID: `${i}`, origin: 'abc'},
                            ]),
                        ),
                    ),
                CATEGORY_COUNT,
            );

            await measureFunction(() => policyCategoriesSelector(categories));
        });

        test('exportedToPoliciesSelector with 500 policies', async () => {
            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) =>
                    createMock<Policy>({
                        ...createRandomPolicy(index),
                        connections: {
                            quickbooksOnline: {
                                config: {realmId: `realm${index}`, companyName: `Company ${index}`},
                                lastSync: {isConnected: true},
                            },
                        },
                        exportLayouts: Object.fromEntries(Array.from({length: 5}, (_unused, i) => [`template${i}`, {name: `Template ${i}`}])),
                        employeeList: Object.fromEntries(Array.from({length: 100}, (_unused, i) => [`user${i}@test.com`, {email: `user${i}@test.com`, role: 'user'}])),
                        taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                    }),
                POLICY_COUNT,
            );

            await measureFunction(() => exportedToPoliciesSelector(policies));
        });

        test('typeOptionsPoliciesSelector with 500 policies', async () => {
            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) =>
                    createMock<Policy>({
                        ...createRandomPolicy(index),
                        connections: {
                            quickbooksOnline: {
                                config: {realmId: `realm${index}`},
                                lastSync: {isConnected: true},
                            },
                        },
                        taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                        fieldList: Object.fromEntries(Array.from({length: 10}, (_unused, i) => [`field${i}`, {name: `Field ${i}`, type: 'text'}])),
                        employeeList: Object.fromEntries(Array.from({length: 100}, (_unused, i) => [`user${i}@test.com`, {email: `user${i}@test.com`, role: 'user'}])),
                    }),
                POLICY_COUNT,
            );

            await measureFunction(() => typeOptionsPoliciesSelector(policies));
        });

        test('advancedSearchPoliciesSelector with 500 policies', async () => {
            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) =>
                    createMock<Policy>({
                        ...createRandomPolicy(index),
                        connections: {
                            quickbooksOnline: {
                                config: {realmId: `realm${index}`, companyName: `Company ${index}`},
                                lastSync: {isConnected: true},
                            },
                        },
                        exportLayouts: Object.fromEntries(Array.from({length: 5}, (_unused, i) => [`template${i}`, {name: `Template ${i}`}])),
                        rules: {approvalRules: Array.from({length: 10}, (_unused, i) => ({id: `rule${i}`, name: `Rule ${i}`}))},
                        employeeList: Object.fromEntries(Array.from({length: 100}, (_unused, i) => [`user${i}@test.com`, {email: `user${i}@test.com`, role: 'user'}])),
                        taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                        fieldList: Object.fromEntries(Array.from({length: 10}, (_unused, i) => [`field${i}`, {name: `Field ${i}`, type: 'text'}])),
                    }),
                POLICY_COUNT,
            );

            await measureFunction(() => advancedSearchPoliciesSelector(policies));
        });
    });

    describe('buildFilterFormValuesFromQuery execution', () => {
        test('buildFilterFormValuesFromQuery with 500 policies, reports, categories', async () => {
            const queryJSON = buildSearchQueryJSONOrThrow('type:expense status:all category:Category0 tag:Tag0');

            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) => ({
                    ...createRandomPolicy(index),
                    taxRates: {
                        name: 'Tax',
                        defaultExternalID: '',
                        defaultValue: '10%',
                        foreignTaxDefault: '',
                        taxes: {tax1: {name: 'VAT', value: '20%', code: 'vat', modifiedName: 'VAT', isDisabled: false}},
                    },
                }),
                POLICY_COUNT,
            );
            const reports = createCollection<Report>(
                (_, index) => `${ONYXKEYS.COLLECTION.REPORT}${index}`,
                (index) => createMock<Report>({reportID: `${index}`, reportName: `Report ${index}`}),
                REPORT_COUNT,
            );
            const categories = createCollection<PolicyCategories>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${index}`,
                () => createMock<PolicyCategories>(Object.fromEntries(Array.from({length: 40}, (_unused, i) => [`Category${i}`, {name: `Category${i}`, enabled: true}]))),
                CATEGORY_COUNT,
            );
            const taxRates = getAllTaxRates(policies);

            await measureFunction(() => buildFilterFormValuesFromQuery(queryJSON, categories, {}, {}, {}, reports, taxRates));
        });
    });
});
