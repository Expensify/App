import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import SettlementButton from '.';

import type SettlementButtonProps from './types';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isPaidAnimationRunning: boolean;
    onAnimationFinish: () => void;
};

function AnimatedSettlementButton({isPaidAnimationRunning, onAnimationFinish, ...settlementButtonProps}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const buttonScale = useSharedValue(1);
    const buttonOpacity = useSharedValue(1);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const buttonMarginTop = useSharedValue<number>(styles.expenseAndReportPreviewTextButtonContainer.gap);
    const [isLoading, setIsLoading] = useState(false);
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

    const buttonStyles = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale.get()}],
        opacity: buttonOpacity.get(),
    }));
    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: buttonMarginTop.get(),
    }));
    const buttonDisabledStyle = isPaidAnimationRunning
        ? {
              opacity: 1,
              ...styles.cursorDefault,
          }
        : undefined;

    const resetAnimation = useCallback(() => {
        buttonScale.set(1);
        buttonOpacity.set(1);
        height.set(variables.componentSizeNormal);
        buttonMarginTop.set(styles.expenseAndReportPreviewTextButtonContainer.gap);
        setIsLoading(false);
    }, [buttonScale, buttonOpacity, height, buttonMarginTop, styles.expenseAndReportPreviewTextButtonContainer.gap]);

    useEffect(() => {
        if (!isPaidAnimationRunning) {
            resetAnimation();
            return;
        }
        setIsLoading(true);
        const spinnerTimer = setTimeout(() => {
            setIsLoading(false);

            // Animate out
            const totalDelay = CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;
            height.set(
                withDelay(
                    totalDelay,
                    withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}, () => runOnJS(onAnimationFinish)()),
                ),
            );
            buttonMarginTop.set(withDelay(totalDelay, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));
        }, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);

        return () => {
            clearTimeout(spinnerTimer);
        };
    }, [isPaidAnimationRunning, onAnimationFinish, height, buttonMarginTop, resetAnimation]);

    const handleLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const newWidth = event.nativeEvent.layout.width;
            if (newWidth !== buttonWidth) {
                setButtonWidth(newWidth);
            }
        },
        [buttonWidth],
    );
    return (
        <Animated.View style={containerStyles}>
            {isPaidAnimationRunning ? (
                <Animated.View style={[buttonStyles]}>
                    <Button
                        style={[styles.buttonMediumText, {width: buttonWidth}]}
                        text={translate('iou.paymentComplete')}
                        isLoading={isLoading}
                        success
                        icon={!isLoading ? Expensicons.Checkmark : undefined}
                    />
                </Animated.View>
            ) : (
                <Animated.View
                    style={buttonStyles}
                    onLayout={handleLayout}
                >
                    <SettlementButton
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...settlementButtonProps}
                        disabledStyle={buttonDisabledStyle}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
