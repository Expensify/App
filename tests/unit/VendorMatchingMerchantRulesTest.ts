import {buildMerchantRule} from '@libs/ExpenseDefaultRuleUtils';
import {getMerchantRulesTableData} from '@libs/MerchantTypeRulesUtils';
import {hasVendorFeature, isXeroActiveMatchingSource} from '@libs/PolicyUtils';

import {getRuleDescription} from '@pages/workspace/rules/MerchantRulesSection';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleForm} from '@src/types/form/MerchantRuleForm';
import type {Policy, Rule} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/** Mirrors the way the rules engine keys `triggers` and `actions` by a stringified index. */
function toIndexMap<T>(values: T[]): Record<string, T> {
    return Object.fromEntries(values.map((value, index) => [String(index), value]));
}

/**
 * A minimal merchant rule form. Individual tests override only the fields they exercise, so the
 * mappers are validated against a realistic full form rather than a hand-picked subset.
 */
const buildForm = (overrides: Partial<MerchantRuleForm> = {}): MerchantRuleForm =>
    ({
        merchantToMatch: 'Coffee Shop',
        matchType: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        merchant: '',
        category: '',
        tag: '',
        tax: '',
        vendorID: '',
        comment: '',
        reimbursable: false,
        billable: false,
        ...overrides,
    }) as MerchantRuleForm;

/** QBO policy whose non-reimbursable export destination scopes vendor matching to QBO. */
const buildQBOPolicy = (vendors: Array<{id: string; name: string; currency: string}> | undefined): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                data: vendors === undefined ? {} : {vendors},
            },
        }),
    });

/**
 * QBO policy whose non-reimbursable export destination is Vendor Bill (not Credit Card), so QBO is no longer
 * the active vendor-matching source even though its vendor list is still populated. Reproduces the state a
 * workspace lands in after an admin switches export mode away from vendor-matching mode.
 */
const buildQBOWithVendorBillExportPolicy = (vendors: Array<{id: string; name: string; currency: string}>): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL},
                data: {vendors},
            },
        }),
    });

/** Xero policy whose supplier list scopes vendor matching to Xero (label flips vendor -> supplier). */
const buildXeroPolicy = (contacts: Record<string, {id: string; name: string; email: string}> | undefined): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                config: {isConfigured: true},
                data: contacts === undefined ? {} : {contacts},
            },
        }),
    });

/**
 * Dual-connected policy: QBO is the active vendor-matching source (credit-card export), but a stale Xero
 * connection lingers with its own contacts. Used to prove rule surfaces resolve against the active list only.
 */
const buildQBOWithStaleXeroPolicy = (qboVendors: Array<{id: string; name: string; currency: string}>, xeroContacts: Record<string, {id: string; name: string; email: string}>): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                data: {vendors: qboVendors},
            },
            [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                config: {isConfigured: true},
                data: {contacts: xeroContacts},
            },
        }),
    });

const buildVendorRule = (policy: Policy, vendorID: string): Rule => ({
    ...buildMerchantRule({merchantToMatch: 'Coffee Shop', matchType: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, vendorID}, policy),
    scope: CONST.RULES.SCOPE.POLICY,
    scopeID: policy.id,
    triggers: toIndexMap([CONST.RULES.EXPENSE_DEFAULT.TRIGGER.CREATE_TRANSACTION]),
    filters: {left: CONST.RULES.EXPENSE_DEFAULT.FIELD.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Coffee Shop'},
    actions: toIndexMap([{name: CONST.RULES.EXPENSE_DEFAULT.ACTION.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.VENDOR_ID, value: vendorID}]),
});

const withVendorRule = (policy: Policy, vendorID: string) => ({[`${ONYXKEYS.COLLECTION.RULE}rule1`]: buildVendorRule(policy, vendorID)});

describe('Vendor matching on merchant rules', () => {
    describe('buildMerchantRule vendor action', () => {
        it('writes a Set action for a vendorID', () => {
            const actions = Object.values(buildMerchantRule(buildForm({vendorID: 'v-1'}), undefined)?.actions ?? {});
            expect(actions).toContainEqual({name: CONST.RULES.EXPENSE_DEFAULT.ACTION.SET, field: CONST.RULES.EXPENSE_DEFAULT.FIELD.VENDOR_ID, value: 'v-1'});
        });

        it('writes no vendor action when the vendorID is unset, so the rule stops setting it', () => {
            const actions = Object.values(buildMerchantRule(buildForm({vendorID: '', category: 'Coffee'}), undefined)?.actions ?? {});
            expect(actions.some((action) => action.field === CONST.RULES.EXPENSE_DEFAULT.FIELD.VENDOR_ID)).toBe(false);
        });
    });

    describe('getMerchantRulesTableData vendor summary', () => {
        beforeEach(() => {
            IntlStore.load(CONST.LOCALES.EN);
            return waitForBatchedUpdates();
        });

        const buildTableData = (policy: Policy, vendorID: string) =>
            getMerchantRulesTableData({
                policy,
                policyID: policy.id,
                rules: withVendorRule(policy, vendorID),
                translate: translateLocal,
                isOffline: false,
                onNavigate: () => {},
            });

        it('resolves the vendor name when the vendor is in the loaded list', () => {
            const policy = buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            expect(buildTableData(policy, 'v-1').at(0)?.ruleDescription).toContain('Update vendor to "Acme Co"');
        });

        it('shows "Vendor unavailable" when the list is loaded but the vendor is missing', () => {
            expect(buildTableData(buildQBOPolicy([]), 'v-1').at(0)?.ruleDescription).toContain('Update vendor to "Vendor unavailable"');
        });

        it('preserves the raw external ID while the active vendor list is not hydrated', () => {
            expect(buildTableData(buildQBOPolicy(undefined), 'v-1').at(0)?.ruleDescription).toContain('Update vendor to "v-1"');
        });

        it('renders "Vendor unavailable" when no matching integration remains', () => {
            const description = buildTableData(createRandomPolicy(0), 'v-1').at(0)?.ruleDescription;
            expect(description).toContain('Update vendor to "Vendor unavailable"');
            expect(description).not.toContain('"v-1"');
        });

        it('shows "Vendor unavailable" when the vendorID only resolves against a stale/inactive connection', () => {
            // Active source is QBO (empty vendor list, so loaded). The rule's vendorID matches only the stale Xero
            // connection, which the active picker and violation logic ignore. The summary must not render the Xero
            // name as if the vendor were valid — it should surface the active-scoped "unavailable" copy instead.
            const policy = buildQBOWithStaleXeroPolicy([], {xeroVendor: {id: 'xeroVendor', name: 'Stale Xero Vendor', email: 'stale@example.com'}});
            const description = buildTableData(policy, 'xeroVendor').at(0)?.ruleDescription;
            expect(description).toContain('Update vendor to "Vendor unavailable"');
            expect(description).not.toContain('Stale Xero Vendor');
        });

        it('resolves the historical vendor name when the workspace has switched its export mode away from vendor-matching mode', () => {
            // Reproduces the reviewer-flagged case: rule was authored while QBO's non-reimbursable export was Credit Card
            // (vendor-matching active). Admin later switches to Vendor Bill, so QBO is no longer the active vendor-matching
            // source. The rule summary must still render the vendor's name — not the raw external ID — because the vendor
            // list is still known via the connection data.
            const policy = buildQBOWithVendorBillExportPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            expect(buildTableData(policy, 'v-1').at(0)?.ruleDescription).toContain('Update vendor to "Acme Co"');
        });

        it('uses "supplier" wording and "Supplier unavailable" on Xero workspaces', () => {
            const resolved = buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}});
            expect(buildTableData(resolved, 'xc1').at(0)?.ruleDescription).toContain('Update supplier to "Acme Xero"');

            expect(buildTableData(buildXeroPolicy({}), 'xc1').at(0)?.ruleDescription).toContain('Update supplier to "Supplier unavailable"');

            expect(buildTableData(buildXeroPolicy(undefined), 'xc1').at(0)?.ruleDescription).toContain('Update supplier to "xc1"');
        });
    });

    describe('legacy MerchantRulesSection.getRuleDescription vendor summary', () => {
        beforeEach(() => {
            IntlStore.load(CONST.LOCALES.EN);
            return waitForBatchedUpdates();
        });

        const buildLabels = (policy: Policy) => ({
            category: translateLocal('common.category').toLowerCase(),
            tag: translateLocal('common.tag').toLowerCase(),
            description: translateLocal('common.description').toLowerCase(),
            tax: translateLocal('common.tax').toLowerCase(),
            vendor: translateLocal(isXeroActiveMatchingSource(policy) ? 'common.supplier' : 'common.vendor').toLowerCase(),
        });

        const describeRule = (policy: Policy, vendorID: string) => getRuleDescription(buildVendorRule(policy, vendorID), translateLocal, buildLabels(policy), policy);

        it('resolves the vendor name when the vendor is in the loaded list', () => {
            const policy = buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            expect(describeRule(policy, 'v-1')).toContain('Update vendor to "Acme Co"');
        });

        it('shows "Vendor unavailable" when the list is loaded but the vendor is missing', () => {
            expect(describeRule(buildQBOPolicy([]), 'v-1')).toContain('Update vendor to "Vendor unavailable"');
        });

        it('preserves the raw external ID while the active vendor list is not hydrated', () => {
            expect(describeRule(buildQBOPolicy(undefined), 'v-1')).toContain('Update vendor to "v-1"');
        });

        it('renders "Vendor unavailable" when no matching integration remains', () => {
            const description = describeRule(createRandomPolicy(0), 'v-1');
            expect(description).toContain('Update vendor to "Vendor unavailable"');
            expect(description).not.toContain('"v-1"');
        });

        it('resolves the historical vendor name when the workspace has switched its export mode away from vendor-matching mode', () => {
            const policy = buildQBOWithVendorBillExportPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            expect(describeRule(policy, 'v-1')).toContain('Update vendor to "Acme Co"');
        });

        it('shows "Vendor unavailable" when the vendorID only resolves against a stale/inactive connection', () => {
            const policy = buildQBOWithStaleXeroPolicy([], {xeroVendor: {id: 'xeroVendor', name: 'Stale Xero Vendor', email: 'stale@example.com'}});
            const description = describeRule(policy, 'xeroVendor');
            expect(description).toContain('Update vendor to "Vendor unavailable"');
            expect(description).not.toContain('Stale Xero Vendor');
        });

        it('uses "supplier" wording and "Supplier unavailable" on Xero workspaces', () => {
            const resolved = buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}});
            expect(describeRule(resolved, 'xc1')).toContain('Update supplier to "Acme Xero"');

            const missing = buildXeroPolicy({});
            expect(describeRule(missing, 'xc1')).toContain('Update supplier to "Supplier unavailable"');

            const pendingHydration = buildXeroPolicy(undefined);
            expect(describeRule(pendingHydration, 'xc1')).toContain('Update supplier to "xc1"');
        });
    });

    describe('vendor row gating (hasVendorFeature governs MerchantRulePageBase row visibility)', () => {
        it('is visible when the beta is on and a vendor integration is connected', () => {
            expect(hasVendorFeature(buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]), true)).toBe(true);
        });

        it('is visible on QBO when the beta is off because QBO (R1) is generally available', () => {
            expect(hasVendorFeature(buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]), false)).toBe(true);
        });

        it('is hidden on Xero when the beta is off because Xero (R3) is still pre-GA', () => {
            expect(hasVendorFeature(buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}}), false)).toBe(false);
        });

        it('is hidden when no vendor integration is connected', () => {
            expect(hasVendorFeature(createRandomPolicy(0), true)).toBe(false);
        });
    });
});
