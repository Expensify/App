import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import type {PublicScreensParamList} from '@navigation/types';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Account} from '@src/types/onyx';

type UnlinkLoginPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type UnlinkLoginPageProps = UnlinkLoginPageOnyxProps & StackScreenProps<PublicScreensParamList, typeof SCREENS.UNLINK_LOGIN>;

function UnlinkLoginPage({route, account}: UnlinkLoginPageProps) {
    const accountID = route.params.accountID ?? -1;
    const validateCode = route.params.validateCode ?? '';
    const prevIsLoading = usePrevious(!!account?.isLoading);

    useEffect(() => {
        Session.unlinkLogin(Number(accountID), validateCode);
        // We only want this to run on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Only navigate when the unlink login request is completed
        if (!prevIsLoading || account?.isLoading) {
            return;
        }

        Navigation.goBack();
    }, [prevIsLoading, account?.isLoading]);

    return <FullScreenLoadingIndicator />;
}

UnlinkLoginPage.displayName = 'UnlinkLoginPage';

export default withOnyx<UnlinkLoginPageProps, UnlinkLoginPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(UnlinkLoginPage);
