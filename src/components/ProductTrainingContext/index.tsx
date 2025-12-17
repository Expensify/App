import {isActingAsDelegateSelector} from '@selectors/Account';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanel from '@hooks/useSidePanel';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getActiveAdminWorkspaces, getActiveEmployeeWorkspaces, getGroupPaidPoliciesWithExpenseChatEnabled} from '@libs/PolicyUtils';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import createPressHandler from './createPressHandler';
import type {ProductTrainingTooltipName} from './TOOLTIPS';
import TOOLTIPS from './TOOLTIPS';

type ProductTrainingContextType = {
    shouldRenderTooltip: (tooltipName: ProductTrainingTooltipName) => boolean;
    registerTooltip: (tooltipName: ProductTrainingTooltipName) => void;
    unregisterTooltip: (tooltipName: ProductTrainingTooltipName) => void;
};

type ProductTrainingContextConfig = {
    /**
     * Callback to be called when the tooltip is dismissed
     */
    onDismiss?: () => void;

    /**
     * Callback to be called when the tooltip is confirmed
     */
    onConfirm?: () => void;
};

const ProductTrainingContext = createContext<ProductTrainingContextType>({
    shouldRenderTooltip: () => false,
    registerTooltip: () => {},
    unregisterTooltip: () => {},
});

function ProductTrainingContextProvider({children}: ChildrenProps) {
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;
    const [isOnboardingCompleted = true, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
        canBeMissing: true,
    });

    const [allPolicies, allPoliciesMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [currentUserLogin, currentUserLoginMetadata] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isActingAsDelegateSelector, canBeMissing: true});

    const isUserPolicyEmployee = useMemo(() => {
        if (!allPolicies || !currentUserLogin || isLoadingOnyxValue(allPoliciesMetadata, currentUserLoginMetadata)) {
            return false;
        }
        return getActiveEmployeeWorkspaces(allPolicies, currentUserLogin).length > 0;
    }, [allPolicies, currentUserLogin, allPoliciesMetadata, currentUserLoginMetadata]);

    const isUserPolicyAdmin = useMemo(() => {
        if (!allPolicies || !currentUserLogin || isLoadingOnyxValue(allPoliciesMetadata, currentUserLoginMetadata)) {
            return false;
        }
        return getActiveAdminWorkspaces(allPolicies, currentUserLogin).length > 0;
    }, [allPolicies, currentUserLogin, allPoliciesMetadata, currentUserLoginMetadata]);

    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const isModalVisible = modal?.isVisible || modal?.willAlertModalBecomeVisible;

    const [activeTooltips, setActiveTooltips] = useState<Set<ProductTrainingTooltipName>>(new Set());

    const unregisterTooltip = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            setActiveTooltips((prev) => {
                const next = new Set(prev);
                next.delete(tooltipName);
                return next;
            });
        },
        [setActiveTooltips],
    );

    const determineVisibleTooltip = useCallback(() => {
        if (activeTooltips.size === 0) {
            return null;
        }

        const sortedTooltips = Array.from(activeTooltips)
            .map((name) => ({
                name,
                priority: TOOLTIPS[name]?.priority ?? 0,
            }))
            .sort((a, b) => b.priority - a.priority);

        const highestPriorityTooltip = sortedTooltips.at(0);

        if (!highestPriorityTooltip) {
            return null;
        }

        return highestPriorityTooltip.name;
    }, [activeTooltips]);

    const isUserInPaidPolicy = useMemo(() => {
        if (!allPolicies || !currentUserLogin || isLoadingOnyxValue(allPoliciesMetadata, currentUserLoginMetadata)) {
            return false;
        }
        return getGroupPaidPoliciesWithExpenseChatEnabled(allPolicies).length > 0;
    }, [allPolicies, currentUserLogin, allPoliciesMetadata, currentUserLoginMetadata]);

    const shouldTooltipBeVisible = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            if (isLoadingOnyxValue(isOnboardingCompletedMetadata) || isLoadingApp) {
                return false;
            }

            const isDismissed = isProductTrainingElementDismissed(tooltipName, dismissedProductTraining);

            if (isDismissed) {
                return false;
            }
            const tooltipConfig = TOOLTIPS[tooltipName];

            // if hasBeenAddedToNudgeMigration is true, and welcome modal is not dismissed, don't show tooltip
            if (hasBeenAddedToNudgeMigration && !dismissedProductTraining?.[CONST.MIGRATED_USER_WELCOME_MODAL]) {
                return false;
            }
            if (isOnboardingCompleted === false) {
                return false;
            }

            // We need to make an exception for these tooltips because it is shown in a modal, otherwise it would be hidden if a modal is visible
            if (
                tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP &&
                tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP_MANAGER &&
                tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_CONFIRMATION &&
                tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_DRIVE_CONFIRMATION &&
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
        },
        [
            isOnboardingCompletedMetadata,
            isLoadingApp,
            dismissedProductTraining,
            hasBeenAddedToNudgeMigration,
            isOnboardingCompleted,
            isModalVisible,
            shouldUseNarrowLayout,
            isUserPolicyEmployee,
            isUserPolicyAdmin,
            isUserInPaidPolicy,
        ],
    );

    const registerTooltip = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            const shouldRegister = shouldTooltipBeVisible(tooltipName);
            if (!shouldRegister) {
                return;
            }
            setActiveTooltips((prev) => new Set([...prev, tooltipName]));
        },
        [shouldTooltipBeVisible],
    );

    const shouldRenderTooltip = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            // If the user is acting as a copilot, don't show any tooltips
            if (isActingAsDelegate) {
                return false;
            }
            // First check base conditions
            const shouldShow = shouldTooltipBeVisible(tooltipName);
            if (!shouldShow) {
                return false;
            }
            const visibleTooltip = determineVisibleTooltip();

            // If this is the highest priority visible tooltip, show it
            if (tooltipName === visibleTooltip) {
                return true;
            }

            return false;
        },
        [isActingAsDelegate, shouldTooltipBeVisible, determineVisibleTooltip],
    );

    const contextValue = useMemo(
        () => ({
            shouldRenderTooltip,
            registerTooltip,
            unregisterTooltip,
        }),
        [shouldRenderTooltip, registerTooltip, unregisterTooltip],
    );

    return <ProductTrainingContext.Provider value={contextValue}>{children}</ProductTrainingContext.Provider>;
}

const useProductTrainingContext = (tooltipName: ProductTrainingTooltipName, shouldShow = true, config: ProductTrainingContextConfig = {}) => {
    const context = useContext(ProductTrainingContext);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldHideToolTip} = useSidePanel();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lightbulb']);

    if (!context) {
        throw new Error('useProductTourContext must be used within a ProductTourProvider');
    }

    const {shouldRenderTooltip, registerTooltip, unregisterTooltip} = context;

    useEffect(() => {
        if (!shouldShow) {
            return;
        }
        registerTooltip(tooltipName);
        return () => {
            unregisterTooltip(tooltipName);
        };
    }, [tooltipName, registerTooltip, unregisterTooltip, shouldShow]);

    const shouldShowProductTrainingTooltip = useMemo(() => {
        return shouldShow && shouldRenderTooltip(tooltipName) && !shouldHideToolTip;
    }, [shouldRenderTooltip, tooltipName, shouldShow, shouldHideToolTip]);

    const hideTooltip = useCallback(
        (isDismissedUsingCloseButton = false) => {
            if (!shouldShowProductTrainingTooltip) {
                return;
            }
            const tooltip = TOOLTIPS[tooltipName];
            tooltip.onHideTooltip(isDismissedUsingCloseButton);
            unregisterTooltip(tooltipName);
        },
        [tooltipName, shouldShowProductTrainingTooltip, unregisterTooltip],
    );

    const renderProductTrainingTooltip = useCallback(() => {
        const tooltip = TOOLTIPS[tooltipName];
        return (
            <View fsClass={CONST.FULLSTORY.CLASS.UNMASK}>
                <View
                    style={[
                        styles.alignItemsCenter,
                        styles.flexRow,
                        tooltip?.shouldRenderActionButtons ? styles.justifyContentStart : styles.justifyContentCenter,
                        styles.textAlignCenter,
                        styles.gap3,
                        styles.pv2,
                        styles.ph2,
                    ]}
                >
                    <Icon
                        src={expensifyIcons.Lightbulb}
                        fill={theme.tooltipHighlightText}
                        medium
                    />
                    <View style={[styles.renderHTML, styles.dFlex, styles.flexShrink1]}>
                        <RenderHTML html={translate(tooltip.content)} />
                    </View>
                    {!tooltip?.shouldRenderActionButtons && (
                        <PressableWithoutFeedback
                            shouldUseAutoHitSlop
                            accessibilityLabel={translate('common.noThanks')}
                            role={CONST.ROLE.BUTTON}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...createPressHandler(() => hideTooltip(true))}
                        >
                            <Icon
                                src={Expensicons.Close}
                                fill={theme.icon}
                                width={variables.iconSizeSemiSmall}
                                height={variables.iconSizeSemiSmall}
                            />
                        </PressableWithoutFeedback>
                    )}
                </View>
                {!!tooltip?.shouldRenderActionButtons && (
                    <View style={[styles.alignItemsCenter, styles.justifyContentBetween, styles.flexRow, styles.ph2, styles.pv2, styles.gap2]}>
                        <Button
                            success
                            text={translate('productTrainingTooltip.scanTestTooltip.tryItOut')}
                            style={[styles.flex1]}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...createPressHandler(config.onConfirm)}
                        />
                        <Button
                            text={translate('common.noThanks')}
                            style={[styles.flex1]}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...createPressHandler(config.onDismiss)}
                        />
                    </View>
                )}
            </View>
        );
    }, [
        tooltipName,
        styles.alignItemsCenter,
        styles.flexRow,
        styles.justifyContentStart,
        styles.justifyContentCenter,
        styles.textAlignCenter,
        styles.gap3,
        styles.pv2,
        styles.flex1,
        styles.justifyContentBetween,
        styles.ph2,
        styles.gap2,
        styles.renderHTML,
        styles.dFlex,
        styles.flexShrink1,
        theme.tooltipHighlightText,
        theme.icon,
        translate,
        config.onConfirm,
        config.onDismiss,
        hideTooltip,
        expensifyIcons.Lightbulb,
    ]);

    const hideProductTrainingTooltip = useCallback(() => {
        hideTooltip(false);
    }, [hideTooltip]);

    return {
        renderProductTrainingTooltip,
        hideProductTrainingTooltip,
        shouldShowProductTrainingTooltip,
    };
};

export {ProductTrainingContextProvider, useProductTrainingContext};
