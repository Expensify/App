import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import {hasCompletedGuidedSetupFlowSelector} from '@libs/onboardingSelectors';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import PRODUCT_TRAINING_TOOLTIP_DATA from './PRODUCT_TRAINING_TOOLTIP_DATA';

type ProductTrainingTooltipName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

type ProductTrainingContextType = {
    shouldRenderTooltip: (tooltipName: ProductTrainingTooltipName) => boolean;
    renderProductTrainingTooltip: (tooltipName: ProductTrainingTooltipName) => React.ReactNode | null;
    registerTooltip: (tooltipName: ProductTrainingTooltipName) => void;
    unregisterTooltip: (tooltipName: ProductTrainingTooltipName) => void;
};

const ProductTrainingContext = createContext<ProductTrainingContextType>({
    shouldRenderTooltip: () => false,
    renderProductTrainingTooltip: () => null,
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
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();

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

            if (isDismissed) {
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
        [dismissedProductTraining, hasBeenAddedToNudgeMigration, isOnboardingCompleted, shouldUseNarrowLayout],
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

    const renderProductTrainingTooltip = useCallback(
        (tooltipName: ProductTrainingTooltipName) => {
            const tooltip = PRODUCT_TRAINING_TOOLTIP_DATA[tooltipName];
            if (!tooltip) {
                return null;
            }
            const processedContent = () => {
                const content = convertToLTR(translate(tooltip.content as TranslationPaths));

                return content ? `<comment>${content}</comment>` : '';
            };
            return (
                <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter, styles.gap1, styles.p2]}>
                    <Icon
                        src={Expensicons.Lightbulb}
                        fill={theme.tooltipHighlightText}
                        medium
                    />
                    <Text style={styles.renderHTMLTitle}>
                        <RenderHTML html={processedContent()} />
                    </Text>
                </View>
            );
        },
        [styles, theme.tooltipHighlightText, translate],
    );

    const contextValue = useMemo(
        () => ({
            renderProductTrainingTooltip,
            shouldRenderTooltip,
            registerTooltip,
            unregisterTooltip,
        }),
        [shouldRenderTooltip, registerTooltip, unregisterTooltip, renderProductTrainingTooltip],
    );

    return <ProductTrainingContext.Provider value={contextValue}>{children}</ProductTrainingContext.Provider>;
}

const useProductTrainingContext = (tooltipName?: ProductTrainingTooltipName) => {
    const context = useContext(ProductTrainingContext);
    if (!context) {
        throw new Error('useProductTourContext must be used within a ProductTourProvider');
    }

    const {shouldRenderTooltip, registerTooltip, unregisterTooltip, renderProductTrainingTooltip} = context;

    useEffect(() => {
        if (tooltipName) {
            registerTooltip(tooltipName);
            return () => {
                unregisterTooltip(tooltipName);
            };
        }
        return undefined;
    }, [tooltipName, registerTooltip, unregisterTooltip]);

    const shouldShowProductTrainingTooltip = useMemo(() => {
        if (!tooltipName) {
            return false;
        }
        return shouldRenderTooltip(tooltipName);
    }, [tooltipName, shouldRenderTooltip]);

    const hideProductTrainingTooltip = useCallback(() => {
        if (!tooltipName) {
            return;
        }
        const tooltip = PRODUCT_TRAINING_TOOLTIP_DATA[tooltipName];
        tooltip.onHideTooltip();
        unregisterTooltip(tooltipName);
    }, [tooltipName, unregisterTooltip]);

    if (!tooltipName) {
        return {
            renderProductTrainingTooltip: () => null,
            hideProductTrainingTooltip: () => {},
            shouldShowProductTrainingTooltip: false,
        };
    }

    return {
        renderProductTrainingTooltip: () => renderProductTrainingTooltip(tooltipName),
        hideProductTrainingTooltip,
        shouldShowProductTrainingTooltip,
    };
};

export {ProductTrainingContextProvider, useProductTrainingContext};
