import {getAutoRenewToggleAction, getSubscriptionPlanCardView} from '@pages/settings/Subscription/SubscriptionPlan/getSubscriptionPlanCardView';

import CONST from '@src/CONST';
import en from '@src/languages/en';

const controlPlan = CONST.POLICY.TYPE.CORPORATE;
const collectPlan = CONST.POLICY.TYPE.TEAM;

const editableWeb = {
    canEditInApp: true,
};

describe('getSubscriptionPlanCardView', () => {
    it('shows annual type, member count, and toggles for an annual Control subscription', () => {
        // Given an annual Control plan that already has a subscription size, because that is the editable annual card
        const input = {
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            promoCode: undefined,
            isSecretPromoCode: false,
            isTaxExempt: false,
            isFromComparisonModal: false,
            ...editableWeb,
        };

        // When the plan card view is built for desktop web
        const view = getSubscriptionPlanCardView(input);

        // Then the card keeps annual controls and a member count, because the owner can still edit that annual plan
        expect(view.showSettings).toBe(true);
        expect(view.subscriptionTypeLabel).toBe(CONST.SUBSCRIPTION.PLAN_CARD.TYPE_LABEL.ANNUAL);
        expect(view.memberCount).toBe(12);
        expect(view.showAnnualControls).toBe(true);
        expect(view.showSizeNotSetHelper).toBe(false);
        expect(view.showAnnualSavingsInfo).toBe(false);
        expect(view.canEditSize).toBe(true);
        expect(view.canToggleAnnualSettings).toBe(true);
        expect(en.subscription.subscriptionSettings.memberCount({count: view.memberCount}).other).toBe('12 members');
        expect(en.subscription.subscriptionSettings).not.toHaveProperty('summary');
        expect(en.subscription.subscriptionSettings.editExpensifyCode).toBe('Edit Expensify code');
    });

    it('pluralizes one member and shows the size helper for a missing or zero size', () => {
        // Given English plural copy, because a missing size must not fall back to the word none
        expect(en.subscription.subscriptionSettings.memberCount({count: 1}).one).toBe('1 member');
        expect(en.subscription.subscriptionSettings.memberCount({count: 0}).other).toBe('0 members');
        expect(en.subscription.subscriptionSettings.sizeNotSet).not.toContain('none');

        // When an annual Control plan has no size or a stored size of zero
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

        // Then both cases show 0 members and the size helper, because the owner still needs to choose a size
        expect(missingSize.memberCount).toBe(0);
        expect(missingSize.showSizeNotSetHelper).toBe(true);
        expect(zeroSize.memberCount).toBe(0);
        expect(zeroSize.showSizeNotSetHelper).toBe(true);
    });

    it('hides size and toggles for pay-per-use even when a leftover userCount is stored', () => {
        // Given a Control plan that switched to pay-per-use but still has a stored seat count
        // When the plan card view is built
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

        // Then size and toggles stay hidden and the savings info stays available, because a leftover count is not an annual plan
        expect(view.subscriptionTypeLabel).toBe(CONST.SUBSCRIPTION.PLAN_CARD.TYPE_LABEL.PAY_PER_USE);
        expect(view.showAnnualControls).toBe(false);
        expect(view.showSizeNotSetHelper).toBe(false);
        expect(view.showAnnualSavingsInfo).toBe(true);
    });

    it('shows only pay-per-use for New Collect, including when the stored type is still annual', () => {
        // Given a New Collect workspace whose stored subscription type is still annual
        // When the plan card view is built
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

        // Then the card is pay-per-use only, because New Collect cannot buy an annual subscription
        expect(view.subscriptionTypeLabel).toBe(CONST.SUBSCRIPTION.PLAN_CARD.TYPE_LABEL.PAY_PER_USE);
        expect(view.showAnnualControls).toBe(false);
        expect(view.showAnnualSavingsInfo).toBe(false);
    });

    it('offers Add with no code and hides the code menu once a code is applied', () => {
        // Given annual Control plans with no code, a visible code, and a secret code
        const base = {
            subscriptionPlan: controlPlan,
            hasTeam2025Pricing: false,
            subscriptionType: CONST.SUBSCRIPTION.TYPE.ANNUAL,
            userCount: 12,
            isFromComparisonModal: false,
            ...editableWeb,
        };

        // When each code state is turned into a plan card view
        const noCode = getSubscriptionPlanCardView({...base, promoCode: undefined, isSecretPromoCode: false, isTaxExempt: false});
        const visibleCode = getSubscriptionPlanCardView({...base, promoCode: 'SAVE20', isSecretPromoCode: false, isTaxExempt: true});
        const secretCode = getSubscriptionPlanCardView({...base, promoCode: 'SECRET', isSecretPromoCode: true, isTaxExempt: false});

        // Then Add is offered only with no code. A secret code still shows a badge, but the code string stays off the card and the menu stays hidden.
        expect(noCode.expensifyCodeMenu).toBe(CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.ADD);
        expect(noCode.showExpensifyCodeBadge).toBe(false);

        expect(visibleCode.expensifyCodeMenu).toBe(CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.HIDDEN);
        expect(visibleCode.showExpensifyCodeBadge).toBe(true);
        expect(visibleCode.showTaxExemptBadge).toBe(true);
        expect(visibleCode.includeRequestTaxExempt).toBe(true);

        expect(secretCode.expensifyCodeMenu).toBe(CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.HIDDEN);
        expect(secretCode.showExpensifyCodeBadge).toBe(true);
        expect(secretCode.includeRequestTaxExempt).toBe(true);
    });

    it('keeps native annual plans read-only, including the code menu', () => {
        // Given an annual Control plan opened in the native app, because those editors are Not Found screens
        // When the plan card view is built
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
        });

        // Then size, toggles, and Add code stay locked, because native cannot open those pages
        expect(view.showSettings).toBe(true);
        expect(view.showAnnualControls).toBe(true);
        expect(view.canEditSize).toBe(false);
        expect(view.canToggleAnnualSettings).toBe(false);
        expect(view.expensifyCodeMenu).toBe(CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.HIDDEN);
        expect(view.includeRequestTaxExempt).toBe(true);
    });

    it('keeps settings off the comparison modal and off every invoiced subscription', () => {
        // Given the plan comparison modal, an invoiced Control plan, and invoiced New Collect
        // When each plan card view is built
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

        // Then the settings card stays hidden, because invoiced customers and the comparison modal have no editable settings block
        expect(comparison.showSettings).toBe(false);
        expect(comparison.showAnnualControls).toBe(false);
        expect(invoiced.showSettings).toBe(false);
        expect(invoiced.showAnnualControls).toBe(false);
        expect(invoicedNewCollect.showSettings).toBe(false);
        expect(invoicedNewCollect.expensifyCodeMenu).toBe(CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.HIDDEN);
        expect(invoicedNewCollect.includeRequestTaxExempt).toBe(false);
    });
});

describe('getAutoRenewToggleAction', () => {
    it('enables immediately, opens the survey when purchases exist, and blocks delegates', () => {
        // Given a billing owner turning auto-renew on, a paying owner turning it off, and a delegate
        // When each auto-renew action is chosen
        // Then enabling writes immediately, disabling with purchases opens the survey, and a delegate is blocked
        expect(getAutoRenewToggleAction({isActingAsDelegate: false, autoRenew: false, hasPurchases: true})).toBe(CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.ENABLE);
        expect(getAutoRenewToggleAction({isActingAsDelegate: false, autoRenew: true, hasPurchases: true})).toBe(CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.SURVEY);
        expect(getAutoRenewToggleAction({isActingAsDelegate: false, autoRenew: true, hasPurchases: false})).toBe(CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.DISABLE);
        expect(getAutoRenewToggleAction({isActingAsDelegate: true, autoRenew: true, hasPurchases: false})).toBe(CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.DELEGATE);
    });
});
