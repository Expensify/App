import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import BaseDomainVerifiedPage from './BaseDomainVerifiedPage';

type WorkspacesDomainVerifiedPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_DOMAIN_VERIFIED>;

function WorkspacesDomainVerifiedPage({route}: WorkspacesDomainVerifiedPageProps) {
    const accountID = route.params.accountID;

    return (
        <BaseDomainVerifiedPage
            accountID={accountID}
            redirectTo={ROUTES.WORKSPACES_VERIFY_DOMAIN.getRoute(accountID)}
            navigateAfterConfirmation={() => Navigation.dismissModal()}
        />
    );
}

WorkspacesDomainVerifiedPage.displayName = 'WorkspacesDomainVerifiedPage';
export default WorkspacesDomainVerifiedPage;
