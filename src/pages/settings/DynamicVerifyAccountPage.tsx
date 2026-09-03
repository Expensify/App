import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {getAccessiblePolicies} from '@userActions/Policy/Policy';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import VerifyAccountPageBase from './VerifyAccountPageBase';

type DynamicVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT>;

function DynamicVerifyAccountPage({route}: DynamicVerifyAccountPageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    let forwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    const isJoinWorkspaceTask = route.params?.isJoinWorkspaceTask === 'true';

    if (backPath === ROUTES.SETTINGS_WALLET) {
        forwardPath = ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute();
    }

    if (isJoinWorkspaceTask) {
        forwardPath = ROUTES.ONBOARDING_WORKSPACES.getRoute();
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
            onValidationSuccess={isJoinWorkspaceTask ? getAccessiblePolicies : undefined}
        />
    );
}

export default DynamicVerifyAccountPage;
