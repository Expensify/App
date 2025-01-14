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
    onAnimationFinish: () => void;
    isApprovedAnimationRunning: boolean;
    shouldAddTopMargin?: boolean;
    canIOUBePaid: boolean;
};

function AnimatedSettlementButton({
    isPaidAnimationRunning,
    onAnimationFinish,
    isApprovedAnimationRunning,
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
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const buttonMarginTop = useSharedValue<number>(styles.expenseAndReportPreviewTextButtonContainer.gap);
    const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const buttonStyles = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale.get()}],
        opacity: buttonOpacity.get(),
    }));

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        overflow: 'hidden',
        ...(shouldAddTopMargin && {marginTop: buttonMarginTop.get()}),
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
        height.set(variables.componentSizeNormal);
        if (shouldAddTopMargin) {
            buttonMarginTop.set(styles.expenseAndReportPreviewTextButtonContainer.gap);
        }
    }, [buttonScale, buttonOpacity, height, shouldAddTopMargin, buttonMarginTop, styles.expenseAndReportPreviewTextButtonContainer.gap]);

    useEffect(() => {
        if (!isApprovedAnimationRunning && !isPaidAnimationRunning) {
            resetAnimation();
            return;
        }

        setIsLoading(true);
        const willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;
        const totalDelay = CONST.ANIMATION_PAID_DURATION + CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;

        const spinnerTimer = setTimeout(() => {
            setIsLoading(false);

            buttonScale.set(withDelay(CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));
            buttonOpacity.set(withDelay(CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));

            // Wait for the above animation + 1s delay before hiding the component
            height.set(
                withDelay(
                    totalDelay,
                    withTiming(willShowPaymentButton ? variables.componentSizeNormal : 0, {duration: CONST.ANIMATION_PAID_DURATION}, () => runOnJS(onAnimationFinish)()),
                ),
            );

            if (shouldAddTopMargin) {
                buttonMarginTop.set(
                    withDelay(totalDelay, withTiming(willShowPaymentButton ? styles.expenseAndReportPreviewTextButtonContainer.gap : 0, {duration: CONST.ANIMATION_PAID_DURATION})),
                );
                buttonMarginTop.set(withDelay(totalDelay, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION})));
            }
        }, CONST.ANIMATION_LOADING_DURATION);

        return () => {
            clearTimeout(spinnerTimer);
        };
    }, [
        isPaidAnimationRunning,
        onAnimationFinish,
        buttonScale,
        buttonOpacity,
        resetAnimation,
        isApprovedAnimationRunning,
        canIOUBePaid,
        buttonMarginTop,
        styles.expenseAndReportPreviewTextButtonContainer.gap,
        height,
        shouldAddTopMargin,
    ]);

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
            {isPaidAnimationRunning || isApprovedAnimationRunning ? (
                <Button
                    style={[styles.buttonMediumText, {width: buttonWidth}]}
                    text={isPaidAnimationRunning ? translate('iou.paymentComplete') : translate('iou.approved')}
                    isLoading={isLoading}
                    success
                    icon={isLoading ? undefined : (isPaidAnimationRunning && Expensicons.Checkmark) || Expensicons.ThumbsUp}
                />
            ) : (
                <SettlementButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...settlementButtonProps}
                    wrapperStyle={wrapperStyle}
                    isDisabled={isPaidAnimationRunning || isApprovedAnimationRunning || isDisabled}
                    disabledStyle={buttonDisabledStyle}
                />
            )}
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
