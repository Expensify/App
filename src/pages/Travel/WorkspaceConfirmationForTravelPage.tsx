import type {StackScreenProps} from '@react-navigation/stack';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {createDraftWorkspace, createWorkspace} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceConfirmationForTravelPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.WORKSPACE_CONFIRMATION>;

function WorkspaceConfirmationForTravelPage({route}: WorkspaceConfirmationForTravelPageProps) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true, selector: hasSeenTourSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const goBack = () => {
        Navigation.goBack(route.params?.backTo ?? ROUTES.TRAVEL_UPGRADE.route);
    };

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
            introSelected,
            activePolicyID,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            isSelfTourViewed,
        });
        goBack();
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="WorkspaceConfirmationForTravelPage"
        >
            <WorkspaceConfirmationForm
                onBackButtonPress={goBack}
                onSubmit={onSubmit}
            />
        </ScreenWrapper>
    );
}

export default WorkspaceConfirmationForTravelPage;
