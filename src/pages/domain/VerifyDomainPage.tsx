import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import BaseVerifyDomainPage from './BaseVerifyDomainPage';

type VerifyDomainPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VERIFY>;

function VerifyDomainPage({route}: VerifyDomainPageProps) {
    return (
        <BaseVerifyDomainPage
            accountID={route.params.accountID}
            forwardTo="DOMAIN_VERIFIED"
        />
    );
}

VerifyDomainPage.displayName = 'WorkspacesVerifyDomainPage';
export default VerifyDomainPage;
