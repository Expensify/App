import {getAutoRenewToggleAction, getSubscriptionPlanCardView} from '@pages/settings/Subscription/SubscriptionPlan/getSubscriptionPlanCardView';

import CONST from '@src/CONST';
import en from '@src/languages/en';

const controlPlan = CONST.POLICY.TYPE.CORPORATE;
const collectPlan = CONST.POLICY.TYPE.TEAM;

const editableWeb = {
    canEditInApp: true,
    isTouchDevice: false,
};

describe('getSubscriptionPlanCardView', () => {
    it('shows annual type, member count, and toggles for an annual Control subscription', () => {
        const view = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });

        expect(view.showSettings).toBe(true);
        expect(view.subscriptionTypeLabel).toBe('annual');
        expect(view.memberCount).toBe(12);
        expect(view.showAnnualControls).toBe(true);
        expect(view.showSizeNotSetHelper).toBe(false);
        expect(view.showAnnualSavingsTooltip).toBe(false);
        expect(view.showAnnualSavingsHint).toBe(false);
        expect(view.canEditSize).toBe(true);
        expect(view.canToggleAnnualSettings).toBe(true);
        expect(en.subscription.subscriptionSettings.memberCount({count: view.memberCount}).other).toBe('12 members');
        expect(en.subscription.subscriptionSettings).not.toHaveProperty('summary');
        expect(en.subscription.subscriptionSettings).not.toHaveProperty('editExpensifyCode');
    });

    it('pluralizes one member and shows the size helper for a missing or zero size', () => {
        expect(en.subscription.subscriptionSettings.memberCount({count: 1}).one).toBe('1 member');
        expect(en.subscription.subscriptionSettings.memberCount({count: 0}).other).toBe('0 members');
        expect(en.subscription.subscriptionSettings.sizeNotSet).not.toContain('none');

        const missingSize = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: undefined,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });
        const zeroSize = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 0,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });

        expect(missingSize.memberCount).toBe(0);
        expect(missingSize.showSizeNotSetHelper).toBe(true);
        expect(zeroSize.memberCount).toBe(0);
        expect(zeroSize.showSizeNotSetHelper).toBe(true);
    });

    it('hides size and toggles for pay-per-use even when a leftover userCount is stored', () => {
        const view = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.PAY_PER_USE,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });

        expect(view.subscriptionTypeLabel).toBe('payPerUse');
        expect(view.showAnnualControls).toBe(false);
        expect(view.showSizeNotSetHelper).toBe(false);
        expect(view.showAnnualSavingsTooltip).toBe(true);
        expect(view.showAnnualSavingsHint).toBe(false);
    });

    it('shows the savings hint instead of the tooltip on a touch device', () => {
        const view = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.PAY_PER_USE,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            canEditInApp: true,
            isTouchDevice: true,
        });

        expect(view.showAnnualSavingsTooltip).toBe(false);
        expect(view.showAnnualSavingsHint).toBe(true);
    });

    it('shows only pay-per-use for New Collect, including when the stored type is still annual', () => {
        const view = getSubscriptionPlanCardView({
            subscriptionPlan: collectPlan,
            hasTeam2025Pricing: true,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });

        expect(view.subscriptionTypeLabel).toBe('payPerUse');
        expect(view.showAnnualControls).toBe(false);
        expect(view.showAnnualSavingsTooltip).toBe(false);
        expect(view.showAnnualSavingsHint).toBe(false);
    });

    it('offers Add only when no code is applied, and keeps the badge and tax-exempt request', () => {
        const base = {
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            isFromComparisonModal: false,
            ...editableWeb,
        };

        const noCode = getSubscriptionPlanCardView({...base, promoCode: undefined, isSecretPromoCode: false, isTaxExempt: false});
        const visibleCode = getSubscriptionPlanCardView({...base, promoCode: 'SAVE20', isSecretPromoCode: false, isTaxExempt: true});
        const secretCode = getSubscriptionPlanCardView({...base, promoCode: 'SECRET', isSecretPromoCode: true, isTaxExempt: false});

        expect(noCode.expensifyCodeMenu).toBe('add');
        expect(noCode.showExpensifyCodeBadge).toBe(false);

        expect(visibleCode.expensifyCodeMenu).toBe('hidden');
        expect(visibleCode.showExpensifyCodeBadge).toBe(true);
        expect(visibleCode.showTaxExemptBadge).toBe(true);
        expect(visibleCode.includeRequestTaxExempt).toBe(true);

        expect(secretCode.expensifyCodeMenu).toBe('hidden');
        expect(secretCode.showExpensifyCodeBadge).toBe(false);
        expect(secretCode.includeRequestTaxExempt).toBe(true);
    });

    it('keeps native annual plans read-only, including the code menu', () => {
        const view = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            canEditInApp: false,
            isTouchDevice: true,
        });

        expect(view.showSettings).toBe(true);
        expect(view.showAnnualControls).toBe(true);
        expect(view.canEditSize).toBe(false);
        expect(view.canToggleAnnualSettings).toBe(false);
        expect(view.expensifyCodeMenu).toBe('hidden');
        expect(view.includeRequestTaxExempt).toBe(true);
    });

    it('keeps settings off the comparison modal and off every invoiced subscription', () => {
        const comparison = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: true,
            ...editableWeb,
        });
        const invoiced = getSubscriptionPlanCardView({
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.INVOICING,
            userCount: undefined,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });
        const invoicedNewCollect = getSubscriptionPlanCardView({
            subscriptionPlan: collectPlan,
            hasTeam2025Pricing: true,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.INVOICING,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        });

        expect(comparison.showSettings).toBe(false);
        expect(comparison.showAnnualControls).toBe(false);
        expect(invoiced.showSettings).toBe(false);
        expect(invoiced.showAnnualControls).toBe(false);
        expect(invoicedNewCollect.showSettings).toBe(false);
        expect(invoicedNewCollect.expensifyCodeMenu).toBe('hidden');
        expect(invoicedNewCollect.includeRequestTaxExempt).toBe(false);
    });
});

describe('getAutoRenewToggleAction', () => {
    it('enables immediately, opens the survey when purchases exist, and blocks delegates', () => {
        expect(getAutoRenewToggleAction({isActingAsDelegate: false, autoRenew: false, hasPurchases: true})).toBe('enable');
        expect(getAutoRenewToggleAction({isActingAsDelegate: false, autoRenew: true, hasPurchases: true})).toBe('survey');
        expect(getAutoRenewToggleAction({isActingAsDelegate: false, autoRenew: true, hasPurchases: false})).toBe('disable');
        expect(getAutoRenewToggleAction({isActingAsDelegate: true, autoRenew: true, hasPurchases: false})).toBe('delegate');
    });
});
