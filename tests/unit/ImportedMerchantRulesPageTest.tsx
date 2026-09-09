import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as Rules from '@libs/actions/Policy/Rules';

import ImportedMerchantRulesPage, {
    buildImportedCategoryLookup,
    buildImportedVendorLookup,
    normalizeImportedTag,
    parseSpreadsheetRules,
    willImportShortCircuitLocally,
} from '@pages/workspace/rules/MerchantRules/ImportedMerchantRulesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheet, Policy, PolicyCategories} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'imported-merchant-rules-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;

jest.mock('@react-navigation/native', () => {
    // jest.requireActual returns `any` for the untyped React Navigation module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');

    // Spreading the untyped requireActual result is intentional for this navigation mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            addListener: () => jest.fn(),
            isFocused: () => true,
        }),
        useIsFocused: () => true,
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useRoute: () => ({key: 'test-route', name: 'Rules_Merchant_Imported', params: {policyID: POLICY_ID}}),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getTopmostReportId: jest.fn(() => undefined),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenFromNavigationState: jest.fn(),
    dismissModal: jest.fn(),
}));

// A Control workspace with Rules enabled and the current user as admin, so the page's
// AccessOrNotFoundWrapper renders the import content instead of the not-found fallback.
function buildRulesEnabledControlPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Control Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        ownerAccountID: ADMIN_ACCOUNT_ID,
        areRulesEnabled: true,
        employeeList: {
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
        },
        outputCurrency: 'USD',
        pendingAction: null,
        errors: {},
    } as Policy;
}

// A spreadsheet that maps a merchant filter column and one action column, so validation passes
// and pressing Import proceeds to build a net-new rule (which needs the API).
function buildSpreadsheet(): ImportedSpreadsheet {
    const mappedColumns = [CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS, CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT];
    const columns: Record<number, string> = {};
    for (const [index, columnName] of mappedColumns.entries()) {
        columns[index] = columnName;
    }
    return {
        data: [
            ['Merchant is', 'Starbucks'],
            ['Updated merchant', 'SBUX'],
        ],
        columns,
        containsHeader: true,
        isImportingMultiLevelTags: false,
        isImportingIndependentMultiLevelTags: false,
        isGLAdjacent: false,
    };
}

// A spreadsheet whose only mapped action is a Category cell referencing a category that doesn't exist on the
// workspace. Every row is dropped, so no net-new rule remains and importRules short-circuits locally with no API call.
function buildInvalidCategorySpreadsheet(): ImportedSpreadsheet {
    const mappedColumns = [CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS, CONST.CSV_IMPORT_COLUMNS.CATEGORY];
    const columns: Record<number, string> = {};
    for (const [index, columnName] of mappedColumns.entries()) {
        columns[index] = columnName;
    }
    return {
        data: [
            ['Merchant is', 'Starbucks'],
            ['Updated category', 'Nonexistent category'],
        ],
        columns,
        containsHeader: true,
        isImportingMultiLevelTags: false,
        isImportingIndependentMultiLevelTags: false,
        isGLAdjacent: false,
    };
}

// A QBO policy whose non-reimbursable export destination scopes vendor matching to QBO, mirroring AddVendorPageTest's
// fixture. Passing `undefined` models the list not yet synced; `[]` models a loaded-but-empty list.
function buildQBOPolicyWithVendors(vendors: Array<{id: string; name: string; currency: string}> | undefined): Policy {
    return createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                data: vendors === undefined ? {} : {vendors},
            },
        }),
    });
}

// A spreadsheet whose only mapped action is a Vendor cell, so vendor resolution can be tested independently
// of the other action columns.
function buildVendorSpreadsheet(vendorCellValue: string): ImportedSpreadsheet {
    const mappedColumns = [CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS, CONST.CSV_IMPORT_COLUMNS.VENDOR];
    const columns: Record<number, string> = {};
    for (const [index, columnName] of mappedColumns.entries()) {
        columns[index] = columnName;
    }
    return {
        data: [
            ['Merchant is', 'Starbucks'],
            ['Updated vendor', vendorCellValue],
        ],
        columns,
        containsHeader: true,
        isImportingMultiLevelTags: false,
        isImportingIndependentMultiLevelTags: false,
        isGLAdjacent: false,
    };
}

const mockRoute = {
    key: 'test-route',
    name: 'Rules_Merchant_Imported',
    params: {policyID: POLICY_ID},
};

function renderImportedMerchantRulesPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ImportedMerchantRulesPage
                // @ts-expect-error - route type from navigator
                route={mockRoute}
            />
        </ComposeProviders>,
    );
}

async function seedOnyx(isOffline: boolean, spreadsheet: ImportedSpreadsheet = buildSpreadsheet()) {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: isOffline});
        await Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET, spreadsheet);
        await waitForBatchedUpdatesWithAct();
    });
}

describe('ImportedMerchantRulesPage', () => {
    describe('normalizeImportedTag', () => {
        describe('multi-level tag policy', () => {
            it('collapses the space after the colon in a multi-level tag', () => {
                expect(normalizeImportedTag('Parent: Child', true)).toBe('Parent:Child');
            });

            it('trims surrounding spaces around every level', () => {
                expect(normalizeImportedTag(' Parent : Child : Grandchild ', true)).toBe('Parent:Child:Grandchild');
            });

            it('leaves a single-level tag unchanged', () => {
                expect(normalizeImportedTag('Travel', true)).toBe('Travel');
            });

            it('preserves internal spaces within a level', () => {
                expect(normalizeImportedTag('North America: New York', true)).toBe('North America:New York');
            });

            it('preserves an already canonical multi-level tag', () => {
                expect(normalizeImportedTag('Parent:Child', true)).toBe('Parent:Child');
            });

            it('preserves escaped colons within a single level', () => {
                expect(normalizeImportedTag('Time\\: Tracking', true)).toBe('Time\\: Tracking');
            });

            it('returns an empty string for an empty cell', () => {
                expect(normalizeImportedTag('', true)).toBe('');
            });
        });

        describe('single-level tag policy', () => {
            it('escapes a colon so the cell stays one literal tag name', () => {
                expect(normalizeImportedTag('ab:cd', false)).toBe('ab\\:cd');
            });

            it('preserves internal spaces around a colon in the tag name', () => {
                expect(normalizeImportedTag('ab: cd', false)).toBe('ab\\: cd');
            });

            it('escapes every colon in the tag name', () => {
                expect(normalizeImportedTag('a:b:c', false)).toBe('a\\:b\\:c');
            });

            it('leaves a tag without colons unchanged', () => {
                expect(normalizeImportedTag('Travel', false)).toBe('Travel');
            });

            it('returns an empty string for an empty cell', () => {
                expect(normalizeImportedTag('', false)).toBe('');
            });
        });
    });

    describe('buildImportedCategoryLookup', () => {
        // Policy category names are stored HTML-encoded, so the collection key contains the encoded name
        const encodedFoodAndDrink = 'Food &amp; Drink';
        const policyCategories: PolicyCategories = {
            Travel: {name: 'Travel', enabled: true},
            [encodedFoodAndDrink]: {name: encodedFoodAndDrink, enabled: true},
            Disabled: {name: 'Disabled', enabled: false},
            Deleted: {name: 'Deleted', enabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        };

        it('resolves an exact category name to its stored name', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('travel')).toBe('Travel');
        });

        it('resolves a cell case-insensitively', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('TRAVEL'.toLowerCase())).toBe('Travel');
        });

        it('resolves a plain-text cell against an HTML-encoded stored name', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('food & drink')).toBe('Food &amp; Drink');
        });

        it('excludes a disabled category', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('disabled')).toBeUndefined();
        });

        it('excludes a category pending deletion', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('deleted')).toBeUndefined();
        });

        it('returns undefined for a category that does not exist on the policy', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('nonexistent')).toBeUndefined();
        });

        it('returns an empty lookup when the policy has no categories', () => {
            expect(buildImportedCategoryLookup(undefined).size).toBe(0);
        });
    });

    describe('buildImportedVendorLookup', () => {
        const policy = buildQBOPolicyWithVendors([
            {id: 'v-1', name: 'Acme Co', currency: 'USD'},
            {id: 'v-2', name: 'Duplicate Name', currency: 'USD'},
            {id: 'v-3', name: 'Duplicate Name', currency: 'USD'},
        ]);

        it('resolves an exact vendor name to its external ID', () => {
            expect(buildImportedVendorLookup(policy).get('acme co')).toBe('v-1');
        });

        it('resolves a cell case-insensitively and trimmed', () => {
            expect(buildImportedVendorLookup(policy).get('  ACME CO  '.trim().toLowerCase())).toBe('v-1');
        });

        it('maps a name shared by more than one active vendor to null (ambiguous)', () => {
            expect(buildImportedVendorLookup(policy).get('duplicate name')).toBeNull();
        });

        it('returns an empty lookup when the vendor list has not loaded', () => {
            expect(buildImportedVendorLookup(buildQBOPolicyWithVendors(undefined)).size).toBe(0);
        });
    });

    describe('willImportShortCircuitLocally', () => {
        it('is true when no rule remains but rows were skipped as duplicates', () => {
            expect(willImportShortCircuitLocally({rules: {}, skippedDuplicateCount: 2, invalidCategoryNames: new Set(), invalidVendorNames: new Set()})).toBe(true);
        });

        it('is true when no rule remains but a category cell was invalid', () => {
            expect(willImportShortCircuitLocally({rules: {}, skippedDuplicateCount: 0, invalidCategoryNames: new Set(['travel']), invalidVendorNames: new Set()})).toBe(true);
        });

        it('is true when no rule remains but a vendor cell was invalid', () => {
            expect(willImportShortCircuitLocally({rules: {}, skippedDuplicateCount: 0, invalidCategoryNames: new Set(), invalidVendorNames: new Set(['nonexistent vendor'])})).toBe(true);
        });

        it('is false when a net-new rule remains, even if some rows were skipped', () => {
            const rules = {ruleKey: {filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'}, merchant: 'SBUX'}};
            expect(willImportShortCircuitLocally({rules, skippedDuplicateCount: 3, invalidCategoryNames: new Set(['travel']), invalidVendorNames: new Set()})).toBe(false);
        });

        it('is false when nothing was parsed at all', () => {
            expect(willImportShortCircuitLocally({rules: {}, skippedDuplicateCount: 0, invalidCategoryNames: new Set(), invalidVendorNames: new Set()})).toBe(false);
        });
    });

    describe('parseSpreadsheetRules', () => {
        it('builds a net-new rule from a mapped row', () => {
            const result = parseSpreadsheetRules(buildSpreadsheet(), true, buildRulesEnabledControlPolicy(), undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(1);
            expect(Object.values(result.rules).at(0)).toMatchObject({
                filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'},
                merchant: 'SBUX',
            });
            expect(result.skippedDuplicateCount).toBe(0);
            expect(result.invalidCategoryNames.size).toBe(0);
            expect(result.invalidVendorNames.size).toBe(0);
        });

        it('skips a row that duplicates an existing coding rule', () => {
            const policy = buildRulesEnabledControlPolicy();
            policy.rules = {
                codingRules: {
                    existing: {filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Starbucks'}, merchant: 'SBUX'},
                },
            };

            const result = parseSpreadsheetRules(buildSpreadsheet(), true, policy, undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(0);
            expect(result.skippedDuplicateCount).toBe(1);
        });

        it('drops a row whose category cell does not match a workspace category', () => {
            const result = parseSpreadsheetRules(buildInvalidCategorySpreadsheet(), true, buildRulesEnabledControlPolicy(), undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(0);
            expect([...result.invalidCategoryNames]).toEqual(['nonexistent category']);
        });

        it('resolves a vendor cell to the matching vendor external ID', () => {
            const policy = buildQBOPolicyWithVendors([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            const result = parseSpreadsheetRules(buildVendorSpreadsheet('Acme Co'), true, policy, undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(1);
            expect(Object.values(result.rules).at(0)).toMatchObject({vendorID: 'v-1'});
            expect(result.invalidVendorNames.size).toBe(0);
        });

        it('drops the vendor action and reports the cell when the vendor is unknown, but the row has another action', () => {
            const policy = buildQBOPolicyWithVendors([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            const mappedColumns = [CONST.CSV_IMPORT_COLUMNS.MERCHANT_IS, CONST.CSV_IMPORT_COLUMNS.UPDATED_MERCHANT, CONST.CSV_IMPORT_COLUMNS.VENDOR];
            const columns: Record<number, string> = {};
            for (const [index, columnName] of mappedColumns.entries()) {
                columns[index] = columnName;
            }
            const spreadsheet: ImportedSpreadsheet = {
                data: [
                    ['Merchant is', 'Starbucks'],
                    ['Updated merchant', 'SBUX'],
                    ['Updated vendor', 'Nonexistent Vendor'],
                ],
                columns,
                containsHeader: true,
                isImportingMultiLevelTags: false,
                isImportingIndependentMultiLevelTags: false,
                isGLAdjacent: false,
            };

            const result = parseSpreadsheetRules(spreadsheet, true, policy, undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(1);
            expect(Object.values(result.rules).at(0)).toMatchObject({merchant: 'SBUX'});
            expect(Object.values(result.rules).at(0)).not.toHaveProperty('vendorID');
            expect([...result.invalidVendorNames]).toEqual(['nonexistent vendor']);
        });

        it('treats a name shared by more than one active vendor as unavailable rather than guessing', () => {
            const policy = buildQBOPolicyWithVendors([
                {id: 'v-1', name: 'Duplicate Name', currency: 'USD'},
                {id: 'v-2', name: 'Duplicate Name', currency: 'USD'},
            ]);
            const result = parseSpreadsheetRules(buildVendorSpreadsheet('Duplicate Name'), true, policy, undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(0);
            expect([...result.invalidVendorNames]).toEqual(['duplicate name']);
        });

        it('skips a row whose only action is an invalid vendor cell', () => {
            const policy = buildQBOPolicyWithVendors([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            const result = parseSpreadsheetRules(buildVendorSpreadsheet('Nonexistent Vendor'), true, policy, undefined, true);

            expect(Object.keys(result.rules)).toHaveLength(0);
            expect([...result.invalidVendorNames]).toEqual(['nonexistent vendor']);
        });

        it('does not flag any vendor cell invalid while the vendor list has not loaded yet', () => {
            const policy = buildQBOPolicyWithVendors(undefined);
            const result = parseSpreadsheetRules(buildVendorSpreadsheet('Acme Co'), true, policy, undefined, false);

            expect(result.invalidVendorNames.size).toBe(0);
            expect(Object.keys(result.rules)).toHaveLength(0);
        });
    });

    // The merchant-rules importer only bypasses the shared importer's offline guard for the all-skipped client-only path
    // (every row a duplicate/unknown category), which builds its confirmation modal locally with no API call. When the
    // spreadsheet has any net-new rule the import still needs importMerchantRulesSpreadsheet (a non-retryable
    // makeRequestWithSideEffects call), so the button must stay disabled offline to avoid an immediate import-failed modal.
    describe('Import button offline behavior', () => {
        // The confirm button on the import page renders `common.import`
        const IMPORT_BUTTON_TEXT = 'Import';

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        afterEach(async () => {
            jest.clearAllMocks();
            await act(async () => {
                await Onyx.clear();
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('disables the Import button while offline when the import has a net-new rule (needs the API)', async () => {
            await seedOnyx(true);

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            // `toBeDisabled` walks ancestors, so asserting on the button label reflects the Button's own disabled state
            expect(screen.getByText(IMPORT_BUTTON_TEXT)).toBeDisabled();
        });

        it('keeps the Import button enabled while offline when every row is skipped (client-only path)', async () => {
            await seedOnyx(true, buildInvalidCategorySpreadsheet());

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(IMPORT_BUTTON_TEXT)).not.toBeDisabled();
        });

        it('disables the Import button while offline when categories are enabled but not yet loaded', async () => {
            // Categories are enabled but not cached (e.g. after a cache clear), so the empty lookup wrongly flags
            // every category invalid. The short-circuit hinges on categories we couldn't validate, so it isn't safe offline.
            await seedOnyx(true, buildInvalidCategorySpreadsheet());
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {areCategoriesEnabled: true});
                await waitForBatchedUpdatesWithAct();
            });

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(IMPORT_BUTTON_TEXT)).toBeDisabled();
        });

        it('keeps the Import button enabled online even when the import needs the API', async () => {
            await seedOnyx(false);

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText(IMPORT_BUTTON_TEXT)).not.toBeDisabled();
        });

        it('short-circuits locally without calling the import API when pressing Import offline for the all-skipped path', async () => {
            await seedOnyx(true, buildInvalidCategorySpreadsheet());
            const importSpy = jest.spyOn(Rules, 'importMerchantRulesSpreadsheet');

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(IMPORT_BUTTON_TEXT));
            await waitForBatchedUpdatesWithAct();

            expect(importSpy).not.toHaveBeenCalled();
        });
    });
});
