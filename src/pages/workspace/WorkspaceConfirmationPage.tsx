import {useRoute} from '@react-navigation/native';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import {generatePolicyID} from '@libs/actions/Policy/Policy';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceConfirmationNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

function WorkspaceConfirmationPage() {
    const route = useRoute<PlatformStackRouteProp<WorkspaceConfirmationNavigatorParamList, typeof SCREENS.WORKSPACE_CONFIRMATION.ROOT>>();

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const policyID = params.policyID || generatePolicyID();
        createWorkspaceWithPolicyDraftAndNavigateToIt('', params.name, false, false, route.params?.backTo, policyID, params.currency, params.avatarFile as File);
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
