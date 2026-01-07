import React, {useCallback, useEffect, useMemo, useRef} from 'react';
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
    sentryLabel?: string;
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
    const [canShow, setCanShow] = React.useState(true);
    const [minWidth, setMinWidth] = React.useState<number>(0);
    const viewRef = useRef<HTMLElement | null>(null);

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        ...(shouldAddTopMargin && {marginTop: buttonMarginTop.get()}),
    }));

    const willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;
    const stretchOutY = useCallback(() => {
        'worklet';

        if (shouldAddTopMargin) {
            buttonMarginTop.set(withTiming(willShowPaymentButton ? gap : 0, {duration: buttonDuration}));
        }
        if (willShowPaymentButton) {
            scheduleOnRN(onAnimationFinish);
            return;
        }
        height.set(withTiming(0, {duration: buttonDuration}, () => scheduleOnRN(onAnimationFinish)));
    }, [buttonDuration, buttonMarginTop, gap, height, onAnimationFinish, shouldAddTopMargin, willShowPaymentButton]);

    const buttonAnimation = useMemo(
        () =>
            new Keyframe({
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
                .withCallback(stretchOutY),
        [buttonDelay, buttonDuration, stretchOutY],
    );

    let icon;
    if (isApprovedAnimationRunning) {
        icon = expensifyIcons.ThumbsUp;
    } else if (isPaidAnimationRunning) {
        icon = expensifyIcons.Checkmark;
    }

    useEffect(() => {
        if (!isAnimationRunning) {
            setMinWidth(0);
            setCanShow(true);
            height.set(variables.componentSizeNormal);
            buttonMarginTop.set(shouldAddTopMargin ? gap : 0);
            return;
        }
        setMinWidth(viewRef.current?.getBoundingClientRect?.().width ?? 0);
        const timer = setTimeout(() => setCanShow(false), CONST.ANIMATION_PAID_BUTTON_HIDE_DELAY);
        return () => clearTimeout(timer);
    }, [buttonMarginTop, gap, height, isAnimationRunning, shouldAddTopMargin]);

    return (
        <Animated.View style={[containerStyles, wrapperStyle, {minWidth}]}>
            {isAnimationRunning && canShow && (
                <Animated.View
                    ref={(el) => {
                        viewRef.current = el as HTMLElement | null;
                    }}
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
