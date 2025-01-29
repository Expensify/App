import React, {useCallback, useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
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
    shouldUseSuccessStyle?: boolean;
    onAnimationFinish: () => void;
    onLoadingEnd?: () => void;
    isApprovedAnimationRunning: boolean;
    shouldAddTopMargin?: boolean;
    canIOUBePaid: boolean;
};

function AnimatedSettlementButton({
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    shouldUseSuccessStyle,
    onAnimationFinish,
    onLoadingEnd,
    shouldAddTopMargin = false,
    isDisabled,
    canIOUBePaid,
    wrapperStyle,
    ...settlementButtonProps
}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const buttonScale = useSharedValue(1);
    const buttonOpacity = useSharedValue(1);
    const [isLoading, setIsLoading] = useState(false);
    const [stableShouldUseSuccessStyle, setStableShouldUseSuccessStyle] = useState(shouldUseSuccessStyle);
    const [buttonWidth, setButtonWidth] = useState<number | null>(null);

    const height = useSharedValue<number>(variables.componentSizeNormal);
    const buttonMarginTop = useSharedValue<number>(styles.expenseAndReportPreviewTextButtonContainer.gap);
    const isAnimationRunning = isPaidAnimationRunning || isApprovedAnimationRunning;
    const willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;
    const totalDelay = CONST.ANIMATION_PAID_DURATION + CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        overflow: 'hidden',
        ...(shouldAddTopMargin && {marginTop: buttonMarginTop.get()}),
    }));

    const buttonStyles = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale.get()}],
        opacity: buttonOpacity.get(),
    }));

    const buttonDisabledStyle = isAnimationRunning
        ? {
              opacity: 1,
              ...styles.cursorDefault,
          }
        : undefined;

    const resetAnimation = useCallback(() => {
        buttonScale.set(1);
        buttonOpacity.set(1);
        height.set(variables.componentSizeNormal);
        setIsLoading(false);
        if (shouldAddTopMargin) {
            buttonMarginTop.set(styles.expenseAndReportPreviewTextButtonContainer.gap);
        }
    }, [buttonScale, buttonOpacity, height, shouldAddTopMargin, buttonMarginTop, styles.expenseAndReportPreviewTextButtonContainer.gap]);

    const handleFadeOutComplete = useCallback(() => {
        onAnimationFinish();
    }, [onAnimationFinish]);

    useEffect(() => {
        if (!isApprovedAnimationRunning && !isPaidAnimationRunning) {
            resetAnimation();
            return;
        }

        setIsLoading(true);

        const spinnerTimer = setTimeout(() => {
            setIsLoading(false);

            buttonScale.set(withDelay(CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));
            buttonOpacity.set(
                withDelay(
                    CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY,
                    withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}, () => {
                        runOnJS(handleFadeOutComplete)();
                    }),
                ),
            );

            if (shouldAddTopMargin) {
                buttonMarginTop.set(
                    withDelay(totalDelay, withTiming(willShowPaymentButton ? styles.expenseAndReportPreviewTextButtonContainer.gap : 0, {duration: CONST.ANIMATION_PAID_DURATION})),
                );
            }

            if (!willShowPaymentButton) {
                height.set(withDelay(totalDelay, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));
            }

            onLoadingEnd?.();
        }, CONST.ANIMATION_LOADING_DURATION);

        return () => {
            clearTimeout(spinnerTimer);
        };
    }, [
        isApprovedAnimationRunning,
        isPaidAnimationRunning,
        onAnimationFinish,
        willShowPaymentButton,
        resetAnimation,
        buttonScale,
        buttonOpacity,
        buttonMarginTop,
        height,
        shouldAddTopMargin,
        styles,
        totalDelay,
        handleFadeOutComplete,
        onLoadingEnd,
    ]);

    useEffect(() => {
        if (isAnimationRunning) {
            return;
        }
        setStableShouldUseSuccessStyle(shouldUseSuccessStyle);
    }, [isAnimationRunning, shouldUseSuccessStyle]);

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
        <Animated.View
            style={[containerStyles, wrapperStyle, buttonStyles]}
            onLayout={handleLayout}
        >
            {isAnimationRunning ? (
                <Button
                    style={[styles.buttonMediumText, isLoading && {width: buttonWidth}]}
                    text={isPaidAnimationRunning ? translate('iou.paymentComplete') : translate('iou.approved')}
                    isLoading={isLoading}
                    success={stableShouldUseSuccessStyle}
                    icon={isLoading ? undefined : (isPaidAnimationRunning && Expensicons.Checkmark) || Expensicons.ThumbsUp}
                />
            ) : (
                <SettlementButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...settlementButtonProps}
                    shouldUseSuccessStyle={shouldUseSuccessStyle}
                    wrapperStyle={wrapperStyle}
                    isDisabled={isAnimationRunning || isDisabled}
                    disabledStyle={buttonDisabledStyle}
                />
            )}
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
