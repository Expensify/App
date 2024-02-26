import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import SCREENS from '@src/SCREENS';
import SignInPage from './SignInPage';

function SignInModal() {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    if (!Session.isAnonymousUser()) {
        // Signing in RHP is only for anonymous users
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }
    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS.RIGHT_MODAL.SIGN_IN].backgroundColor)]}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SignInModal.displayName}
        >
            <HeaderWithBackButton onBackButtonPress={() => Navigation.goBack()} />
            <SignInPage shouldEnableMaxHeight={false} />
        </ScreenWrapper>
    );
}

SignInModal.displayName = 'SignInModal';

export default SignInModal;
