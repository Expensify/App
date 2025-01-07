import React, {useEffect} from 'react';
import Animated from 'react-native-reanimated';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import type {StepCounterParams} from '@src/languages/params';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import useAnimatedStepContext from './useAnimatedStepContext';

type AnimatedStepProps = ChildrenProps & {
    /** Name of the step */
    stepName: string;

    /** Title of the Header */
    title?: string;

    /** Data to display a step counter in the header */
    stepCounter?: StepCounterParams;

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    /** Called when navigated Screen's transition is finished. It does not fire when user exits the page. */
    onEntryTransitionEnd?: () => void;

    /** Flag to indicate if the keyboard avoiding view should be enabled */
    shouldEnableKeyboardAvoidingView?: boolean;
};

function AnimatedStep({stepName, title = '', stepCounter, onBackButtonPress, children = null, shouldEnableKeyboardAvoidingView = true, onEntryTransitionEnd}: AnimatedStepProps) {
    const styles = useThemeStyles();
    const {previousStep, currentScreenAnimatedStyle, previousScreenAnimatedStyle} = useAnimatedStepContext();

    useEffect(() => {
        if (previousStep) {
            return;
        }

        onEntryTransitionEnd?.();
    }, [onEntryTransitionEnd, previousStep]);

    return (
        <Animated.View style={[styles.animatedStep, stepName === previousStep ? previousScreenAnimatedStyle : currentScreenAnimatedStyle]}>
            <ScreenWrapper
                shouldShowOfflineIndicator={false}
                shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
                shouldEnableMaxHeight
                testID={AnimatedStep.displayName}
            >
                <HeaderWithBackButton
                    title={title}
                    stepCounter={stepCounter}
                    onBackButtonPress={onBackButtonPress}
                />
                <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
            </ScreenWrapper>
        </Animated.View>
    );
}

AnimatedStep.displayName = 'AnimatedStep';

export default AnimatedStep;
