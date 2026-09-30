import {isSubscriptionTypeOfInvoicing, shouldUseSimplifiedCollectSubscriptionUI} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import type {SubscriptionType} from '@src/CONST';

import type {PersonalPolicyTypeExcludedProps} from './SubscriptionPlanCard';

type ExpensifyCodeMenu = 'add' | 'edit' | 'hidden';

type SubscriptionTypeLabel = 'annual' | 'payPerUse';

type AutoRenewToggleAction = 'delegate' | 'enable' | 'survey' | 'disable';

type SubscriptionPlanCardViewInput = {
    subscriptionPlan: PersonalPolicyTypeExcludedProps | null;
    hasTeam2025Pricing: boolean;
    subscriptionType: SubscriptionType | undefined;
    userCount: number | undefined;
    promoCode: string | undefined;
    isSecretPromoCode: boolean;
    isTaxExempt: boolean;
    isFromComparisonModal: boolean;
};

type SubscriptionPlanCardView = {
    /** Interactive settings body. Comparison modal and invoiced subscriptions keep the existing card. */
    showSettings: boolean;
    showAnnualControls: boolean;
    showAnnualSavingsTooltip: boolean;
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

/**
 * Invoiced subscriptions hide the settings block, except New Collect, matching the card's previous gate.
 */
function shouldHideSubscriptionSettings(subscriptionType: SubscriptionType | undefined, subscriptionPlan: PersonalPolicyTypeExcludedProps | null, hasTeam2025Pricing: boolean): boolean {
    return isSubscriptionTypeOfInvoicing(subscriptionType) && ((subscriptionPlan === CONST.POLICY.TYPE.TEAM && !hasTeam2025Pricing) || subscriptionPlan !== CONST.POLICY.TYPE.TEAM);
}

function shouldShowSubscriptionPlanSettings({
    isFromComparisonModal,
    subscriptionType,
    subscriptionPlan,
    hasTeam2025Pricing,
}: Pick<SubscriptionPlanCardViewInput, 'isFromComparisonModal' | 'subscriptionType' | 'subscriptionPlan' | 'hasTeam2025Pricing'>): boolean {
    if (isFromComparisonModal) {
        return false;
    }

    return !shouldHideSubscriptionSettings(subscriptionType, subscriptionPlan, hasTeam2025Pricing);
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
}: SubscriptionPlanCardViewInput): SubscriptionPlanCardView {
    const isNewCollect = shouldUseSimplifiedCollectSubscriptionUI(subscriptionPlan, hasTeam2025Pricing);
    const isAnnual = subscriptionType === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const showSettings = shouldShowSubscriptionPlanSettings({isFromComparisonModal, subscriptionType, subscriptionPlan, hasTeam2025Pricing});
    const showAnnualControls = showSettings && isAnnual && !isNewCollect;
    const hasVisiblePromoCode = !!promoCode && !isSecretPromoCode;

    let expensifyCodeMenu: ExpensifyCodeMenu = 'add';
    if (isSecretPromoCode) {
        expensifyCodeMenu = 'hidden';
    } else if (hasVisiblePromoCode) {
        expensifyCodeMenu = 'edit';
    }

    return {
        showSettings,
        showAnnualControls,
        showAnnualSavingsTooltip: showSettings && subscriptionType === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE && !isNewCollect,
        subscriptionTypeLabel: isNewCollect || !isAnnual ? 'payPerUse' : 'annual',
        memberCount: userCount ?? 0,
        showSizeNotSetHelper: showAnnualControls && !userCount,
        showExpensifyCodeBadge: hasVisiblePromoCode,
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
        return 'delegate';
    }

    if (!autoRenew) {
        return 'enable';
    }

    if (hasPurchases) {
        return 'survey';
    }

    return 'disable';
}

export {getAutoRenewToggleAction, getSubscriptionPlanCardView, shouldShowSubscriptionPlanSettings};
export type {AutoRenewToggleAction, ExpensifyCodeMenu, SubscriptionPlanCardView, SubscriptionPlanCardViewInput};
