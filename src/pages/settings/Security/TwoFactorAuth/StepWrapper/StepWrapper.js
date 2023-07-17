import React from 'react';
import PropTypes from "prop-types";
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';
import FullPageOfflineBlockingView from '../../../../../components/BlockingViews/FullPageOfflineBlockingView';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';

const propTypes = {
    /** Title of the Header */
    title: PropTypes.string,

    /** Data to display a step counter in the header */
    stepCounter: PropTypes.shape({
        step: PropTypes.number,
        total: PropTypes.number,
        text: PropTypes.string,
    }),

    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,

    /** Children components */
    children: PropTypes.node,
}

const defaultProps = {
    title: '',
    stepCounter: null,
    onBackButtonPress: TwoFactorAuthActions.quitAndNavigateBackToSettings,
    children: null,
};

function StepWrapper({title, stepCounter, onBackButtonPress, children}) {
    return (
        <ScreenWrapper shouldShowOfflineIndicator={false}>
            <HeaderWithBackButton
                title={title}
                shouldShowStepCounter={!!stepCounter}
                stepCounter={stepCounter}
                onBackButtonPress={onBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                {children}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

StepWrapper.propTypes = propTypes;
StepWrapper.defaultProps = defaultProps;

export default StepWrapper;
