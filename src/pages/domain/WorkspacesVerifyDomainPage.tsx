import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseVerifyDomainPage from './BaseVerifyDomainPage';

type WorkspacesVerifyDomainPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_VERIFY_DOMAIN>;

function WorkspacesVerifyDomainPage({route}: WorkspacesVerifyDomainPageProps) {
    const {domainAccountID} = route.params;

    return (
        <BaseVerifyDomainPage
            domainAccountID={domainAccountID}
            forwardTo={ROUTES.WORKSPACES_DOMAIN_VERIFIED.getRoute(domainAccountID)}
        />
    );
}

export default WorkspacesVerifyDomainPage;
