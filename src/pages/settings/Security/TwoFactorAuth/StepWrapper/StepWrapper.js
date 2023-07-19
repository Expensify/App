import React from 'react';
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import FullPageOfflineBlockingView from '../../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import StepWrapperPropTypes from './StepWrapperPropTypes';

function StepWrapper({title = '', stepCounter = null, onBackButtonPress = TwoFactorAuthActions.quitAndNavigateBackToSettings, children = null}) {
    const shouldShowStepCounter = Boolean(stepCounter);

    return (
        <ScreenWrapper shouldShowOfflineIndicator={false}>
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

export default StepWrapper;
