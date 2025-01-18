import React, {useCallback, useEffect, useState} from 'react';
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
    isApprovedAnimationRunning,
    onAnimationFinish,
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
    const [shouldHideButton, setShouldHideButton] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const buttonMarginTop = useSharedValue<number>(styles.expenseAndReportPreviewTextButtonContainer.gap);

    useEffect(() => {
        setShouldHideButton(!(isPaidAnimationRunning || isApprovedAnimationRunning));
    }, [isPaidAnimationRunning, isApprovedAnimationRunning]);

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
        height.set(variables.componentSizeNormal);
        setIsLoading(false);
        setShouldHideButton(true);
        if (shouldAddTopMargin) {
            buttonMarginTop.set(styles.expenseAndReportPreviewTextButtonContainer.gap);
        }
    }, [buttonScale, buttonOpacity, height, shouldAddTopMargin, buttonMarginTop, styles.expenseAndReportPreviewTextButtonContainer.gap]);

    const handleFadeOutComplete = useCallback(() => {
        setShouldHideButton(true);
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
    ]);
    return (
        <Animated.View style={[containerStyles, wrapperStyle, buttonStyles]}>
            {shouldHideButton ? (
                <SettlementButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...settlementButtonProps}
                    wrapperStyle={wrapperStyle}
                    isDisabled={isPaidAnimationRunning || isApprovedAnimationRunning || isDisabled}
                    disabledStyle={buttonDisabledStyle}
                />
            ) : (
                <Button
                    style={styles.buttonMediumText}
                    text={isPaidAnimationRunning ? translate('iou.paymentComplete') : translate('iou.approved')}
                    isLoading={isLoading}
                    success
                    icon={isLoading ? undefined : (isPaidAnimationRunning && Expensicons.Checkmark) || Expensicons.ThumbsUp}
                />
            )}
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
