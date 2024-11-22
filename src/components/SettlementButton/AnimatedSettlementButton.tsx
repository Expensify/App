import React, {useCallback, useEffect} from 'react';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SettlementButton from '.';
import type SettlementButtonProps from './types';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isPaidAnimationRunning: boolean;
    onAnimationFinish: () => void;
};

function AnimatedSettlementButton({isPaidAnimationRunning, onAnimationFinish, isDisabled, ...settlementButtonProps}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const buttonScale = useSharedValue(1);
    const buttonOpacity = useSharedValue(1);
    const paymentCompleteTextScale = useSharedValue(0);
    const paymentCompleteTextOpacity = useSharedValue(1);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const buttonMarginTop = useSharedValue<number>(styles.expenseAndReportPreviewTextButtonContainer.gap);
    const buttonStyles = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale.value}],
        opacity: buttonOpacity.value,
    }));
    const paymentCompleteTextStyles = useAnimatedStyle(() => ({
        transform: [{scale: paymentCompleteTextScale.value}],
        opacity: paymentCompleteTextOpacity.value,
        position: 'absolute',
        alignSelf: 'center',
    }));
    const containerStyles = useAnimatedStyle(() => ({
        height: height.value,
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: buttonMarginTop.value,
    }));
    const buttonDisabledStyle = isPaidAnimationRunning
        ? {
              opacity: 1,
              ...styles.cursorDefault,
          }
        : undefined;

    const resetAnimation = useCallback(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        buttonScale.value = 1;
        buttonOpacity.value = 1;
        paymentCompleteTextScale.value = 0;
        paymentCompleteTextOpacity.value = 1;
        height.value = variables.componentSizeNormal;
        buttonMarginTop.value = styles.expenseAndReportPreviewTextButtonContainer.gap;
    }, [buttonScale, buttonOpacity, paymentCompleteTextScale, paymentCompleteTextOpacity, height, buttonMarginTop, styles.expenseAndReportPreviewTextButtonContainer.gap]);

    useEffect(() => {
        if (!isPaidAnimationRunning) {
            resetAnimation();
            return;
        }
        // eslint-disable-next-line react-compiler/react-compiler
        buttonScale.value = withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION});
        buttonOpacity.value = withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION});
        paymentCompleteTextScale.value = withTiming(1, {duration: CONST.ANIMATION_PAID_DURATION});

        // Wait for the above animation + 1s delay before hiding the component
        const totalDelay = CONST.ANIMATION_PAID_DURATION + CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;
        height.value = withDelay(
            totalDelay,
            withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}, () => runOnJS(onAnimationFinish)()),
        );
        buttonMarginTop.value = withDelay(totalDelay, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}));
        paymentCompleteTextOpacity.value = withDelay(totalDelay, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}));
    }, [isPaidAnimationRunning, onAnimationFinish, buttonOpacity, buttonScale, height, paymentCompleteTextOpacity, paymentCompleteTextScale, buttonMarginTop, resetAnimation]);

    return (
        <Animated.View style={containerStyles}>
            {isPaidAnimationRunning && (
                <Animated.View style={paymentCompleteTextStyles}>
                    <Text style={[styles.buttonMediumText]}>{translate('iou.paymentComplete')}</Text>
                </Animated.View>
            )}
            <Animated.View style={buttonStyles}>
                <SettlementButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...settlementButtonProps}
                    isDisabled={isPaidAnimationRunning || isDisabled}
                    disabledStyle={buttonDisabledStyle}
                />
            </Animated.View>
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
