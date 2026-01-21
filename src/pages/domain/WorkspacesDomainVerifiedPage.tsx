import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseDomainVerifiedPage from './BaseDomainVerifiedPage';

type WorkspacesDomainVerifiedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_VERIFIED>;

function WorkspacesDomainVerifiedPage({route}: WorkspacesDomainVerifiedPageProps) {
    const {domainAccountID} = route.params;

    return (
        <BaseDomainVerifiedPage
            domainAccountID={domainAccountID}
            redirectTo={ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(domainAccountID)}
        />
    );
}

export default WorkspacesDomainVerifiedPage;
