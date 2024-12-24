import React, {useCallback, useEffect, useState} from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SettlementButton from '.';
import type SettlementButtonProps from './types';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isPaidAnimationRunning: boolean;
    onAnimationFinish: () => void;
    isApprovedAnimationRunning: boolean;
    canIOUBePaid: boolean;
};

function AnimatedSettlementButton({
    isPaidAnimationRunning,
    onAnimationFinish,
    isApprovedAnimationRunning,
    isDisabled,
    canIOUBePaid,
    ...settlementButtonProps
}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const buttonScale = useSharedValue(1);
    const buttonOpacity = useSharedValue(1);
    const [isLoading, setIsLoading] = useState(false);
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);

    const buttonStyles = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale.get()}],
        opacity: buttonOpacity.get(),
    }));

    const containerStyles = useAnimatedStyle(() => ({
        justifyContent: 'center',
        overflow: 'hidden',
    }));

    const buttonDisabledStyle =
        isPaidAnimationRunning || isApprovedAnimationRunning
            ? {
                  opacity: 1,
                  ...styles.cursorDefault,
              }
            : undefined;

    const resetAnimation = useCallback(() => {
        buttonScale.set(1);
        buttonOpacity.set(1);
        setIsLoading(false);
    }, [buttonScale, buttonOpacity]);

    useEffect(() => {
        if (!isApprovedAnimationRunning && !isPaidAnimationRunning) {
            resetAnimation();
            return;
        }

        setIsLoading(true);

        const spinnerTimer = setTimeout(() => {
            setIsLoading(false);
            const willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;

            buttonScale.set(
                withDelay(
                    CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY,
                    withTiming(willShowPaymentButton ? variables.componentSizeNormal : 0, {duration: CONST.ANIMATION_PAID_DURATION}, () => runOnJS(onAnimationFinish)()),
                ),
            );

            buttonOpacity.set(withDelay(CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));
        }, CONST.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);

        return () => {
            clearTimeout(spinnerTimer);
        };
    }, [isPaidAnimationRunning, onAnimationFinish, buttonScale, buttonOpacity, resetAnimation, isApprovedAnimationRunning, canIOUBePaid]);

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
            {isPaidAnimationRunning || isApprovedAnimationRunning ? (
                <Animated.View style={buttonStyles}>
                    <Button
                        style={[styles.buttonMediumText, {width: buttonWidth}]}
                        text={isPaidAnimationRunning ? translate('iou.paymentComplete') : translate('iou.approved')}
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
                        isDisabled={isPaidAnimationRunning || isApprovedAnimationRunning || isDisabled}
                        disabledStyle={buttonDisabledStyle}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
