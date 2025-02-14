import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import getCurrentUrl from '@libs/Navigation/currentUrl';

function WorkspaceConfirmationPage() {
    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        createWorkspaceWithPolicyDraftAndNavigateToIt('', params.name, false, false, '', params.policyID, params.currency, params.avatarFile as File);
    };
    const currentUrl = getCurrentUrl();
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = currentUrl ? new URL(currentUrl).searchParams.get('ownerEmail') ?? '' : '';

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
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
