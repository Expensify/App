import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import BaseVerifyDomainPage from './BaseVerifyDomainPage';

type VerifyDomainScreen = typeof SCREENS.DOMAIN.SAML_VERIFY | typeof SCREENS.DOMAIN.MEMBERS_VERIFY;

type VerifyDomainPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, VerifyDomainScreen>;

const FORWARD_ROUTES: Record<VerifyDomainScreen, (domainAccountID: number) => Route> = {
    [SCREENS.DOMAIN.SAML_VERIFY]: ROUTES.DOMAIN_SAML_VERIFIED.getRoute,
    [SCREENS.DOMAIN.MEMBERS_VERIFY]: ROUTES.DOMAIN_MEMBERS_VERIFIED.getRoute,
};

function VerifyDomainPage({route}: VerifyDomainPageProps) {
    const {domainAccountID} = route.params;
    const shouldReturnToGroups = route.name === SCREENS.DOMAIN.MEMBERS_VERIFY && 'source' in route.params && route.params.source === 'groups';

    return (
        <BaseVerifyDomainPage
            domainAccountID={domainAccountID}
            forwardTo={shouldReturnToGroups ? ROUTES.DOMAIN_MEMBERS_VERIFIED.getRoute(domainAccountID, 'groups') : FORWARD_ROUTES[route.name](domainAccountID)}
        />
    );
}

export default VerifyDomainPage;
