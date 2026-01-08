import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseVerifyDomainPage from './BaseVerifyDomainPage';

type SamlVerifyDomainPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VERIFY>;

function SamlVerifyDomainPage({route}: SamlVerifyDomainPageProps) {
    const {domainAccountID} = route.params;

    return (
        <BaseVerifyDomainPage
            domainAccountID={domainAccountID}
            forwardTo={ROUTES.DOMAIN_VERIFIED.getRoute(route.params.domainAccountID)}
        />
    );
}

export default SamlVerifyDomainPage;
