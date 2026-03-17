import React from 'react';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import CopyCodesPage from './CopyCodesPage';
import EnabledPage from './EnabledPage';

type TwoFactorAuthPageProps = PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.ROOT>;

function TwoFactorAuthPage(props: TwoFactorAuthPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    if (account?.requiresTwoFactorAuth) {
        return <EnabledPage />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <CopyCodesPage {...props} />;
}

export default TwoFactorAuthPage;
export type {TwoFactorAuthPageProps};
