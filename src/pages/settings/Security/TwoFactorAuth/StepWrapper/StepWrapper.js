import React from 'react';
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import FullPageOfflineBlockingView from '../../../../../components/BlockingViews/FullPageOfflineBlockingView';
import Navigation from "../../../../../libs/Navigation/Navigation";
import ROUTES from "../../../../../ROUTES";

const defaultProps = {};

function StepWrapper({title, stepCounter, onBackButtonPress, children}) {
    const navigateBackToSettings = () => Navigation.goBack(ROUTES.SETTINGS_SECURITY)
    return (
        <ScreenWrapper shouldShowOfflineIndicator={false}>
            <HeaderWithBackButton
                title={title}
                shouldShowStepCounter={!!stepCounter}
                stepCounter={stepCounter}
                onBackButtonPress={onBackButtonPress || navigateBackToSettings}
            />
            <FullPageOfflineBlockingView>
                {children}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default StepWrapper;
