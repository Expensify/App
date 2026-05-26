import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import BaseDomainVerifiedPage from './BaseDomainVerifiedPage';

type DomainVerifiedScreen = typeof SCREENS.DOMAIN.SAML_VERIFIED | typeof SCREENS.DOMAIN.MEMBERS_VERIFIED;

type DomainVerifiedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, DomainVerifiedScreen>;

const REDIRECT_ROUTES: Record<DomainVerifiedScreen, (domainAccountID: number) => Route> = {
    [SCREENS.DOMAIN.SAML_VERIFIED]: ROUTES.DOMAIN_SAML_VERIFY.getRoute,
    [SCREENS.DOMAIN.MEMBERS_VERIFIED]: ROUTES.DOMAIN_MEMBERS_VERIFY.getRoute,
};

const CONFIRM_ROUTES: Record<DomainVerifiedScreen, (domainAccountID: number) => Route> = {
    [SCREENS.DOMAIN.SAML_VERIFIED]: ROUTES.DOMAIN_SAML.getRoute,
    [SCREENS.DOMAIN.MEMBERS_VERIFIED]: ROUTES.DOMAIN_MEMBERS.getRoute,
};

function DomainVerifiedPage({route}: DomainVerifiedPageProps) {
    const {domainAccountID} = route.params;

    return (
        <BaseDomainVerifiedPage
            domainAccountID={domainAccountID}
            redirectTo={REDIRECT_ROUTES[route.name](domainAccountID)}
            confirmDestination={CONFIRM_ROUTES[route.name](domainAccountID)}
        />
    );
}

export default DomainVerifiedPage;
