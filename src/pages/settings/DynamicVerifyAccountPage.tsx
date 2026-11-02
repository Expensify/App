import {useRoute} from '@react-navigation/native';
import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import VerifyAccountPageBase from './VerifyAccountPageBase';

type DynamicVerifyAccountPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT>['route'];

function DynamicVerifyAccountPage() {
    const route = useRoute<DynamicVerifyAccountPageRoute>();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    let forwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);

    if (forwardPath === ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.route) {
        forwardPath = ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.getRoute(route.params?.backTo);
    } else if (backPath === ROUTES.SETTINGS_WALLET) {
        forwardPath = ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute();
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
        />
    );
}

export default DynamicVerifyAccountPage;
