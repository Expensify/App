import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useOnyx from '@hooks/useOnyx';
import {createDraftWorkspace, createWorkspace} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';

function WorkspaceConfirmationForTravelPage() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        createDraftWorkspace(introSelected, '', false, params.name, params.policyID, params.currency, params.avatarFile as File);
        createWorkspace({
            policyOwnerEmail: '',
            makeMeAdmin: false,
            policyName: params.name,
            policyID: params.policyID,
            engagementChoice: undefined,
            currency: params.currency,
            file: params.avatarFile as File,
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={WorkspaceConfirmationForTravelPage.displayName}
        >
            <WorkspaceConfirmationForm onSubmit={onSubmit} />
        </ScreenWrapper>
    );
}

WorkspaceConfirmationForTravelPage.displayName = 'WorkspaceConfirmationForTravelPage';

export default WorkspaceConfirmationForTravelPage;
