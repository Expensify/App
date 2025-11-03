import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import BaseVerifyDomainPage from './VerifyDomainPage';

type SamlVerifyDomainPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VERIFY>;

function SamlVerifyDomainPage({route}: SamlVerifyDomainPageProps) {
    return (
        <BaseVerifyDomainPage
            accountID={route.params.accountID}
            forwardTo="DOMAIN_VERIFIED"
        />
    );
}

SamlVerifyDomainPage.displayName = 'SamlVerifyDomainPage';
export default SamlVerifyDomainPage;
