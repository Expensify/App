import {isSubscriptionTypeOfInvoicing, shouldUseSimplifiedCollectSubscriptionUI} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import type {SubscriptionType} from '@src/CONST';

import type {PersonalPolicyTypeExcludedProps} from './SubscriptionPlanCard';

type ExpensifyCodeMenu = 'add' | 'hidden';

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
    /** False on native, where the size, code, and auto-renew survey screens are Not Found. */
    canEditInApp: boolean;
    /** Touch devices cannot open the hover tooltip, so they get an inline hint instead. */
    isTouchDevice: boolean;
};

type SubscriptionPlanCardView = {
    /** Interactive settings body. Comparison modal and invoiced subscriptions keep the existing card. */
    showSettings: boolean;
    showAnnualControls: boolean;
    showAnnualSavingsTooltip: boolean;
    showAnnualSavingsHint: boolean;
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
    isTouchDevice,
}: SubscriptionPlanCardViewInput): SubscriptionPlanCardView {
    const isNewCollect = shouldUseSimplifiedCollectSubscriptionUI(subscriptionPlan, hasTeam2025Pricing);
    const isAnnual = subscriptionType === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const showSettings = shouldShowSubscriptionPlanSettings({isFromComparisonModal, subscriptionType});
    const showAnnualControls = showSettings && isAnnual && !isNewCollect;
    const hasVisiblePromoCode = !!promoCode && !isSecretPromoCode;
    const showAnnualSavings = showSettings && subscriptionType === CONST.SUBSCRIPTION.TYPE.PAY_PER_USE && !isNewCollect;

    return {
        showSettings,
        showAnnualControls,
        showAnnualSavingsTooltip: showAnnualSavings && !isTouchDevice,
        showAnnualSavingsHint: showAnnualSavings && isTouchDevice,
        canEditSize: canEditInApp,
        canToggleAnnualSettings: canEditInApp,
        subscriptionTypeLabel: isNewCollect || !isAnnual ? 'payPerUse' : 'annual',
        memberCount: userCount ?? 0,
        showSizeNotSetHelper: showAnnualControls && !userCount,
        showExpensifyCodeBadge: hasVisiblePromoCode,
        showTaxExemptBadge: isTaxExempt,
        expensifyCodeMenu: showSettings && canEditInApp && !promoCode ? 'add' : 'hidden',
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
