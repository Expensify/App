import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import DomainVerifiedPage from './DomainVerifiedPage';

type WorkspacesDomainVerifiedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_VERIFIED>;

function WorkspacesDomainVerifiedPage({route}: WorkspacesDomainVerifiedPageProps) {
    return (
        <DomainVerifiedPage
            accountID={route.params.accountID}
            redirectTo="WORKSPACES_VERIFY_DOMAIN"
        />
    );
}

WorkspacesDomainVerifiedPage.displayName = 'WorkspacesDomainVerifiedPage';
export default WorkspacesDomainVerifiedPage;
