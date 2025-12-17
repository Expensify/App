import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseDomainVerifiedPage from './BaseDomainVerifiedPage';

type SamlDomainVerifiedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VERIFIED>;

function SamlDomainVerifiedPage({route}: SamlDomainVerifiedPageProps) {
    const {domainAccountID} = route.params;

    return (
        <BaseDomainVerifiedPage
            domainAccountID={domainAccountID}
            redirectTo={ROUTES.DOMAIN_VERIFY.getRoute(domainAccountID)}
        />
    );
}

export default SamlDomainVerifiedPage;
