import React, {useEffect, useState} from 'react';
import type {View} from 'react-native';
import Animated, {Keyframe, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import Button from '@components/Button';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    sentryLabel,
    ...settlementButtonProps
}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ThumbsUp', 'Checkmark']);
    const isAnimationRunning = isPaidAnimationRunning || isApprovedAnimationRunning;
    const buttonDuration = isPaidAnimationRunning ? CONST.ANIMATION_PAID_DURATION : CONST.ANIMATION_THUMBS_UP_DURATION;
    const buttonDelay = CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY;
    const gap = styles.expenseAndReportPreviewTextButtonContainer.gap;
    const buttonMarginTop = useSharedValue<number>(gap);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const [canShow, setCanShow] = useState(true);
    const [minWidth, setMinWidth] = useState<number>(0);

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        ...(shouldAddTopMargin && {marginTop: buttonMarginTop.get()}),
    }));

    const willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;

    const finishAnimationAndReset = () => {
        setMinWidth(0);
        setCanShow(true);
        height.set(variables.componentSizeNormal);
        buttonMarginTop.set(shouldAddTopMargin ? gap : 0);
        onAnimationFinish();
    };

    const onButtonExitComplete: () => void = () => {
        'worklet';

        if (shouldAddTopMargin) {
            buttonMarginTop.set(withTiming(willShowPaymentButton ? gap : 0, {duration: buttonDuration}));
        }
        if (willShowPaymentButton) {
            scheduleOnRN(finishAnimationAndReset);
            return;
        }
        height.set(withTiming(0, {duration: buttonDuration}, () => scheduleOnRN(finishAnimationAndReset)));
    };

    const buttonAnimation = new Keyframe({
        from: {
            opacity: 1,
            transform: [{scale: 1}],
        },
        to: {
            opacity: 0,
            transform: [{scale: 0}],
        },
    })
        .delay(buttonDelay)
        .duration(buttonDuration)
        .withCallback(onButtonExitComplete);

    let icon;
    if (isApprovedAnimationRunning) {
        icon = expensifyIcons.ThumbsUp;
    } else if (isPaidAnimationRunning) {
        icon = expensifyIcons.Checkmark;
    }

    const animatedViewRef = (el: View | null) => {
        if (!el || !isAnimationRunning) {
            return;
        }
        setMinWidth((el as unknown as HTMLElement).getBoundingClientRect?.().width ?? 0);
    };

    useEffect(() => {
        if (!isAnimationRunning) {
            return;
        }
        const timer = setTimeout(() => setCanShow(false), CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY);
        return () => clearTimeout(timer);
    }, [isAnimationRunning]);

    return (
        <Animated.View style={[containerStyles, wrapperStyle, {minWidth}]}>
            {isAnimationRunning && canShow && (
                <Animated.View
                    ref={animatedViewRef}
                    exiting={buttonAnimation}
                >
                    <Button
                        text={isApprovedAnimationRunning ? translate('iou.approved') : translate('iou.paymentComplete')}
                        success
                        icon={icon}
                    />
                </Animated.View>
            )}
            {!isAnimationRunning && (
                <SettlementButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...settlementButtonProps}
                    wrapperStyle={wrapperStyle}
                    isDisabled={isAnimationRunning || isDisabled}
                    sentryLabel={sentryLabel}
                />
            )}
        </Animated.View>
    );
}

export default AnimatedSettlementButton;
