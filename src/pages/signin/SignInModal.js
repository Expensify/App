import React from 'react';
import SignInPage from './SignInPage';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {};

const defaultProps = {};

function SignInModal() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            onEntryTransitionEnd={() =>{}}
        >
            <HeaderWithBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SignInPage 
                isInModal
            />
        </ScreenWrapper>

    );
}

SignInModal.propTypes = propTypes;
SignInModal.defaultProps = defaultProps;
SignInModal.displayName = 'SignInModal';

export default (SignInModal);