import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import BaseVerifyDomainPage from './VerifyDomainPage';

type WorkspacesVerifyDomainPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_VERIFY_DOMAIN>;

function WorkspacesVerifyDomainPage({route}: WorkspacesVerifyDomainPageProps) {
    return (
        <BaseVerifyDomainPage
            accountID={route.params.accountID}
            forwardTo="WORKSPACES_DOMAIN_VERIFIED"
        />
    );
}

WorkspacesVerifyDomainPage.displayName = 'WorkspacesVerifyDomainPage';
export default WorkspacesVerifyDomainPage;
