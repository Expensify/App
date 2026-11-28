import {isSubscriptionTypeOfInvoicing, shouldUseSimplifiedCollectSubscriptionUI} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import type {SubscriptionType} from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {PersonalPolicyTypeExcludedProps} from './SubscriptionPlanCard';

type ExpensifyCodeMenu = ValueOf<typeof CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU>;

type SubscriptionTypeLabel = ValueOf<typeof CONST.SUBSCRIPTION.PLAN_CARD.TYPE_LABEL>;

type AutoRenewToggleAction = ValueOf<typeof CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION>;

type SubscriptionPlanCardViewInput = {
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null;
    hasTeam2025Pricing: boolean;
    subscriptionType: SubscriptionType | undefined;
    userCount: number | undefined;
    promoCode: string | undefined;
    isSecretPromoCode: boolean;
    isTaxExempt: boolean;
    isFromComparisonModal: boolean;
    /** False on native, where the size, code, and auto-renew survey screens are Not Found. */
    canEditInApp: boolean;
};

type SubscriptionPlanCardView = {
    /** Interactive settings body. Comparison modal and invoiced subscriptions keep the existing card. */
    showSettings: boolean;
    showAnnualControls: boolean;
    showAnnualSavingsInfo: boolean;
    canEditSize: boolean;
    canToggleAnnualSettings: boolean;
    subscriptionTypeLabel: SubscriptionTypeLabel;
    memberCount: number;
    showSizeNotSetHelper: boolean;
    showExpensifyCodeBadge: boolean;
    showTaxExemptBadge: boolean;
    expensifyCodeMenu: ExpensifyCodeMenu;
    includeRequestTaxExempt: boolean;
};

type AutoRenewToggleInput = {
    isActingAsDelegate: boolean;
    autoRenew: boolean;
    hasPurchases: boolean | undefined;
};

/** Every invoiced subscription hides the settings block. The details page is Not Found for all invoicing types. */
function shouldHideSubscriptionSettings(subscriptionType: SubscriptionType | undefined): boolean {
    return isSubscriptionTypeOfInvoicing(subscriptionType);
}

function shouldShowSubscriptionPlanSettings({isFromComparisonModal, subscriptionType}: Pick<SubscriptionPlanCardViewInput, 'isFromComparisonModal' | 'subscriptionType'>): boolean {
    if (isFromComparisonModal) {
        return false;
    }

    return !shouldHideSubscriptionSettings(subscriptionType);
}

/**
 * What the Your plan card shows for the current subscription.
 * Annual size and toggles stay off for pay-per-use and New Collect, even when a leftover userCount or annual type is still stored.
 */
function getSubscriptionPlanCardView({
    subscriptionPlan,
    hasTeam2025Pricing,
    subscriptionType,
    userCount,
    promoCode,
    isSecretPromoCode,
    isTaxExempt,
    isFromComparisonModal,
    canEditInApp,
}: SubscriptionPlanCardViewInput): SubscriptionPlanCardView {
    const isNewCollect = shouldUseSimplifiedCollectSubscriptionUI(subscriptionPlan, hasTeam2025Pricing);
    const isAnnual = subscriptionType === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const showSettings = shouldShowSubscriptionPlanSettings({isFromComparisonModal, subscriptionType});
    const showAnnualControls = showSettings && isAnnual && !isNewCollect;
    const showAnnualSavings = showSettings && subscriptionType === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE && !isNewCollect;
    // An applied code cannot be replaced from the card. Classic does not let a customer swap codes after one is applied.
    const hasAppliedCode = !!promoCode || isSecretPromoCode;
    const expensifyCodeMenu: ExpensifyCodeMenu =
        !showSettings || !canEditInApp || hasAppliedCode ? CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.HIDDEN : CONST.SUBSCRIPTION.PLAN_CARD.CODE_MENU.ADD;

    return {
        showSettings,
        showAnnualControls,
        showAnnualSavingsInfo: showAnnualSavings,
        canEditSize: canEditInApp,
        canToggleAnnualSettings: canEditInApp,
        subscriptionTypeLabel: isNewCollect || !isAnnual ? CONST.SUBSCRIPTION.PLAN_CARD.TYPE_LABEL.PAY_PER_USE : CONST.SUBSCRIPTION.PLAN_CARD.TYPE_LABEL.ANNUAL,
        memberCount: userCount ?? 0,
        showSizeNotSetHelper: showAnnualControls && !userCount,
        showExpensifyCodeBadge: hasAppliedCode,
        showTaxExemptBadge: isTaxExempt,
        expensifyCodeMenu,
        includeRequestTaxExempt: showSettings,
    };
}

/**
 * Same auto-renew outcome as the subscription details toggle: delegates are blocked, enabling writes immediately,
 * and disabling with purchases opens the survey.
 */
function getAutoRenewToggleAction({isActingAsDelegate, autoRenew, hasPurchases}: AutoRenewToggleInput): AutoRenewToggleAction {
    if (isActingAsDelegate) {
        return CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.DELEGATE;
    }

    if (!autoRenew) {
        return CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.ENABLE;
    }

    if (hasPurchases) {
        return CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.SURVEY;
    }

    return CONST.SUBSCRIPTION.PLAN_CARD.AUTO_RENEW_ACTION.DISABLE;
}

export {getAutoRenewToggleAction, getSubscriptionPlanCardView, shouldShowSubscriptionPlanSettings};
