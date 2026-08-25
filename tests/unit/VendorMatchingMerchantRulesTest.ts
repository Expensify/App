import {mapFormFieldsToRuleForAPI, mapFormFieldsToRuleForOnyx} from '@libs/actions/Policy/Rules';
import {getMerchantCodingRulesTableData} from '@libs/MerchantTypeRulesUtils';
import {hasVendorFeature, isXeroActiveMatchingSource} from '@libs/PolicyUtils';

import {getRuleDescription} from '@pages/workspace/rules/MerchantRulesSection';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {MerchantRuleForm} from '@src/types/form/MerchantRuleForm';
import type {Policy} from '@src/types/onyx';
import type {CodingRule, Connections} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

const withCodingRules = (policy: Policy, codingRules: Record<string, CodingRule>): Policy => ({...policy, rules: {...policy.rules, codingRules}});

const buildVendorRule = (vendorID: string): CodingRule => ({
    filters: {left: 'merchant', operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: 'Coffee Shop'},
    vendorID,
});

describe('Vendor matching on merchant rules', () => {
    describe('mapFormFieldsToRuleForOnyx', () => {
        it('serializes a set vendorID', () => {
            expect(mapFormFieldsToRuleForOnyx(buildForm({vendorID: 'v-1'}), undefined).vendorID).toBe('v-1');
        });

        it('serializes an unset vendorID to null so Onyx merge clears it', () => {
            expect(mapFormFieldsToRuleForOnyx(buildForm({vendorID: ''}), undefined).vendorID).toBeNull();
        });
    });

    describe('mapFormFieldsToRuleForAPI', () => {
        it('includes vendorID when set', () => {
            expect(mapFormFieldsToRuleForAPI(buildForm({vendorID: 'v-1'}), undefined).vendorID).toBe('v-1');
        });

        it('omits vendorID entirely when unset (never sends null)', () => {
            const rule = mapFormFieldsToRuleForAPI(buildForm({vendorID: ''}), undefined);
            expect('vendorID' in rule).toBe(false);
        });
    });

    describe('getMerchantCodingRulesTableData vendor summary', () => {
        beforeEach(() => {
            IntlStore.load(CONST.LOCALES.EN);
            return waitForBatchedUpdates();
        });

        const buildTableData = (policy: Policy) =>
            getMerchantCodingRulesTableData({
                policy,
                policyID: policy.id,
                translate: translateLocal,
                isOffline: false,
                onNavigate: () => {},
            });

        it('resolves the vendor name when the vendor is in the loaded list', () => {
            const policy = withCodingRules(buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]), {rule1: buildVendorRule('v-1')});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('Update vendor to "Acme Co"');
        });

        it('shows "Vendor unavailable" when the list is loaded but the vendor is missing', () => {
            const policy = withCodingRules(buildQBOPolicy([]), {rule1: buildVendorRule('v-1')});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('Update vendor to "Vendor unavailable"');
        });

        it('preserves the raw external ID while the active vendor list is not hydrated', () => {
            const policy = withCodingRules(buildQBOPolicy(undefined), {rule1: buildVendorRule('v-1')});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('Update vendor to "v-1"');
        });

        it('renders "Vendor unavailable" when no matching integration remains', () => {
            const policy = withCodingRules(createRandomPolicy(0), {rule1: buildVendorRule('v-1')});
            const description = buildTableData(policy).at(0)?.ruleDescription;
            expect(description).toContain('Update vendor to "Vendor unavailable"');
            expect(description).not.toContain('"v-1"');
        });

        it('shows "Vendor unavailable" when the vendorID only resolves against a stale/inactive connection', () => {
            // Active source is QBO (empty vendor list, so loaded). The rule's vendorID matches only the stale Xero
            // connection, which the active picker and violation logic ignore. The summary must not render the Xero
            // name as if the vendor were valid — it should surface the active-scoped "unavailable" copy instead.
            const policy = withCodingRules(buildQBOWithStaleXeroPolicy([], {xeroVendor: {id: 'xeroVendor', name: 'Stale Xero Vendor', email: 'stale@example.com'}}), {
                rule1: buildVendorRule('xeroVendor'),
            });
            const description = buildTableData(policy).at(0)?.ruleDescription;
            expect(description).toContain('Update vendor to "Vendor unavailable"');
            expect(description).not.toContain('Stale Xero Vendor');
        });

        it('resolves the historical vendor name when the workspace has switched its export mode away from vendor-matching mode', () => {
            // Reproduces the reviewer-flagged case: rule was authored while QBO's non-reimbursable export was Credit Card
            // (vendor-matching active). Admin later switches to Vendor Bill, so QBO is no longer the active vendor-matching
            // source. The rule summary must still render the vendor's name — not the raw external ID — because the vendor
            // list is still known via the connection data.
            const policy = withCodingRules(buildQBOWithVendorBillExportPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]), {rule1: buildVendorRule('v-1')});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('Update vendor to "Acme Co"');
        });

        it('uses "supplier" wording and "Supplier unavailable" on Xero workspaces', () => {
            const resolved = withCodingRules(buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}}), {rule1: buildVendorRule('xc1')});
            expect(buildTableData(resolved).at(0)?.ruleDescription).toContain('Update supplier to "Acme Xero"');

            const missing = withCodingRules(buildXeroPolicy({}), {rule1: buildVendorRule('xc1')});
            expect(buildTableData(missing).at(0)?.ruleDescription).toContain('Update supplier to "Supplier unavailable"');

            const pendingHydration = withCodingRules(buildXeroPolicy(undefined), {rule1: buildVendorRule('xc1')});
            expect(buildTableData(pendingHydration).at(0)?.ruleDescription).toContain('Update supplier to "xc1"');
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

        const describeRule = (policy: Policy, vendorID: string) => getRuleDescription(buildVendorRule(vendorID), translateLocal, buildLabels(policy), policy);

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
