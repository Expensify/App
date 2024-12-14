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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {ProductTrainingTooltipName} from './TOOLTIPS';
import TOOLTIPS from './TOOLTIPS';

// Context type definition
type ProductTrainingContextType = {
    shouldRenderTooltip: (tooltipName: ProductTrainingTooltipName) => boolean;
    registerTooltip: (tooltipName: ProductTrainingTooltipName) => void;
    unregisterTooltip: (tooltipName: ProductTrainingTooltipName) => void;
};

// Create Context with default values
const ProductTrainingContext = createContext<ProductTrainingContextType | null>(null);

function ProductTrainingContextProvider({children}: ChildrenProps) {
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT);
    const hasBeenAddedToNudgeMigration = !!tryNewDot?.nudgeMigration?.timestamp;
    const [isOnboardingCompleted = true, isOnboardingCompletedMetadata] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
    });
    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [activeTooltips, setActiveTooltips] = useState<Set<ProductTrainingTooltipName>>(new Set());

    const unregisterTooltip = useCallback((tooltipName: ProductTrainingTooltipName) => {
        setActiveTooltips((prev) => {
            const next = new Set(prev);
            next.delete(tooltipName);
            return next;
        });
    }, []);

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

        return sortedTooltips[0]?.name || null;
    }, [activeTooltips]);

    const shouldTooltipBeVisible = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            if (isLoadingOnyxValue(isOnboardingCompletedMetadata)) {
                return false;
            }

            if (dismissedProductTraining?.[tooltipName]) {
                return false;
            }

            const tooltipConfig = TOOLTIPS[tooltipName];
            if (!tooltipConfig) {
                console.warn(`Tooltip configuration for '${tooltipName}' not found.`);
                return false;
            }

            if (hasBeenAddedToNudgeMigration && !dismissedProductTraining?.[CONST.MIGRATED_USER_WELCOME_MODAL]) {
                return false;
            }

            if (!isOnboardingCompleted) {
                return false;
            }

            return tooltipConfig.shouldShow({shouldUseNarrowLayout});
        },
        [dismissedProductTraining, hasBeenAddedToNudgeMigration, isOnboardingCompleted, isOnboardingCompletedMetadata, shouldUseNarrowLayout],
    );

    const registerTooltip = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            if (shouldTooltipBeVisible(tooltipName)) {
                setActiveTooltips((prev) => new Set([...prev, tooltipName]));
            }
        },
        [shouldTooltipBeVisible],
    );

    const shouldRenderTooltip = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            if (!shouldTooltipBeVisible(tooltipName)) {
                return false;
            }

            return tooltipName === determineVisibleTooltip();
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

function useProductTrainingContext(tooltipName: ProductTrainingTooltipName, shouldShow = true) {
    const context = useContext(ProductTrainingContext);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    if (!context) {
        throw new Error('useProductTrainingContext must be used within a ProductTrainingContextProvider');
    }

    const {shouldRenderTooltip, registerTooltip, unregisterTooltip} = context;

    useEffect(() => {
        if (shouldShow) {
            registerTooltip(tooltipName);
            return () => unregisterTooltip(tooltipName);
        }
        return () => {};
    }, [tooltipName, registerTooltip, unregisterTooltip, shouldShow]);

    const renderProductTrainingTooltip = useCallback(() => {
        const tooltip = TOOLTIPS[tooltipName];
        if (!tooltip) {
            return null;
        }

        return (
            <View
                style={[
                    styles.alignItemsCenter,
                    styles.flexRow,
                    styles.justifyContentCenter,
                    styles.flexWrap,
                    styles.textAlignCenter,
                    styles.gap3,
                    styles.p2,
                ]}
            >
                <Icon src={Expensicons.Lightbulb} fill={theme.tooltipHighlightText} medium />
                <Text style={[styles.productTrainingTooltipText, styles.textWrap, styles.mw100]}>
                    {tooltip.content.map(({text, isBold}) => (
                        <Text
                            key={text}
                            style={[styles.productTrainingTooltipText, isBold && styles.textBold]}
                        >
                            {translate(text)}
                        </Text>
                    ))}
                </Text>
            </View>
        );
    }, [styles, theme.tooltipHighlightText, tooltipName, translate]);

    const shouldShowProductTrainingTooltip = useMemo(() => shouldRenderTooltip(tooltipName), [shouldRenderTooltip, tooltipName]);

    const hideProductTrainingTooltip = useCallback(() => {
        const tooltip = TOOLTIPS[tooltipName];
        if (tooltip?.onHideTooltip) {
            tooltip.onHideTooltip();
        }
        unregisterTooltip(tooltipName);
    }, [tooltipName, unregisterTooltip]);

    return {
        renderProductTrainingTooltip,
        hideProductTrainingTooltip,
        shouldShowProductTrainingTooltip,
    };
}

export {ProductTrainingContextProvider, useProductTrainingContext};
