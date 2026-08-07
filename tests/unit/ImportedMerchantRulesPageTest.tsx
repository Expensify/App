import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as Rules from '@libs/actions/Policy/Rules';

import ImportedMerchantRulesPage, {buildImportedCategoryLookup, normalizeImportedTag} from '@pages/workspace/rules/MerchantRules/ImportedMerchantRulesPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheet, Policy, PolicyCategories} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

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
        isPolicyExpenseChatEnabled: true,
        pendingAction: null,
        errors: {},
    } as Policy;
}

// A spreadsheet that maps a merchant filter column and one action column, so validation passes
// and pressing Import proceeds to build a rule.
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

async function seedOnyx(isOffline: boolean) {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildRulesEnabledControlPolicy());
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ADMIN_ACCOUNT_ID]: buildPersonalDetails(ADMIN_EMAIL, ADMIN_ACCOUNT_ID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: isOffline});
        await Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET, buildSpreadsheet());
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

    // The merchant-rules importer passes `shouldDisableButtonWhenOffline={false}` to ImportSpreadsheetColumns because
    // the all-skipped path (every row a duplicate/unknown category) builds its confirmation modal client-side with no
    // API call, so the Import button must stay usable offline instead of following the shared importer's offline guard.
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

        it('keeps the Import button enabled while offline', async () => {
            await seedOnyx(true);

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            // `toBeDisabled` walks ancestors, so asserting on the button label reflects the Button's own disabled state
            expect(screen.getByText(IMPORT_BUTTON_TEXT)).not.toBeDisabled();
        });

        it('runs the import when the Import button is pressed while offline', async () => {
            await seedOnyx(true);
            const importSpy = jest.spyOn(Rules, 'importMerchantRulesSpreadsheet').mockResolvedValue({
                titleKey: 'spreadsheet.importSuccessfulTitle',
                promptKey: 'spreadsheet.importMerchantRulesSuccessfulDescription',
                promptKeyParams: {rules: 1, duplicates: 0, invalidCategories: 0},
            });

            renderImportedMerchantRulesPage();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText(IMPORT_BUTTON_TEXT));
            await waitForBatchedUpdatesWithAct();

            expect(importSpy).toHaveBeenCalledTimes(1);
        });
    });
});
