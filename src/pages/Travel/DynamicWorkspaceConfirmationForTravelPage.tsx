import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';

import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useOnyx from '@hooks/useOnyx';

import {createDraftWorkspace, createWorkspace} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';

function DynamicWorkspaceConfirmationForTravelPage() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.TRAVEL_WORKSPACE_CONFIRMATION.path);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });

    const activePolicy = useActivePolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        createDraftWorkspace({
            introSelected,
            workspaceName: params.name,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            currentUserEmail: currentUserPersonalDetails.email ?? '',
            policyID: params.policyID,
            currency: params.currency || (currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD),
            file: params.avatarFile as File,
        });
        createWorkspace({
            policyName: params.name,
            policyID: params.policyID,
            engagementChoice: undefined,
            currency: params.currency,
            file: params.avatarFile as File,
            introSelected,
            activePolicy,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            betas,
            isSelfTourViewed,
            hasActiveAdminPolicies,
        });
        goBack();
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="DynamicWorkspaceConfirmationForTravelPage"
        >
            <WorkspaceConfirmationForm
                onBackButtonPress={goBack}
                onSubmit={onSubmit}
            />
        </ScreenWrapper>
    );
}

export default DynamicWorkspaceConfirmationForTravelPage;
