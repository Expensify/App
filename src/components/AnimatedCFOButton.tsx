import React, {useCallback, useMemo} from 'react';
import Animated, {Keyframe, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import Button from './Button';

type AnimatedCFOButtonProps = {
    onAnimationFinish: () => void;
};

function AnimatedCFOButton({onAnimationFinish}: AnimatedCFOButtonProps) {
    const holdProgress = useSharedValue<number>(0);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const height = useSharedValue<number>(variables.componentSizeNormal);

    // Base button style
    const baseButtonStyle = useAnimatedStyle(() => ({
        backgroundColor: colors.pink700,
        borderRadius: variables.buttonBorderRadius,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
    }));

    // Progress fill that moves from left to right
    const progressFillStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${holdProgress.value * 100}%`,
            backgroundColor: colors.pink400,
        };
    });

    const containerStyles = useAnimatedStyle(() => ({
        height: height.get(),
        justifyContent: 'center',
        width: '100%',
    }));

    const stretchOutY = useCallback(() => {
        'worklet';

        if (isCompleted) {
            runOnJS(onAnimationFinish)();
            return;
        }
        height.set(withTiming(0, {duration: CONST.ANIMATED_CFO_BUTTON.EXITING_DURATION}, () => runOnJS(onAnimationFinish)()));
    }, [height, isCompleted, onAnimationFinish]);

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
                .delay(CONST.ANIMATED_CFO_BUTTON.DELAY_DURATION)
                .duration(CONST.ANIMATED_CFO_BUTTON.EXITING_DURATION)
                .withCallback(stretchOutY),
        [stretchOutY],
    );

    return (
        <Animated.View style={[containerStyles]}>
            {!isCompleted && (
                <Animated.View
                    style={baseButtonStyle}
                    exiting={buttonAnimation}
                >
                    <Animated.View style={progressFillStyle} />
                    <Button
                        text="Tap and hold to unlock insights"
                        textStyles={{color: colors.white}}
                        style={{width: '100%', backgroundColor: 'transparent'}}
                        innerStyles={{backgroundColor: 'transparent', width: '100%'}}
                        shouldUseDefaultHover={false}
                        onLongPress={() => {
                            if (isCompleted) {
                                return;
                            }

                            holdProgress.value = withTiming(1, {duration: CONST.ANIMATED_CFO_BUTTON.PROGRESS_DURATION}, (finished) => {
                                if (!finished) {
                                    return;
                                }

                                runOnJS(() => setIsCompleted(true))();
                            });
                        }}
                        onPressOut={() => {
                            if (isCompleted) {
                                return;
                            }

                            holdProgress.value = withTiming(0, {duration: CONST.ANIMATED_CFO_BUTTON.RELEASE_DURATION});
                        }}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

export default AnimatedCFOButton;
