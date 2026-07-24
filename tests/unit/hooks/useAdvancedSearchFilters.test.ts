import {renderHook, waitFor} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyTagLists} from '@src/types/onyx';
import type {PolicyCategory} from '@src/types/onyx/PolicyCategory';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
            });
        });
    });

    describe('tag filter visibility', () => {
        it('hides tag filter when no policies have tags enabled', async () => {
            const policy = buildPolicy(1, {areTagsEnabled: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });

        it('shows tag filter when tags are enabled and tags exist', async () => {
            const policy = buildPolicy(1, {areTagsEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`, buildTagList('Engineering'));

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });

        it('hides tag filter when tags are enabled but no tags exist', async () => {
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            // Tag filter is hidden because the tag list contains no actual tags
            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });

        it('hides tag filter when a selected policy has tags enabled but no tags exist', async () => {
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, {value: ['1'], isNegated: false}), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });

        it('shows tag filter when a selected policy has actual tags', async () => {
            const policy = buildPolicy(1, {areTagsEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}1`, buildTagList('Engineering'));

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, {value: ['1'], isNegated: false}), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
            });
        });
    });

    describe('tax filter visibility', () => {
        it('hides tax filter when no policies have taxes enabled', async () => {
            const policy = buildPolicy(1, {tax: {trackingEnabled: false}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
            });
        });
    });

    describe('attendee filter visibility', () => {
        it('hides attendee filter when no policies have attendee tracking enabled', async () => {
            const policy = buildPolicy(1, {type: CONST.POLICY.TYPE.CORPORATE, isAttendeeTrackingEnabled: false});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });

        it('shows attendee filter when isAttendeeTrackingEnabled is absent (Classic backwards compat)', async () => {
            const policy = buildPolicy(1, {type: CONST.POLICY.TYPE.CORPORATE});
            // Ensure the property is truly absent, not just falsy
            delete (policy as Record<string, unknown>).isAttendeeTrackingEnabled;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });

        it('shows attendee filter when attendee tracking is enabled', async () => {
            const policy = buildPolicy(1, {type: CONST.POLICY.TYPE.CORPORATE, isAttendeeTrackingEnabled: true});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });
    });

    describe('report field filter visibility', () => {
        it('hides report field filter when no policies have custom report fields', async () => {
            const policy = buildPolicy(1, {fieldList: {}});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, policy);

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD);
            });
        });
    });

    describe('bank account filter visibility', () => {
        it('hides bank account filter when no bank accounts exist', async () => {
            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT);
            });
        });

        it('shows bank account filter for expense type when at least one settlement-eligible bank account exists', async () => {
            const bankAccountID = 42;
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    accountData: {
                        bankAccountID,
                        accountNumber: '123456789012',
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        additionalData: {bankName: CONST.BANK_NAMES.CHASE},
                    },
                },
            });

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT);
            });
        });

        it('hides bank account filter when only personal deposit accounts are present', async () => {
            const bankAccountID = 42;
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    accountData: {
                        bankAccountID,
                        accountNumber: '123456789012',
                        type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        additionalData: {bankName: CONST.BANK_NAMES.CHASE},
                    },
                },
            });

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT);
            });
        });

        it('shows bank account filter when business accounts are LOCKED so historical expenses paid from a closed account stay searchable', async () => {
            const bankAccountID = 42;
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    accountData: {
                        bankAccountID,
                        accountNumber: '123456789012',
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.LOCKED,
                        additionalData: {bankName: CONST.BANK_NAMES.CHASE},
                    },
                },
            });

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT);
            });
        });

        it('hides bank account filter when the only business account is in a partial-setup state (SETUP / VERIFYING / PENDING) since it has paid no expenses', async () => {
            const bankAccountID = 42;
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    accountData: {
                        bankAccountID,
                        accountNumber: '123456789012',
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.PENDING,
                        additionalData: {bankName: CONST.BANK_NAMES.CHASE},
                    },
                },
            });

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT);
            });
        });

        it('does not include bank account filter for non-expense types even when settlement-eligible accounts exist', async () => {
            const bankAccountID = 42;
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    accountData: {
                        bankAccountID,
                        accountNumber: '123456789012',
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        additionalData: {bankName: CONST.BANK_NAMES.CHASE},
                    },
                },
            });

            const {result} = renderHook(() => useAdvancedSearchFilters(CONST.SEARCH.DATA_TYPES.CHAT, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).not.toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.BANK_ACCOUNT);
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

            const {result} = renderHook(() => useAdvancedSearchFilters(undefined, undefined), {wrapper});

            await waitFor(() => {
                const allKeys = result.current.flat();
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY);
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
                expect(allKeys).toContain(CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE);
            });
        });
    });
});
