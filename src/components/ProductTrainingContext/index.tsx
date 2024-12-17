import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import Permissions from '@libs/Permissions';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {ProductTrainingTooltipName} from './PRODUCT_TRAINING_TOOLTIP_DATA';
import PRODUCT_TRAINING_TOOLTIP_DATA from './PRODUCT_TRAINING_TOOLTIP_DATA';

type ProductTrainingContextType = {
    shouldRenderTooltip: (tooltipName: ProductTrainingTooltipName) => boolean;
    registerTooltip: (tooltipName: ProductTrainingTooltipName) => void;
    unregisterTooltip: (tooltipName: ProductTrainingTooltipName) => void;
};

const ProductTrainingContext = createContext<ProductTrainingContextType>({
    shouldRenderTooltip: () => false,
    registerTooltip: () => {},
    unregisterTooltip: () => {},
});

function ProductTrainingContextProvider({children}: ChildrenProps) {
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT);
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;
    const [isOnboardingCompleted = true] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

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
                priority: PRODUCT_TRAINING_TOOLTIP_DATA[name]?.priority ?? 0,
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
            const isDismissed = !!dismissedProductTraining?.[tooltipName];

            if (isDismissed || !Permissions.shouldShowProductTrainingElements(allBetas)) {
                return false;
            }
            const tooltipConfig = PRODUCT_TRAINING_TOOLTIP_DATA[tooltipName];

            if (!isOnboardingCompleted && !hasBeenAddedToNudgeMigration) {
                return false;
            }

            return tooltipConfig.shouldShow({
                shouldUseNarrowLayout,
            });
        },
        [allBetas, dismissedProductTraining, hasBeenAddedToNudgeMigration, isOnboardingCompleted, shouldUseNarrowLayout],
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

const useProductTrainingContext = (tooltipName: ProductTrainingTooltipName, shouldShow = true) => {
    const context = useContext(ProductTrainingContext);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    if (!context) {
        throw new Error('useProductTourContext must be used within a ProductTourProvider');
    }

    const {shouldRenderTooltip, registerTooltip, unregisterTooltip} = context;

    useEffect(() => {
        if (shouldShow) {
            registerTooltip(tooltipName);
            return () => {
                unregisterTooltip(tooltipName);
            };
        }
        return () => {};
    }, [tooltipName, registerTooltip, unregisterTooltip, shouldShow]);

    const renderProductTrainingTooltip = useCallback(() => {
        const tooltip = PRODUCT_TRAINING_TOOLTIP_DATA[tooltipName];
        return (
            <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter, styles.gap1, styles.p2]}>
                <Icon
                    src={Expensicons.Lightbulb}
                    fill={theme.tooltipHighlightText}
                    medium
                />
                <Text style={[styles.quickActionTooltipSubtitle]}>
                    {tooltip.content.map(({text, isBold}) => {
                        const translatedText = translate(text);
                        return (
                            <Text
                                key={text}
                                style={[styles.quickActionTooltipSubtitle, isBold && styles.textBold]}
                            >
                                {translatedText}
                            </Text>
                        );
                    })}
                </Text>
            </View>
        );
    }, [
        styles.alignItemsCenter,
        styles.flexRow,
        styles.flexWrap,
        styles.gap1,
        styles.justifyContentCenter,
        styles.p2,
        styles.quickActionTooltipSubtitle,
        styles.textAlignCenter,
        styles.textBold,
        theme.tooltipHighlightText,
        tooltipName,
        translate,
    ]);

    const shouldShowProductTrainingTooltip = useMemo(() => {
        return shouldRenderTooltip(tooltipName);
    }, [shouldRenderTooltip, tooltipName]);

    const hideProductTrainingTooltip = useCallback(() => {
        const tooltip = PRODUCT_TRAINING_TOOLTIP_DATA[tooltipName];
        tooltip.onHideTooltip();
        unregisterTooltip(tooltipName);
    }, [tooltipName, unregisterTooltip]);

    return {
        renderProductTrainingTooltip,
        hideProductTrainingTooltip,
        shouldShowProductTrainingTooltip: shouldShow && shouldShowProductTrainingTooltip,
    };
};

export {ProductTrainingContextProvider, useProductTrainingContext};
