import React from 'react';
import AnimatedStep from '@components/AnimatedStep';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import type {StepCounterParams} from '@src/languages/params';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type StepWrapperProps = ChildrenProps & {
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

function StepWrapper({
    title = '',
    stepCounter,
    onBackButtonPress = () => TwoFactorAuthActions.quitAndNavigateBack(),
    children = null,
    shouldEnableKeyboardAvoidingView = true,
    onEntryTransitionEnd,
}: StepWrapperProps) {
    const styles = useThemeStyles();
    const {animationDirection} = useAnimatedStepContext();

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            shouldEnableMaxHeight
            testID={StepWrapper.displayName}
        >
            <AnimatedStep
                style={[styles.flex1]}
                onAnimationEnd={onEntryTransitionEnd}
                direction={animationDirection}
            >
                <HeaderWithBackButton
                    title={title}
                    stepCounter={stepCounter}
                    onBackButtonPress={onBackButtonPress}
                />
                <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
            </AnimatedStep>
        </ScreenWrapper>
    );
}

StepWrapper.displayName = 'StepWrapper';

export default StepWrapper;
