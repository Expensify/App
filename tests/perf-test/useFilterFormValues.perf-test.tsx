import {policiesSelector, policyCategoriesSelector} from '@hooks/useFilterFormValues';

import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, Report} from '@src/types/onyx';

import React, {useMemo} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import Onyx, {useOnyx} from 'react-native-onyx';
import {measureRenders} from 'reassure';

import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';
import {buildSearchQueryJSONOrThrow, CATEGORY_COUNT, POLICY_COUNT, REPORT_COUNT} from './FilterFormValuesPerfTestUtils';

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
});

afterEach(() => Onyx.clear());

describe('useFilterFormValues', () => {
    describe('hook render duration with unrelated Onyx changes', () => {
        test('with selectors - render duration when policies change', async () => {
            const queryJSON = buildSearchQueryJSONOrThrow('type:expense status:all category:Category0 tag:Tag0');

            function TestComponent() {
                const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector});
                const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
                const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {selector: policyCategoriesSelector});
                const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
                const formValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, {}, {}, {}, allReports, taxRates);
                return <View testID={String(Object.keys(formValues).length)} />;
            }

            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) => ({
                    ...createRandomPolicy(index),
                    taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                }),
                POLICY_COUNT,
            );
            const categories = createCollection<PolicyCategories>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${index}`,
                () => createMock<PolicyCategories>(Object.fromEntries(Array.from({length: 40}, (_unused, i) => [`Category${i}`, {name: `Category${i}`, enabled: true}]))),
                CATEGORY_COUNT,
            );
            const reports = createCollection<Report>(
                (_, index) => `${ONYXKEYS.COLLECTION.REPORT}${index}`,
                (index) => createMock<Report>({reportID: `${index}`, reportName: `Report ${index}`}),
                REPORT_COUNT,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, categories);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reports);
            await waitForBatchedUpdates();

            await measureRenders(<TestComponent />, {
                scenario: async () => {
                    for (let i = 0; i < 50; i++) {
                        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${i}`, {name: `Updated Policy ${i} ${Date.now()}`});
                    }
                    await waitForBatchedUpdates();
                },
            });
        });

        test('without selectors - render duration when policies change', async () => {
            const queryJSON = buildSearchQueryJSONOrThrow('type:expense status:all category:Category0 tag:Tag0');

            function TestComponent() {
                const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
                const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
                const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
                const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
                const formValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, {}, {}, {}, allReports, taxRates);
                return <View testID={String(Object.keys(formValues).length)} />;
            }

            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) => ({
                    ...createRandomPolicy(index),
                    taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                }),
                POLICY_COUNT,
            );
            const categories = createCollection<PolicyCategories>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${index}`,
                () => createMock<PolicyCategories>(Object.fromEntries(Array.from({length: 40}, (_unused, i) => [`Category${i}`, {name: `Category${i}`, enabled: true}]))),
                CATEGORY_COUNT,
            );
            const reports = createCollection<Report>(
                (_, index) => `${ONYXKEYS.COLLECTION.REPORT}${index}`,
                (index) => createMock<Report>({reportID: `${index}`, reportName: `Report ${index}`}),
                REPORT_COUNT,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, categories);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reports);
            await waitForBatchedUpdates();

            await measureRenders(<TestComponent />, {
                scenario: async () => {
                    for (let i = 0; i < 50; i++) {
                        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${i}`, {name: `Updated Policy ${i} ${Date.now()}`});
                    }
                    await waitForBatchedUpdates();
                },
            });
        });
    });

    describe('render count with unrelated Onyx changes', () => {
        test('useOnyx COLLECTION.POLICY with policiesSelector - unrelated name changes', async () => {
            function TestComponent() {
                const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector});
                return <View testID={String(Object.keys(policies ?? {}).length)} />;
            }

            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) => ({
                    ...createRandomPolicy(index),
                    taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                }),
                POLICY_COUNT,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
            await waitForBatchedUpdates();

            await measureRenders(<TestComponent />, {
                scenario: async () => {
                    // Change unrelated fields (name, not taxRates) on 50 policies
                    for (let i = 0; i < 50; i++) {
                        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${i}`, {name: `Updated Policy ${i} ${Date.now()}`});
                    }
                    await waitForBatchedUpdates();
                },
            });
        });

        test('useOnyx COLLECTION.POLICY without selector - unrelated name changes', async () => {
            function TestComponent() {
                const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
                return <View testID={String(Object.keys(policies ?? {}).length)} />;
            }

            const policies = createCollection<Policy>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY}${index}`,
                (index) => ({
                    ...createRandomPolicy(index),
                    taxRates: {name: 'Tax', defaultExternalID: '', defaultValue: '10%', foreignTaxDefault: '', taxes: {}},
                }),
                POLICY_COUNT,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
            await waitForBatchedUpdates();

            await measureRenders(<TestComponent />, {
                scenario: async () => {
                    // Same unrelated field changes (name, not taxRates)
                    for (let i = 0; i < 50; i++) {
                        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${i}`, {name: `Updated Policy ${i} ${Date.now()}`});
                    }
                    await waitForBatchedUpdates();
                },
            });
        });
    });
});
