import React, {useMemo} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import Onyx, {useOnyx} from 'react-native-onyx';
import {measureFunction, measureRenders} from 'reassure';
import {policiesSelector, policyCategoriesSelector, policyTagsSelector, reportsSelector} from '@hooks/useFilterFormValues';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchQueryJSON} from '@src/components/Search/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

function buildSearchQueryJSONOrThrow(query: string): SearchQueryJSON {
    const result = buildSearchQueryJSON(query);
    if (!result) {
        throw new Error(`Failed to parse query string: ${query}`);
    }
    return result;
}

const POLICY_COUNT = 500;
const REPORT_COUNT = 500;
const CATEGORY_COUNT = 500;
const TAG_COUNT = 500;

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
});

afterEach(() => Onyx.clear());

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

        test('reportsSelector with 500 reports', async () => {
            const reports = createCollection<Report>(
                (_, index) => `${ONYXKEYS.COLLECTION.REPORT}${index}`,
                (index) =>
                    ({
                        reportID: `${index}`,
                        reportName: `Report ${index}`,
                        chatType: 'policyExpenseChat',
                        stateNum: 1,
                        statusNum: 1,
                        ownerAccountID: index,
                        participantAccountIDs: [index, index + 1],
                    }) as unknown as Report,
                REPORT_COUNT,
            );

            await measureFunction(() => reportsSelector(reports));
        });

        test('policyCategoriesSelector with 500 policy category collections', async () => {
            const categories = createCollection<PolicyCategories>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${index}`,
                () =>
                    Object.fromEntries(
                        Array.from({length: 40}, (_unused, i) => [
                            `Category${i}`,
                            {name: `Category${i}`, enabled: true, unencodedName: `Category${i}`, areCommentsRequired: false, externalID: `${i}`, origin: 'abc'},
                        ]),
                    ) as unknown as PolicyCategories,
                CATEGORY_COUNT,
            );

            await measureFunction(() => policyCategoriesSelector(categories));
        });

        test('policyTagsSelector with 500 policy tag collections', async () => {
            const tags = createCollection<PolicyTagLists>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${index}`,
                () =>
                    ({
                        Department: {
                            name: 'Department',
                            required: true,
                            tags: Object.fromEntries(Array.from({length: 30}, (_unused, i) => [`Tag${i}`, {name: `Tag${i}`, enabled: true}])),
                        },
                    }) as unknown as PolicyTagLists,
                TAG_COUNT,
            );

            await measureFunction(() => policyTagsSelector(tags));
        });
    });

    describe('buildFilterFormValuesFromQuery execution', () => {
        test('buildFilterFormValuesFromQuery with 500 policies, reports, categories, tags', async () => {
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
                (index) => ({reportID: `${index}`, reportName: `Report ${index}`}) as unknown as Report,
                REPORT_COUNT,
            );
            const categories = createCollection<PolicyCategories>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${index}`,
                () => Object.fromEntries(Array.from({length: 40}, (_unused, i) => [`Category${i}`, {name: `Category${i}`, enabled: true}])) as unknown as PolicyCategories,
                CATEGORY_COUNT,
            );
            const tags = createCollection<PolicyTagLists>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${index}`,
                () =>
                    ({
                        Department: {
                            name: 'Department',
                            required: true,
                            tags: Object.fromEntries(Array.from({length: 30}, (_unused, i) => [`Tag${i}`, {name: `Tag${i}`, enabled: true}])),
                        },
                    }) as unknown as PolicyTagLists,
                TAG_COUNT,
            );
            const taxRates = getAllTaxRates(policies);

            await measureFunction(() => buildFilterFormValuesFromQuery(queryJSON, categories, tags, {}, {}, {}, reports, taxRates));
        });
    });

    describe('hook render duration with unrelated Onyx changes', () => {
        test('with selectors - render duration when policies change', async () => {
            const queryJSON = buildSearchQueryJSONOrThrow('type:expense status:all category:Category0 tag:Tag0');

            function TestComponent() {
                const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector});
                const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelector});
                const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: policyTagsSelector});
                const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {selector: policyCategoriesSelector});
                const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
                const formValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, {}, {}, {}, allReports, taxRates);
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
                () => Object.fromEntries(Array.from({length: 40}, (_unused, i) => [`Category${i}`, {name: `Category${i}`, enabled: true}])) as unknown as PolicyCategories,
                CATEGORY_COUNT,
            );
            const tags = createCollection<PolicyTagLists>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${index}`,
                () =>
                    ({
                        Department: {
                            name: 'Department',
                            required: true,
                            tags: Object.fromEntries(Array.from({length: 30}, (_unused, i) => [`Tag${i}`, {name: `Tag${i}`, enabled: true}])),
                        },
                    }) as unknown as PolicyTagLists,
                TAG_COUNT,
            );
            const reports = createCollection<Report>(
                (_, index) => `${ONYXKEYS.COLLECTION.REPORT}${index}`,
                (index) => ({reportID: `${index}`, reportName: `Report ${index}`}) as unknown as Report,
                REPORT_COUNT,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, categories);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_TAGS, tags);
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
                const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
                const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
                const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
                const formValues = buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, {}, {}, {}, allReports, taxRates);
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
                () => Object.fromEntries(Array.from({length: 40}, (_unused, i) => [`Category${i}`, {name: `Category${i}`, enabled: true}])) as unknown as PolicyCategories,
                CATEGORY_COUNT,
            );
            const tags = createCollection<PolicyTagLists>(
                (_, index) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${index}`,
                () =>
                    ({
                        Department: {
                            name: 'Department',
                            required: true,
                            tags: Object.fromEntries(Array.from({length: 30}, (_unused, i) => [`Tag${i}`, {name: `Tag${i}`, enabled: true}])),
                        },
                    }) as unknown as PolicyTagLists,
                TAG_COUNT,
            );
            const reports = createCollection<Report>(
                (_, index) => `${ONYXKEYS.COLLECTION.REPORT}${index}`,
                (index) => ({reportID: `${index}`, reportName: `Report ${index}`}) as unknown as Report,
                REPORT_COUNT,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, policies);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, categories);
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_TAGS, tags);
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
