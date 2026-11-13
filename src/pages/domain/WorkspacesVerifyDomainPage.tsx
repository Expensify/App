import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import BaseVerifyDomainPage from './BaseVerifyDomainPage';

type WorkspacesVerifyDomainPageProps = PlatformStackScreenProps<WorkspacesDomainModalNavigatorParamList, typeof SCREENS.WORKSPACES_VERIFY_DOMAIN>;

function WorkspacesVerifyDomainPage({route}: WorkspacesVerifyDomainPageProps) {
    const domainAccountID = route.params?.domainAccountID;

    if (!domainAccountID) {
        return <NotFoundPage onLinkPress={() => Navigation.dismissModal()} />;
    }

    return (
        <BaseVerifyDomainPage
            domainAccountID={domainAccountID}
            forwardTo={ROUTES.WORKSPACES_DOMAIN_VERIFIED.getRoute(domainAccountID)}
            fallbackTo={ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(domainAccountID)}
            shouldDismissForVerifiedAdmin
        />
    );
}

export default WorkspacesVerifyDomainPage;
