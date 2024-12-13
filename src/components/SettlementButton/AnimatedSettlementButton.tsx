// AnimatedSettlementButton.tsx
import React from 'react';
import Animated from 'react-native-reanimated';
import Text from '@components/Text';
import useButtonAnimation from '@hooks/useButtonAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import SettlementButton from '.';
import type SettlementButtonProps from './types';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isPaidAnimationRunning: boolean;
    onAnimationFinish: () => void;
};

function AnimatedSettlementButton({isPaidAnimationRunning, onAnimationFinish, isDisabled, ...settlementButtonProps}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Utilize the custom hook
    const {animatedButtonStyles, animatedContainerStyles, animatedTextStyles, resetAnimation} = useButtonAnimation({
        isRunning: isPaidAnimationRunning,
        onFinish: onAnimationFinish,
        containerInitialMarginTop: styles.expenseAndReportPreviewTextButtonContainer.gap,
        containerTargetMarginTop: 0,
        textInitialScale: 0,
        textTargetScale: 1,
        textInitialOpacity: 1,
        textTargetOpacity: 0,
    });

    const buttonDisabledStyle = isPaidAnimationRunning
        ? {
              opacity: 1,
              ...styles.cursorDefault,
          }
        : undefined;

    return (
        <Animated.View style={animatedContainerStyles}>
            {isPaidAnimationRunning && (
                <Animated.View style={animatedTextStyles}>
                    <Text style={styles.buttonMediumText}>{translate('iou.paymentComplete')}</Text>
                </Animated.View>
            )}
            <Animated.View style={animatedButtonStyles}>
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
