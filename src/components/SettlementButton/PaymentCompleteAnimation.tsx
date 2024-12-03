import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import variables from '@styles/variables';
import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';

type PaymentCompleteAnimationProps = {
    isVisible: boolean;
    onAnimationFinish: () => void;
};

function PaymentCompleteAnimation({isVisible, onAnimationFinish}: PaymentCompleteAnimationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const paymentCompleteTextScale = useSharedValue(0);
    const paymentCompleteTextOpacity = useSharedValue(1);
    const containerHeight = useSharedValue<number>(variables.componentSizeNormal);

    const paymentCompleteTextStyles = useAnimatedStyle(() => ({
        transform: [{scale: paymentCompleteTextScale.value}],
        opacity: paymentCompleteTextOpacity.value,
        position: 'absolute',
        alignSelf: 'center',
    }));

    const containerStyles = useAnimatedStyle(() => ({
        height: containerHeight.value,
        justifyContent: 'center',
        overflow: 'hidden',
    }));

    useEffect(() => {
        if (!isVisible) {
            // Reset animation values
            paymentCompleteTextScale.value = 0;
            paymentCompleteTextOpacity.value = 1;
            containerHeight.value = variables.componentSizeNormal;
            return;
        }

        // Start animation
        paymentCompleteTextScale.value = withTiming(1, {duration: CONST.ANIMATION_PAID_DURATION});

        // Wait before hiding the component
        const totalDelay = CONST.ANIMATION_PAID_DURATION + CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;
        containerHeight.value = withDelay(
            totalDelay,
            withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}, () => {
                if (onAnimationFinish) {
                    runOnJS(onAnimationFinish)();
                }
            }),
        );

        paymentCompleteTextOpacity.value = withDelay(totalDelay, withTiming(0, {duration: CONST.ANIMATION_PAID_DURATION}));
    }, [containerHeight, isVisible, onAnimationFinish, paymentCompleteTextOpacity, paymentCompleteTextScale]);

    return (
        isVisible && (
            <Animated.View style={containerStyles}>
                <Animated.View style={paymentCompleteTextStyles}>
                    <Text style={[styles.buttonMediumText]}>{translate('iou.paymentComplete')}</Text>
                </Animated.View>
            </Animated.View>
        )
    );
}

PaymentCompleteAnimation.displayName = 'PaymentCompleteAnimation';

export default PaymentCompleteAnimation;
