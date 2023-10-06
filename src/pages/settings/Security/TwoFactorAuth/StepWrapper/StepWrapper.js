import React from 'react';
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import FullPageOfflineBlockingView from '../../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import StepWrapperPropTypes from './StepWrapperPropTypes';
import styles from '../../../../../styles/styles';

function StepWrapper({title = '', stepCounter = null, onBackButtonPress = TwoFactorAuthActions.quitAndNavigateBackToSettings, children = null, shouldEnableKeyboardAvoidingView = true}) {
    const shouldShowStepCounter = Boolean(stepCounter);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            testID={StepWrapper.displayName}
            style={[styles.flex1]}
        >
            <HeaderWithBackButton
                title={title}
                shouldShowStepCounter={shouldShowStepCounter}
                stepCounter={stepCounter}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageOfflineBlockingView>{children}</FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

StepWrapper.propTypes = StepWrapperPropTypes;
StepWrapper.displayName = 'StepWrapper';

export default StepWrapper;
