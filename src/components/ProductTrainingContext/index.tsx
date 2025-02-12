import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
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

            const isDismissed = !!dismissedProductTraining?.[tooltipName];

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

            // We need to make an exception for the QAB tooltip because it is shown in a modal, otherwise it would be hidden if a modal is visible
            if (tooltipName !== CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.QUICK_ACTION_BUTTON && isModalVisible) {
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
        }
        return () => {
            unregisterTooltip(tooltipName);
        };
    }, [tooltipName, registerTooltip, unregisterTooltip, shouldShow]);

    const renderProductTrainingTooltip = useCallback(() => {
        const tooltip = TOOLTIPS[tooltipName];
        return (
            <View>
                <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter, styles.gap3, styles.p2]}>
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
                </View>
                {!!tooltip?.shouldRenderActionButtons && (
                    <View style={[styles.alignItemsCenter, styles.justifyContentBetween, styles.flexRow, styles.ph1, styles.pb1]}>
                        <Button
                            success
                            text={translate('productTrainingTooltip.scanTestTooltip.tryItOut')}
                            style={[styles.flex1, styles.ph1]}
                        />
                        <Button
                            text={translate('productTrainingTooltip.scanTestTooltip.noThanks')}
                            style={[styles.flex1, styles.ph1]}
                        />
                    </View>
                )}
            </View>
        );
    }, [
        styles.alignItemsCenter,
        styles.flex1,
        styles.flexRow,
        styles.flexWrap,
        styles.gap3,
        styles.justifyContentBetween,
        styles.justifyContentCenter,
        styles.mw100,
        styles.p2,
        styles.pb1,
        styles.ph1,
        styles.productTrainingTooltipText,
        styles.textAlignCenter,
        styles.textBold,
        styles.textWrap,
        theme.tooltipHighlightText,
        tooltipName,
        translate,
    ]);

    const shouldShowProductTrainingTooltip = useMemo(() => {
        return shouldShow && shouldRenderTooltip(tooltipName);
    }, [shouldRenderTooltip, tooltipName, shouldShow]);

    const hideProductTrainingTooltip = useCallback(() => {
        if (!shouldShowProductTrainingTooltip) {
            return;
        }
        const tooltip = TOOLTIPS[tooltipName];
        tooltip.onHideTooltip();
        unregisterTooltip(tooltipName);
    }, [tooltipName, shouldShowProductTrainingTooltip, unregisterTooltip]);

    return {
        renderProductTrainingTooltip,
        hideProductTrainingTooltip,
        shouldShowProductTrainingTooltip,
    };
};

export {ProductTrainingContextProvider, useProductTrainingContext};
