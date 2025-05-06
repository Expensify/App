import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import {generatePolicyID} from '@libs/actions/Policy/Policy';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import ROUTES from '@src/ROUTES';

function WorkspaceConfirmationPage() {
    // It is necessary to use here isSmallScreenWidth because on a wide layout we should always navigate to ROUTES.WORKSPACE_OVERVIEW.
    // shouldUseNarrowLayout cannot be used to determine that as this screen is displayed in RHP and shouldUseNarrowLayout always returns true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const policyID = params.policyID || generatePolicyID();
        const routeToNavigate = isSmallScreenWidth ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        createWorkspaceWithPolicyDraftAndNavigateToIt('', params.name, false, false, '', policyID, params.currency, params.avatarFile as File, routeToNavigate);
    };
    const currentUrl = getCurrentUrl();
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = currentUrl ? new URL(currentUrl).searchParams.get('ownerEmail') ?? '' : '';

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={WorkspaceConfirmationPage.displayName}
        >
            <WorkspaceConfirmationForm
                policyOwnerEmail={policyOwnerEmail}
                onSubmit={onSubmit}
            />
        </ScreenWrapper>
    );
}

WorkspaceConfirmationPage.displayName = 'WorkspaceConfirmationPage';

export default WorkspaceConfirmationPage;
