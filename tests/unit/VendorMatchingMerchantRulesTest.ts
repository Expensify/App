import {mapFormFieldsToRuleForAPI, mapFormFieldsToRuleForOnyx} from '@libs/actions/Policy/Rules';
import {getMerchantCodingRulesTableData} from '@libs/MerchantTypeRulesUtils';
import {hasVendorFeature} from '@libs/PolicyUtils';

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

/** Xero policy whose supplier list scopes vendor matching to Xero (label flips vendor -> supplier). */
const buildXeroPolicy = (contacts: Record<string, {id: string; name: string; email: string}>): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                config: {isConfigured: true},
                data: {contacts},
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

        it('falls back to the raw external ID while the list is not yet loaded', () => {
            const policy = withCodingRules(buildQBOPolicy(undefined), {rule1: buildVendorRule('v-1')});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('Update vendor to "v-1"');
        });

        it('uses "supplier" wording and "Supplier unavailable" on Xero workspaces', () => {
            const resolved = withCodingRules(buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}}), {rule1: buildVendorRule('xc1')});
            expect(buildTableData(resolved).at(0)?.ruleDescription).toContain('Update supplier to "Acme Xero"');

            const missing = withCodingRules(buildXeroPolicy({}), {rule1: buildVendorRule('xc1')});
            expect(buildTableData(missing).at(0)?.ruleDescription).toContain('Update supplier to "Supplier unavailable"');
        });
    });

    describe('vendor row gating (hasVendorFeature governs MerchantRulePageBase row visibility)', () => {
        it('is visible when the beta is on and a vendor integration is connected', () => {
            expect(hasVendorFeature(buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]), true)).toBe(true);
        });

        it('is hidden when the beta is off', () => {
            expect(hasVendorFeature(buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]), false)).toBe(false);
        });

        it('is hidden when no vendor integration is connected', () => {
            expect(hasVendorFeature(createRandomPolicy(0), true)).toBe(false);
        });
    });
});
