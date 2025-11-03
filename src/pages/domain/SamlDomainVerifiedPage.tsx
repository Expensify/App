import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import DomainVerifiedPage from './DomainVerifiedPage';

type SamlDomainVerifiedPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VERIFIED>;

function SamlDomainVerifiedPage({route}: SamlDomainVerifiedPageProps) {
    return (
        <DomainVerifiedPage
            accountID={route.params.accountID}
            redirectTo="DOMAIN_VERIFY"
        />
    );
}

SamlDomainVerifiedPage.displayName = 'SamlDomainVerifiedPage';
export default SamlDomainVerifiedPage;
