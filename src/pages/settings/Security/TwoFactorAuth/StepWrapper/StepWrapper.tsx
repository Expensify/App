import React from 'react';
import AnimatedStep from '@components/AnimatedStep';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import type StepWrapperPropTypes from './StepWrapperPropTypes';

function StepWrapper({
    title = '',
    stepCounter,
    onBackButtonPress = () => TwoFactorAuthActions.quitAndNavigateBack(),
    children = null,
    shouldEnableKeyboardAvoidingView = true,
    onEntryTransitionEnd,
}: StepWrapperPropTypes) {
    const styles = useThemeStyles();
    const {animationDirection} = useAnimatedStepContext();

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            testID={StepWrapper.displayName}
        >
            <AnimatedStep
                style={[styles.flex1]}
                onAnimationEnd={onEntryTransitionEnd as () => void}
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
