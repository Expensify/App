import React, {createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePane from '@hooks/useSidePane';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {parseFSAttributes} from '@libs/Fullstory';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import isProductTrainingElementDismissed from '@libs/TooltipUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT);
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;
    const [isOnboardingCompleted = true, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });

    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [modal] = useOnyx(ONYXKEYS.MODAL);
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
                isModalVisible
            ) {
                return false;
            }

            return tooltipConfig.shouldShow({
                shouldUseNarrowLayout,
            });
        },
        [dismissedProductTraining, hasBeenAddedToNudgeMigration, isOnboardingCompleted, isOnboardingCompletedMetadata, shouldUseNarrowLayout, isModalVisible, isLoadingApp],
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
        [shouldTooltipBeVisible, determineVisibleTooltip],
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
    const {shouldHideToolTip} = useSidePane();
    const {translate} = useLocalize();

    if (!context) {
        throw new Error('useProductTourContext must be used within a ProductTourProvider');
    }

    const {shouldRenderTooltip, registerTooltip, unregisterTooltip} = context;

    useEffect(() => {
        if (shouldShow) {
            registerTooltip(tooltipName);
        }
        return () => {
            unregisterTooltip(tooltipName);
        };
    }, [tooltipName, registerTooltip, unregisterTooltip, shouldShow]);

    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    useLayoutEffect(parseFSAttributes, []);

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
            <View
                fsClass={CONST.FULL_STORY.UNMASK}
                testID={CONST.FULL_STORY.UNMASK}
            >
                <View
                    style={[
                        styles.alignItemsCenter,
                        styles.flexRow,
                        tooltip?.shouldRenderActionButtons ? styles.justifyContentStart : styles.justifyContentCenter,
                        styles.flexWrap,
                        styles.textAlignCenter,
                        styles.gap3,
                        styles.pv2,
                        styles.ph1,
                    ]}
                >
                    <Icon
                        src={Expensicons.Lightbulb}
                        fill={theme.tooltipHighlightText}
                        medium
                    />
                    <Text style={[styles.productTrainingTooltipText, styles.textWrap, styles.mw100]}>
                        {tooltip.content.map(({text, isBold}) => {
                            const translatedText = translate(text);
                            return (
                                <Text
                                    key={text}
                                    style={[styles.productTrainingTooltipText, isBold && styles.textBold]}
                                >
                                    {translatedText}
                                </Text>
                            );
                        })}
                    </Text>
                    {!tooltip?.shouldRenderActionButtons && (
                        <PressableWithoutFeedback
                            onPress={() => {
                                hideTooltip(true);
                            }}
                            shouldUseAutoHitSlop
                            accessibilityLabel={translate('productTrainingTooltip.scanTestTooltip.noThanks')}
                            role={CONST.ROLE.BUTTON}
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
                            onPress={config.onConfirm}
                        />
                        <Button
                            text={translate('productTrainingTooltip.scanTestTooltip.noThanks')}
                            style={[styles.flex1]}
                            onPress={config.onDismiss}
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
        styles.flexWrap,
        styles.textAlignCenter,
        styles.gap3,
        styles.pv2,
        styles.ph1,
        styles.productTrainingTooltipText,
        styles.textWrap,
        styles.mw100,
        styles.flex1,
        styles.justifyContentBetween,
        styles.ph2,
        styles.gap2,
        styles.textBold,
        theme.tooltipHighlightText,
        theme.icon,
        translate,
        config.onConfirm,
        config.onDismiss,
        hideTooltip,
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
