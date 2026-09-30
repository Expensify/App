import {getCategoryTaxRulesTableData, hasSelectableCategoryTaxRate, isSelectableTaxRate} from '@libs/CategoryTaxRulesUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';
import type {ExpenseRule, TaxRate} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CATEGORY_NAME = 'Travel';
const TAX_ID = 'id_TAX_RATE_1';
const DEFAULT_TAX_ID = 'id_TAX_EXEMPT';

/** A saved category tax rule, which stores the rate as an ID with no label of its own. */
const buildCategoryTaxRule = (taxID: string): ExpenseRule => ({
    tax: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: {externalID: taxID},
    },
    applyWhen: [
        {
            condition: CONST.POLICY.RULE_CONDITIONS.MATCHES,
            field: CONST.POLICY.FIELDS.CATEGORY,
            value: CATEGORY_NAME,
        },
    ],
});

/** A policy holding one category tax rule, with `taxes` describing which rates the workspace still has. */
const buildPolicy = (taxes: Record<string, TaxRate>, expenseRules: ExpenseRule[] = [buildCategoryTaxRule(TAX_ID)]): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        taxRates: {
            name: 'Taxes',
            defaultExternalID: DEFAULT_TAX_ID,
            defaultValue: '0%',
            foreignTaxDefault: DEFAULT_TAX_ID,
            taxes,
        },
        rules: {expenseRules},
    });

const buildTableData = (policy: Policy) =>
    getCategoryTaxRulesTableData({
        policy,
        policyCategories: {[CATEGORY_NAME]: createMock({name: CATEGORY_NAME, enabled: true})},
        translate: translateLocal,
        isOffline: false,
        onNavigate: () => {},
    });

describe('CategoryTaxRulesUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    describe('hasSelectableCategoryTaxRate', () => {
        /** `hasSelectableCategoryTaxRate` reads tracking as well as the rates, so this states it rather than leaving it to the random policy. */
        const buildTaxTrackingPolicy = (taxes: Record<string, TaxRate>, trackingEnabled = true): Policy =>
            createMock<Policy>({
                ...buildPolicy(taxes),
                tax: {trackingEnabled},
            });

        it('is true when a rate other than the workspace default is enabled', () => {
            const policy = buildTaxTrackingPolicy({
                [DEFAULT_TAX_ID]: createMock<TaxRate>({name: 'Tax exempt', value: '0%'}),
                [TAX_ID]: createMock<TaxRate>({name: 'VAT', value: '5%'}),
            });
            expect(hasSelectableCategoryTaxRate(policy)).toBe(true);
        });

        it('is false when the workspace default is the only rate left', () => {
            const policy = buildTaxTrackingPolicy({[DEFAULT_TAX_ID]: createMock<TaxRate>({name: 'Tax exempt', value: '0%'})});
            expect(hasSelectableCategoryTaxRate(policy)).toBe(false);
        });

        it('is false when every other rate is disabled', () => {
            const policy = buildTaxTrackingPolicy({
                [DEFAULT_TAX_ID]: createMock<TaxRate>({name: 'Tax exempt', value: '0%'}),
                [TAX_ID]: createMock<TaxRate>({name: 'VAT', value: '5%', isDisabled: true}),
            });
            expect(hasSelectableCategoryTaxRate(policy)).toBe(false);
        });

        it('is false when every other rate is being deleted', () => {
            const policy = buildTaxTrackingPolicy({
                [DEFAULT_TAX_ID]: createMock<TaxRate>({name: 'Tax exempt', value: '0%'}),
                [TAX_ID]: createMock<TaxRate>({name: 'VAT', value: '5%', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            });
            expect(hasSelectableCategoryTaxRate(policy)).toBe(false);
        });

        it('is false with tax tracking off, whatever rates the workspace holds', () => {
            const policy = buildTaxTrackingPolicy({[TAX_ID]: createMock<TaxRate>({name: 'VAT', value: '5%'})}, false);
            expect(hasSelectableCategoryTaxRate(policy)).toBe(false);
        });
    });

    describe('isSelectableTaxRate', () => {
        it('offers the workspace default to a merchant rule but not to a category rule', () => {
            const policy = buildPolicy({[DEFAULT_TAX_ID]: createMock<TaxRate>({name: 'Tax exempt', value: '0%'})});
            const defaultRate = createMock<TaxRate>({name: 'Tax exempt', value: '0%'});
            expect(isSelectableTaxRate(policy, DEFAULT_TAX_ID, defaultRate, false)).toBe(true);
            expect(isSelectableTaxRate(policy, DEFAULT_TAX_ID, defaultRate, true)).toBe(false);
        });
    });

    describe('getCategoryTaxRulesTableData', () => {
        it('names the rate the rule holds', () => {
            const policy = buildPolicy({[TAX_ID]: createMock<TaxRate>({name: 'VAT', value: '5%'})});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('VAT (5%)');
        });

        it('reads the rename rather than the label saved when the rule was created', () => {
            const policy = buildPolicy({[TAX_ID]: createMock<TaxRate>({name: 'VAT renamed', value: '7%'})});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('VAT renamed (7%)');
        });

        it('never shows the raw tax ID once the rate has left the workspace', () => {
            // A category tax rule stores only the ID, so with the rate gone there is nothing to name it from. The row
            // has to read as unset, the way the editor it opens does, rather than printing the ID at the admin.
            const row = buildTableData(buildPolicy({})).at(0);
            expect(row).toBeDefined();
            expect(row?.ruleDescription).not.toContain(TAX_ID);
            expect(row?.searchTokens).not.toContain(TAX_ID);
        });

        it('still lists the rule when its rate is disabled, since the rule keeps applying it', () => {
            const policy = buildPolicy({[TAX_ID]: createMock<TaxRate>({name: 'VAT', value: '5%', isDisabled: true})});
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('VAT (5%)');
        });

        it('still lists the rule when its rate has become the workspace default', () => {
            const policy = buildPolicy({[DEFAULT_TAX_ID]: createMock<TaxRate>({name: 'Tax exempt', value: '0%'})}, [buildCategoryTaxRule(DEFAULT_TAX_ID)]);
            expect(buildTableData(policy).at(0)?.ruleDescription).toContain('Tax exempt (0%)');
        });
    });
});
