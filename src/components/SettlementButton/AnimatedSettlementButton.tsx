import React, {useEffect, useState} from 'react';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import SettlementButton from '.';
import type SettlementButtonProps from './types';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isVisible: boolean;
};

function AnimatedSettlementButton({isVisible, ...settlementButtonProps}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const buttonScale = useSharedValue(1);
    const buttonOpacity = useSharedValue(1);
    const paymentCompleteTextScale = useSharedValue(0);
    const paymentCompleteTextOpacity = useSharedValue(1);
    const height = useSharedValue<number>(variables.componentSizeNormal);
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
    }));

    const [isAnimationRunning, setIsAnimationRunning] = useState(false);

    const resetAnimation = () => {
        buttonScale.value = 1;
        buttonOpacity.value = 1;
        paymentCompleteTextScale.value = 0;
        paymentCompleteTextOpacity.value = 1;
        height.value = variables.componentSizeNormal;
    };

    useEffect(() => {
        if (!isAnimationRunning) {
            resetAnimation();
            return;
        }
        buttonScale.value = withTiming(0, {duration: 200});
        buttonOpacity.value = withTiming(0, {duration: 200});
        paymentCompleteTextScale.value = withTiming(1, {duration: 200});

        // Wait for the above animation + 1s delay before hiding the component
        height.value = withDelay(
            1200,
            withTiming(0, {duration: 200}, () => runOnJS(setIsAnimationRunning)(false)),
        );
        paymentCompleteTextOpacity.value = withDelay(1200, withTiming(0, {duration: 200}));
    }, [isAnimationRunning]);

    if (!isVisible && !isAnimationRunning) {
        return null;
    }

    return (
        <Animated.View style={containerStyles}>
            {isAnimationRunning && (
                <Animated.View style={paymentCompleteTextStyles}>
                    <Text style={[styles.buttonMediumText]}>Payment complete</Text>
                </Animated.View>
            )}
            <Animated.View style={buttonStyles}>
                <SettlementButton
                    {...settlementButtonProps}
                    onPress={(paymentType, payAsBusiness) => {
                        const isPaid = !!settlementButtonProps.onPress(paymentType, payAsBusiness);
                        setIsAnimationRunning(isPaid);
                    }}
                />
            </Animated.View>
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
