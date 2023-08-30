import React from 'react';
import SignInPage from './SignInPage';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import * as Session from '../../libs/actions/Session';

const propTypes = {};

const defaultProps = {};

function SignInModal() {
    if (!Session.isAnonymousUser()) {
        // Sign in in RHP is only for anonymous users
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }
    return (
        <ScreenWrapper
            style={[styles.highlightBG]}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton onBackButtonPress={() => Navigation.goBack()} />
            <SignInPage isInModal />
        </ScreenWrapper>
    );
}

SignInModal.propTypes = propTypes;
SignInModal.defaultProps = defaultProps;
SignInModal.displayName = 'SignInModal';

export default SignInModal;
