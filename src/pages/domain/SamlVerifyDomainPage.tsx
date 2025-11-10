import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseVerifyDomainPage from './BaseVerifyDomainPage';

type SamlVerifyDomainPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VERIFY>;

function SamlVerifyDomainPage({route}: SamlVerifyDomainPageProps) {
    const accountID = route.params.accountID;

    return (
        <BaseVerifyDomainPage
            accountID={accountID}
            forwardTo={ROUTES.DOMAIN_VERIFIED.getRoute(route.params.accountID)}
        />
    );
}

SamlVerifyDomainPage.displayName = 'SamlVerifyDomainPage';
export default SamlVerifyDomainPage;
