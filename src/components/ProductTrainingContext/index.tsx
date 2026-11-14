import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getActiveAdminWorkspaces, getActiveEmployeeWorkspaces, hasAnyPaidPolicy} from '@libs/PolicyUtils';
import isProductTrainingElementDismissed, {hasDismissalExpired} from '@libs/TooltipUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {isModalActiveSelector, isPopoverModalSelector} from '@selectors/Modal';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {View} from 'react-native';

import type {ProductTrainingTooltipName} from './TOOLTIPS';

import TOOLTIPS from './TOOLTIPS';

type ProductTrainingContextType = {
    /** The one tooltip allowed to render right now, or null when no registered tooltip may show */
    visibleTooltipName: ProductTrainingTooltipName | null;
    registerTooltip: (tooltipName: ProductTrainingTooltipName) => void;
    unregisterTooltip: (tooltipName: ProductTrainingTooltipName) => void;
};

type ProductTrainingContextConfig = {
    /**
     * Callback to be called when the tooltip is shown
     */
    onShown?: () => void;
};

const ProductTrainingContext = createContext<ProductTrainingContextType>({
    visibleTooltipName: null,
    registerTooltip: () => {},
    unregisterTooltip: () => {},
});

/**
 * Picks the highest-priority registered tooltip that passes the eligibility check, or null. Ties go to the one registered first.
 */
function getVisibleTooltipName(activeTooltips: Map<ProductTrainingTooltipName, number>, isEligible: (tooltipName: ProductTrainingTooltipName) => boolean): ProductTrainingTooltipName | null {
    let visibleTooltipName: ProductTrainingTooltipName | null = null;
    let highestPriority = -Infinity;
    for (const tooltipName of activeTooltips.keys()) {
        const priority = TOOLTIPS[tooltipName]?.priority ?? 0;
        if (priority <= highestPriority || !isEligible(tooltipName)) {
            continue;
        }
        visibleTooltipName = tooltipName;
        highestPriority = priority;
    }
    return visibleTooltipName;
}

function ProductTrainingContextProvider({children}: ChildrenProps) {
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;
    const [isOnboardingCompleted = true, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });

    const [allPolicies, allPoliciesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [currentUserLogin, currentUserLoginMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const shouldSuppressPromotionalUI = useShouldSuppressPromotionalUI();

    const isUserPolicyEmployee =
        !(!allPolicies || !currentUserLogin || isLoadingOnyxValue(allPoliciesMetadata, currentUserLoginMetadata)) && getActiveEmployeeWorkspaces(allPolicies, currentUserLogin).length > 0;

    const isUserPolicyAdmin =
        !(!allPolicies || !currentUserLogin || isLoadingOnyxValue(allPoliciesMetadata, currentUserLoginMetadata)) && getActiveAdminWorkspaces(allPolicies, currentUserLogin).length > 0;

    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [isModalVisible = false] = useOnyx(ONYXKEYS.MODAL, {selector: isModalActiveSelector});
    const [isPopoverModal = false] = useOnyx(ONYXKEYS.MODAL, {selector: isPopoverModalSelector});

    const [activeTooltips, setActiveTooltips] = useState<Map<ProductTrainingTooltipName, number>>(new Map());

    // Registration counts the consumers mounted with shouldShow per tooltip name, because several consumers can share a name.
    // Both callbacks must use nothing but the setter: consumers list them as effect dependencies, so a new identity would
    // unregister and re-register every tooltip on each provider render.
    const registerTooltip = (tooltipName: ProductTrainingTooltipName) => {
        setActiveTooltips((prev) => new Map(prev).set(tooltipName, (prev.get(tooltipName) ?? 0) + 1));
    };

    const unregisterTooltip = (tooltipName: ProductTrainingTooltipName) => {
        setActiveTooltips((prev) => {
            const count = prev.get(tooltipName);
            if (!count) {
                return prev;
            }
            const next = new Map(prev);
            if (count === 1) {
                next.delete(tooltipName);
            } else {
                next.set(tooltipName, count - 1);
            }
            return next;
        });
    };

    const isUserInPaidPolicy = !(!allPolicies || !currentUserLogin || isLoadingOnyxValue(allPoliciesMetadata, currentUserLoginMetadata)) && hasAnyPaidPolicy(allPolicies);

    const shouldTooltipBeVisible = (tooltipName: ProductTrainingTooltipName) => {
        if (isLoadingOnyxValue(isOnboardingCompletedMetadata) || isLoadingApp) {
            return false;
        }

        const tooltipConfig = TOOLTIPS[tooltipName];

        const isDismissed = isProductTrainingElementDismissed(tooltipName, dismissedProductTraining);

        // Tooltips with a reappear window are shown again once that long has passed since the last dismissal.
        const canReappear = !!tooltipConfig.reappearsAfterMs && hasDismissalExpired(tooltipName, dismissedProductTraining, tooltipConfig.reappearsAfterMs);

        if (isDismissed && !canReappear) {
            return false;
        }

        // if hasBeenAddedToNudgeMigration is true, and welcome modal is not dismissed, don't show tooltip
        if (hasBeenAddedToNudgeMigration && !dismissedProductTraining?.[CONST.MIGRATED_USER_WELCOME_MODAL]) {
            return false;
        }
        if (isOnboardingCompleted === false) {
            return false;
        }

        // Mileage rate tooltip is exempt from the general "hide when modal visible" rule so it can show on the confirmation surface.
        // Hide it when a popover or bottom sheet opens (e.g. inline date picker) since those set modal.isPopover.
        if (tooltipName === CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MILEAGE_RATE_AUTO_UPDATED && isModalVisible && isPopoverModal) {
            return false;
        }

        // We need to make an exception for these tooltips because it is shown in a modal, otherwise it would be hidden if a modal is visible
        if (
            tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_DRIVE_CONFIRMATION &&
            tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP &&
            tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.HAS_FILTER_NEGATION &&
            tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MILEAGE_RATE_AUTO_UPDATED &&
            isModalVisible
        ) {
            return false;
        }

        return tooltipConfig.shouldShow({
            shouldUseNarrowLayout,
            isUserPolicyEmployee,
            isUserPolicyAdmin,
            hasBeenAddedToNudgeMigration,
            isUserInPaidPolicy,
        });
    };

    // Supportal agents and copilots should not see product-training tooltips on behalf of another account.
    const visibleTooltipName = shouldSuppressPromotionalUI ? null : getVisibleTooltipName(activeTooltips, shouldTooltipBeVisible);

    const contextValue = {
        visibleTooltipName,
        registerTooltip,
        unregisterTooltip,
    };

    return <ProductTrainingContext.Provider value={contextValue}>{children}</ProductTrainingContext.Provider>;
}

const useProductTrainingContext = (tooltipName: ProductTrainingTooltipName, shouldShow = true, config: ProductTrainingContextConfig = {}) => {
    const context = useContext(ProductTrainingContext);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldHideToolTip} = useSidePanelState();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close', 'Lightbulb']);

    if (!context) {
        throw new Error('useProductTourContext must be used within a ProductTourProvider');
    }

    const {visibleTooltipName, registerTooltip, unregisterTooltip} = context;

    useEffect(() => {
        if (!shouldShow) {
            return;
        }
        registerTooltip(tooltipName);
        return () => {
            unregisterTooltip(tooltipName);
        };
    }, [tooltipName, registerTooltip, unregisterTooltip, shouldShow]);

    const shouldShowProductTrainingTooltip = shouldShow && tooltipName === visibleTooltipName && !shouldHideToolTip;

    const hideTooltip = (isDismissedUsingCloseButton = false) => {
        if (!shouldShowProductTrainingTooltip) {
            return;
        }
        const tooltip = TOOLTIPS[tooltipName];
        tooltip.onHideTooltip(isDismissedUsingCloseButton);
    };

    const renderProductTrainingTooltip = () => {
        const tooltip = TOOLTIPS[tooltipName];
        const content = typeof tooltip.content === 'function' ? tooltip.content() : tooltip.content;

        return (
            <View
                fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                onLayout={config.onShown}
            >
                <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.textAlignCenter, styles.gap3, styles.pv2, styles.ph2]}>
                    <Icon
                        src={expensifyIcons.Lightbulb}
                        fill={theme.tooltipHighlightText}
                        size={CONST.ICON_SIZE.MEDIUM}
                    />
                    <View style={[styles.renderHTML, styles.dFlex, styles.flexShrink1]}>
                        <RenderHTML html={translate(content)} />
                    </View>
                    <PressableWithoutFeedback
                        sentryLabel={CONST.SENTRY_LABEL.PRODUCT_TRAINING.TOOLTIP}
                        shouldUseAutoHitSlop
                        accessibilityLabel={translate('common.noThanks')}
                        role={CONST.ROLE.BUTTON}
                        onPress={() => hideTooltip(true)}
                    >
                        <Icon
                            src={expensifyIcons.Close}
                            fill={theme.icon}
                            width={variables.iconSizeSemiSmall}
                            height={variables.iconSizeSemiSmall}
                        />
                    </PressableWithoutFeedback>
                </View>
            </View>
        );
    };

    const hideProductTrainingTooltip = () => {
        hideTooltip(false);
    };

    return {
        renderProductTrainingTooltip,
        hideProductTrainingTooltip,
        shouldShowProductTrainingTooltip,
    };
};

export {ProductTrainingContextProvider, useProductTrainingContext};
