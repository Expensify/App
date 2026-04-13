import type * as NativeNavigation from '@react-navigation/native';
import {renderHook, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';
import type {PolicyCategory} from '@src/types/onyx/PolicyCategory';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
}));

jest.mock('@hooks/useExportedToFilterOptions', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        exportedToFilterOptions: [],
        combinedUniqueExportTemplates: [],
        connectedIntegrationNames: new Set<string>(),
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

function wrapper({children}: {children: React.ReactNode}) {
    return React.createElement(LocaleContextProvider, null, children);
}

function buildPolicy(id: number, overrides: Partial<Policy>): Policy {
    return {
        ...createRandomPolicy(id, CONST.POLICY.TYPE.TEAM),
        pendingAction: undefined,
        ...overrides,
    };
}

function buildTagList(tagName: string): PolicyTagLists {
    return {
        Department: {
            name: 'Department',
            orderWeight: 0,
            required: false,
            tags: {
                [tagName]: {name: tagName, enabled: true, errors: null},
            },
        },
    };
}

describe('useAdvancedSearchFilters', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('category filter visibility', () => {
        it('hides category filter when no policies have categories enabled', async () => {
            const policy = buildPolicy(1, {areCategoriesEnabled: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
            });
        });

        it('shows category filter when policy has categories enabled and categories exist', async () => {
            const policy = buildPolicy(1, {areCategoriesEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const categories: Record<string, PolicyCategory> = {
                Food: {name: 'Food', enabled: true, unencodedName: 'Food', areCommentsRequired: false, externalID: '', origin: '', pendingAction: undefined},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}1`, categories);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
            });
        });

        it('hides category filter when categories exist only for personal policies', async () => {
            const personalPolicy = buildPolicy(1, {
                areCategoriesEnabled: true,
                type: CONST.POLICY.TYPE.PERSONAL,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, personalPolicy);

            const categories: Record<string, PolicyCategory> = {
                Food: {name: 'Food', enabled: true, unencodedName: 'Food', areCommentsRequired: false, externalID: '', origin: '', pendingAction: undefined},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}1`, categories);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
            });
        });
    });

    describe('tag filter visibility', () => {
        it('hides tag filter when no policies have tags enabled', async () => {
            const policy = buildPolicy(1, {areTagsEnabled: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });

        it('shows tag filter when tags are enabled and tags exist', async () => {
            const policy = buildPolicy(1, {areTagsEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`, buildTagList('Engineering'));

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });

        it('shows tag filter when tags are enabled even if no tags exist (singlePolicyCondition is always truthy)', async () => {
            const policy = buildPolicy(1, {areTagsEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const emptyTagList: PolicyTagLists = {
                Department: {
                    name: 'Department',
                    orderWeight: 0,
                    required: false,
                    tags: {},
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`, emptyTagList);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            // Tag filter is visible because singlePolicyCondition (!!selectedPolicyTagLists) is always true
            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });
    });

    describe('tax filter visibility', () => {
        it('hides tax filter when no policies have taxes enabled', async () => {
            const policy = buildPolicy(1, {tax: {trackingEnabled: false}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
            });
        });

        it('shows tax filter when taxes are enabled and tax rates exist', async () => {
            const policy = buildPolicy(1, {
                tax: {trackingEnabled: true},
                taxRates: {
                    name: 'Tax',
                    defaultExternalID: 'taxVat',
                    defaultValue: '10%',
                    foreignTaxDefault: 'taxVat',
                    taxes: {
                        taxVat: {name: 'VAT', value: '10%', code: 'VAT'},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
            });
        });

        it('hides tax filter when taxes are enabled but no tax rates exist', async () => {
            const policy = buildPolicy(1, {
                tax: {trackingEnabled: true},
                taxRates: {
                    name: 'Tax',
                    defaultExternalID: '',
                    defaultValue: '',
                    foreignTaxDefault: '',
                    taxes: {},
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
            });
        });
    });

    describe('attendee filter visibility', () => {
        it('hides attendee filter when no policies have attendee tracking enabled', async () => {
            const policy = buildPolicy(1, {type: CONST.POLICY.TYPE.CORPORATE, isAttendeeTrackingEnabled: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });

        it('shows attendee filter when isAttendeeTrackingEnabled is absent (Classic backwards compat)', async () => {
            const policy = buildPolicy(1, {type: CONST.POLICY.TYPE.CORPORATE});
            // Ensure the property is truly absent, not just falsy
            delete (policy as Record<string, unknown>).isAttendeeTrackingEnabled;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });

        it('shows attendee filter when attendee tracking is enabled', async () => {
            const policy = buildPolicy(1, {type: CONST.POLICY.TYPE.CORPORATE, isAttendeeTrackingEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });
    });

    describe('report field filter visibility', () => {
        it('hides report field filter when no policies have custom report fields', async () => {
            const policy = buildPolicy(1, {fieldList: {}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD);
            });
        });

        it('shows report field filter when policy has custom (non-formula) report fields', async () => {
            const policy = buildPolicy(1, {
                fieldList: {
                    textCustomField: {
                        name: 'Custom Field',
                        type: 'text',
                        defaultValue: '',
                        values: [],
                        disabledOptions: [],
                        fieldID: 'textCustomField',
                        orderWeight: 0,
                        deletable: true,
                        value: 'text',
                        target: 'expense',
                        externalIDs: [],
                        isTax: false,
                        keys: [],
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD);
            });
        });

        it('hides report field filter when all report fields are default formula type', async () => {
            const policy = buildPolicy(1, {
                fieldList: {
                    formulaField: {
                        name: 'Formula Field',
                        type: CONST.POLICY.DEFAULT_FIELD_LIST_TYPE,
                        defaultValue: '',
                        values: [],
                        disabledOptions: [],
                        fieldID: 'formulaField',
                        orderWeight: 0,
                        deletable: false,
                        value: 'formula',
                        target: 'expense',
                        externalIDs: [],
                        isTax: false,
                        keys: [],
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD);
            });
        });
    });

    describe('currentType', () => {
        it('defaults to expense when no type is set', async () => {
            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                expect(result.current.currentType).toBe(CONST.SEARCH.DATA_TYPES.EXPENSE);
            });
        });

        it('uses the type from search filters form', async () => {
            await Onyx.merge(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {type: CONST.SEARCH.DATA_TYPES.CHAT});

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                expect(result.current.currentType).toBe(CONST.SEARCH.DATA_TYPES.CHAT);
            });
        });
    });

    describe('cross-feature interaction', () => {
        it('shows multiple filters when multiple features are enabled', async () => {
            const policy = buildPolicy(1, {
                type: CONST.POLICY.TYPE.CORPORATE,
                areCategoriesEnabled: true,
                areTagsEnabled: true,
                isAttendeeTrackingEnabled: true,
                tax: {trackingEnabled: true},
                taxRates: {
                    name: 'Tax',
                    defaultExternalID: 'taxVat',
                    defaultValue: '10%',
                    foreignTaxDefault: 'taxVat',
                    taxes: {
                        taxVat: {name: 'VAT', value: '10%', code: 'VAT'},
                    },
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const categories: Record<string, PolicyCategory> = {
                Food: {name: 'Food', enabled: true, unencodedName: 'Food', areCommentsRequired: false, externalID: '', origin: '', pendingAction: undefined},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}1`, categories);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`, buildTagList('Engineering'));

            const {result} = renderHook(() => useAdvancedSearchFilters(), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.typeFiltersKeys.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });
    });
});
