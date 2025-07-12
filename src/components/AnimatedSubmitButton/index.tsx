import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {Keyframe, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type AnimatedSubmitButtonProps = {
    success: boolean | undefined;
    text: string;
    onPress: () => void;
    isSubmittingAnimationRunning: boolean;
    onAnimationFinish: () => void;
    shouldAddTopMargin?: boolean;
    wrapperStyle?: StyleProp<ViewStyle>;
};

// --- NEW: Define clear, adjustable durations for each state ---
// How long the loading spinner is visible.
const LOADING_STATE_DURATION = 1000; // 1 second

// How long the "Submitted" button is visible before it animates out.
const SUBMITTED_STATE_VISIBLE_DURATION = 1500; // 1.5 seconds

function AnimatedSubmitButton({success, text, onPress, isSubmittingAnimationRunning, onAnimationFinish, shouldAddTopMargin = false, wrapperStyle}: AnimatedSubmitButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isAnimationRunning = isSubmittingAnimationRunning;
    const buttonDuration = isSubmittingAnimationRunning ? CONST.ANIMATION_SUBMIT_DURATION : CONST.ANIMATION_THUMBS_UP_DURATION;
    const gap = styles.expenseAndReportPreviewTextButtonContainer.gap;
    const buttonMarginTop = useSharedValue<number>(gap);
    const height = useSharedValue<number>(variables.componentSizeNormal);
    const [canShow, setCanShow] = useState(true);
    const [minWidth, setMinWidth] = useState<number>(0);
    const [isShowingLoading, setIsShowingLoading] = useState(false);
    const viewRef = useRef<HTMLElement | null>(null);

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        ...(shouldAddTopMargin && {marginTop: buttonMarginTop.get()}),
    }));

    const stretchOutY = useCallback(() => {
        'worklet';

        if (shouldAddTopMargin) {
            buttonMarginTop.set(withTiming(canShow ? gap : 0, {duration: buttonDuration}));
        }
        if (canShow) {
            runOnJS(onAnimationFinish)();
            return;
        }
        height.set(withTiming(0, {duration: buttonDuration}, () => runOnJS(onAnimationFinish)()));
    }, [buttonDuration, buttonMarginTop, gap, height, onAnimationFinish, shouldAddTopMargin, canShow]);

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
                // REMOVED: .delay() is no longer needed as the useEffect timer controls this.
                .duration(buttonDuration)
                .withCallback(stretchOutY),
        [buttonDuration, stretchOutY],
    );
    let icon;
    if (isAnimationRunning) {
        icon = Expensicons.Send;
    }

    // This effect starts the animation sequence and manages the loading phase.
    useEffect(() => {
        if (!isAnimationRunning) {
            setMinWidth(0);
            setCanShow(true);
            setIsShowingLoading(false);
            height.set(variables.componentSizeNormal);
            buttonMarginTop.set(shouldAddTopMargin ? gap : 0);
            return;
        }

        setMinWidth(viewRef.current?.getBoundingClientRect?.().width ?? 0);
        setIsShowingLoading(true);

        const timer = setTimeout(() => {
            setIsShowingLoading(false);
        }, LOADING_STATE_DURATION); // UPDATED: Use the new longer duration

        return () => clearTimeout(timer);
    }, [buttonMarginTop, gap, height, isAnimationRunning, shouldAddTopMargin]);

    // This effect manages the "submitted" phase, triggering the final exit animation.
    useEffect(() => {
        if (!isAnimationRunning || isShowingLoading) {
            return;
        }

        // After the loading phase is over, the "submitted" button is shown.
        // We set a timer to hide it after a longer delay, which triggers the exit animation.
        const timer = setTimeout(() => setCanShow(false), SUBMITTED_STATE_VISIBLE_DURATION); // UPDATED: Use the new longer duration

        return () => clearTimeout(timer);
    }, [isAnimationRunning, isShowingLoading]);

    // eslint-disable-next-line react-compiler/react-compiler
    const showLoading = isShowingLoading || (!viewRef.current && isAnimationRunning);

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
                        success={success}
                        text={translate('common.submitted')}
                        isLoading={showLoading}
                        icon={!showLoading ? icon : undefined}
                    />
                </Animated.View>
            )}
            {!isAnimationRunning && (
                <Button
                    success={success}
                    text={text}
                    onPress={onPress}
                    icon={icon}
                />
            )}
        </Animated.View>
    );
}

AnimatedSubmitButton.displayName = 'AnimatedSubmitButton';

export default AnimatedSubmitButton;
