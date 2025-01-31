import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import CodesStepPage from './CodesStepPage';
import EnabledStepPage from './EnabledStepPage';

type TwoFactorAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH.ROOT>;

function TwoFactorAuthPage(props: TwoFactorAuthPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    if (account?.requiresTwoFactorAuth) {
        return <EnabledStepPage />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <CodesStepPage {...props} />;
}

export default TwoFactorAuthPage;
export type {TwoFactorAuthPageProps};
