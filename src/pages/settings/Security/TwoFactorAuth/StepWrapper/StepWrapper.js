import React from 'react';
import AnimatedStep from '@components/AnimatedStep';
import useAnimatedStepContext from '@components/AnimatedStep/useAnimatedStepContext';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@styles/useThemeStyles';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import StepWrapperPropTypes from './StepWrapperPropTypes';

function StepWrapper({
    title = '',
    stepCounter = null,
    onBackButtonPress = TwoFactorAuthActions.quitAndNavigateBackToSettings,
    children = null,
    shouldEnableKeyboardAvoidingView = true,
    onEntryTransitionEnd,
}) {
    const styles = useThemeStyles();
    const shouldShowStepCounter = Boolean(stepCounter);

    const {animationDirection} = useAnimatedStepContext();

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            testID={StepWrapper.displayName}
        >
            <AnimatedStep
                style={[styles.flex1]}
                onAnimationEnd={onEntryTransitionEnd}
                direction={animationDirection}
            >
                <HeaderWithBackButton
                    title={title}
                    shouldShowStepCounter={shouldShowStepCounter}
                    stepCounter={stepCounter}
                    onBackButtonPress={onBackButtonPress}
                />
                <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
            </AnimatedStep>
        </ScreenWrapper>
    );
}

StepWrapper.propTypes = StepWrapperPropTypes;
StepWrapper.displayName = 'StepWrapper';

export default StepWrapper;
