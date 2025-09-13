import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Animated, {Keyframe, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type AnimatedSubmitButtonProps = {
    // Whether to show the success state
    success: boolean | undefined;

    // Text to show on the button
    text: string;

    // Function to call when the button is pressed
    onPress: () => void;

    // Whether the animation is running
    isSubmittingAnimationRunning: boolean;

    // Function to call when the animation finishes
    onAnimationFinish: () => void;
};

function AnimatedSubmitButton({success, text, onPress, isSubmittingAnimationRunning, onAnimationFinish}: AnimatedSubmitButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isAnimationRunning = isSubmittingAnimationRunning;
    const buttonDuration = isSubmittingAnimationRunning ? CONST.ANIMATION_SUBMIT_DURATION : CONST.ANIMATION_SUBMITTED_DURATION;
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
    }));

    const stretchOutY = useCallback(() => {
        'worklet';

        if (canShow) {
            runOnJS(onAnimationFinish)();
            return;
        }
        height.set(withTiming(0, {duration: buttonDuration}, () => runOnJS(onAnimationFinish)()));
    }, [buttonDuration, height, onAnimationFinish, canShow]);

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
                .duration(buttonDuration)
                .withCallback(stretchOutY),
        [buttonDuration, stretchOutY],
    );
    const icon = isAnimationRunning ? Expensicons.Send : null;

    useEffect(() => {
        if (!isAnimationRunning) {
            setMinWidth(0);
            setCanShow(true);
            setIsShowingLoading(false);
            height.set(variables.componentSizeNormal);
            buttonMarginTop.set(0);
            return;
        }

        setMinWidth(viewRef.current?.getBoundingClientRect?.().width ?? 0);
        setIsShowingLoading(true);

        const timer = setTimeout(() => {
            setIsShowingLoading(false);
        }, CONST.ANIMATION_SUBMIT_LOADING_STATE_DURATION);

        return () => clearTimeout(timer);
    }, [buttonMarginTop, gap, height, isAnimationRunning]);

    useEffect(() => {
        if (!isAnimationRunning || isShowingLoading) {
            return;
        }

        const timer = setTimeout(() => setCanShow(false), CONST.ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION);

        return () => clearTimeout(timer);
    }, [isAnimationRunning, isShowingLoading]);

    // eslint-disable-next-line react-compiler/react-compiler
    const showLoading = isShowingLoading || (!viewRef.current && isAnimationRunning);

    return (
        <Animated.View style={[containerStyles, {minWidth}]}>
            {isAnimationRunning && canShow && (
                <Animated.View
                    ref={(el) => {
                        viewRef.current = el as HTMLElement | null;
                    }}
                    exiting={buttonAnimation}
                >
                    <Button
                        success={success}
                        text={showLoading ? text : translate('common.submitted')}
                        isLoading={showLoading}
                        icon={!showLoading ? icon : undefined}
                        isDisabled
                        shouldStayNormalOnDisable
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
