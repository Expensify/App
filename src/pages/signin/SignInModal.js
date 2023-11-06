import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import styles from '@styles/styles';
import * as Session from '@userActions/Session';
import SignInPage from './SignInPage';

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
            testID={SignInModal.displayName}
        >
            <HeaderWithBackButton onBackButtonPress={Navigation.dismissModal} />
            <SignInPage isInModal />
        </ScreenWrapper>
    );
}

SignInModal.propTypes = propTypes;
SignInModal.defaultProps = defaultProps;
SignInModal.displayName = 'SignInModal';

export default SignInModal;
