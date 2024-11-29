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

type ProductTrainingElementName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

type ProductTrainingContextType = {
    shouldRenderElement: (elementName: ProductTrainingElementName) => boolean;
    renderProductTrainingElement: (elementName: ProductTrainingElementName) => React.ReactNode | null;
    registerTooltip: (elementName: ProductTrainingElementName) => void;
    unregisterTooltip: (elementName: ProductTrainingElementName) => void;
};

const ProductTrainingContext = createContext<ProductTrainingContextType>({
    shouldRenderElement: () => false,
    renderProductTrainingElement: () => null,
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

    // Track active tooltips
    const [activeTooltips, setActiveTooltips] = useState<Set<ProductTrainingElementName>>(new Set());

    const unregisterTooltip = useCallback(
        (elementName: ProductTrainingElementName) => {
            setActiveTooltips((prev) => {
                const next = new Set(prev);
                next.delete(elementName);
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
        (elementName: ProductTrainingElementName) => {
            const isDismissed = !!dismissedProductTraining?.[elementName];

            const tooltipConfig = PRODUCT_TRAINING_TOOLTIP_DATA[elementName];

            return tooltipConfig.shouldShow({
                isDismissed,
                isOnboardingCompleted,
                hasBeenAddedToNudgeMigration,
                shouldUseNarrowLayout,
            });
        },
        [dismissedProductTraining, hasBeenAddedToNudgeMigration, isOnboardingCompleted, shouldUseNarrowLayout],
    );

    const registerTooltip = useCallback(
        (elementName: ProductTrainingElementName) => {
            const shouldRegister = shouldTooltipBeVisible(elementName);
            if (!shouldRegister) {
                return;
            }
            setActiveTooltips((prev) => new Set([...prev, elementName]));
        },
        [shouldTooltipBeVisible],
    );

    const shouldRenderElement = useCallback(
        (elementName: ProductTrainingElementName) => {
            // First check base conditions
            const shouldShow = shouldTooltipBeVisible(elementName);
            if (!shouldShow) {
                return false;
            }
            const visibleTooltip = determineVisibleTooltip();

            // If this is the highest priority visible tooltip, show it
            if (elementName === visibleTooltip) {
                return true;
            }

            return false;
        },
        [shouldTooltipBeVisible, determineVisibleTooltip],
    );

    const renderProductTourElement = useCallback(
        (elementName: ProductTrainingElementName) => {
            const element = PRODUCT_TRAINING_TOOLTIP_DATA[elementName];
            if (!element) {
                return null;
            }
            const processedContent = () => {
                const content = convertToLTR(translate(element.content as TranslationPaths));

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
        [
            styles.alignItemsCenter,
            styles.flexRow,
            styles.flexWrap,
            styles.gap1,
            styles.justifyContentCenter,
            styles.p2,
            styles.renderHTMLTitle,
            styles.textAlignCenter,
            theme.tooltipHighlightText,
            translate,
        ],
    );

    const contextValue = useMemo(
        () => ({
            renderProductTrainingElement: renderProductTourElement,
            shouldRenderElement,
            registerTooltip,
            unregisterTooltip,
        }),
        [shouldRenderElement, registerTooltip, unregisterTooltip, renderProductTourElement],
    );

    return <ProductTrainingContext.Provider value={contextValue}>{children}</ProductTrainingContext.Provider>;
}

const useProductTrainingContext = (elementName?: ProductTrainingElementName) => {
    const context = useContext(ProductTrainingContext);
    if (!context) {
        throw new Error('useProductTourContext must be used within a ProductTourProvider');
    }

    const {shouldRenderElement, registerTooltip, unregisterTooltip, renderProductTrainingElement} = context;

    // Register this tooltip when the component mounts and unregister when it unmounts
    useEffect(() => {
        if (elementName) {
            registerTooltip(elementName);
            return () => {
                unregisterTooltip(elementName);
            };
        }
        return undefined;
    }, [elementName, registerTooltip, unregisterTooltip]);

    const shouldShowProductTrainingElement = useMemo(() => {
        if (!elementName) {
            return false;
        }
        return shouldRenderElement(elementName);
    }, [elementName, shouldRenderElement]);

    const hideElement = useCallback(() => {
        if (!elementName) {
            return;
        }
        const element = PRODUCT_TRAINING_TOOLTIP_DATA[elementName];
        if (element?.onHideElement) {
            element.onHideElement();
        }
        unregisterTooltip(elementName);
    }, [elementName, unregisterTooltip]);

    if (!elementName) {
        return {
            renderProductTourElement: () => null,
            hideElement: () => {},
            shouldShowProductTrainingElement: false,
        };
    }

    return {
        renderProductTourElement: () => renderProductTrainingElement(elementName),
        hideElement,
        shouldShowProductTrainingElement,
    };
};

export {ProductTrainingContextProvider, useProductTrainingContext};
