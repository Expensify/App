import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';
import SignInPage from './SignInPage';

type SignInModalOnyxProps = {
    session: OnyxEntry<Session>;
};

type SignInModalProps = SignInModalOnyxProps;

function SignInModal({session}: SignInModalProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    useEffect(() => {
        const isAnonymousUser = session?.authTokenType === CONST.AUTH_TOKEN_TYPE.ANONYMOUS;
        if (!isAnonymousUser) {
            // Signing in RHP is only for anonymous users
            Navigation.isNavigationReady().then(() => Navigation.dismissModal());
        }
    }, [session?.authTokenType]);

    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS.RIGHT_MODAL.SIGN_IN].backgroundColor)]}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            shouldShowOfflineIndicator={false}
            testID={SignInModal.displayName}
        >
            <HeaderWithBackButton onBackButtonPress={() => Navigation.goBack()} />
            <SignInPage shouldEnableMaxHeight={false} />
        </ScreenWrapper>
    );
}

SignInModal.displayName = 'SignInModal';

export default withOnyx<SignInModalProps, SignInModalOnyxProps>({
    session: {key: ONYXKEYS.SESSION},
})(SignInModal);
