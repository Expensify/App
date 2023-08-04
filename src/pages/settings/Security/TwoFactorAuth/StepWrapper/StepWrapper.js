import React from 'react';
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import FullPageOfflineBlockingView from '../../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import StepWrapperPropTypes from './StepWrapperPropTypes';
import AnimatedStep from '../../../../../components/AnimatedStep';
import styles from '../../../../../styles/styles';

function StepWrapper({title = '', stepCounter = null, onBackButtonPress = TwoFactorAuthActions.quitAndNavigateBackToSettings, children = null, onEntryTransitionEnd}) {
    const shouldShowStepCounter = Boolean(stepCounter);

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={false}
            onEntryTransitionEnd={onEntryTransitionEnd}
        >
            <AnimatedStep style={styles.flex1}>
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

export default StepWrapper;
