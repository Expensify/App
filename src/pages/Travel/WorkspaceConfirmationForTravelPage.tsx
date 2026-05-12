import type {StackScreenProps} from '@react-navigation/stack';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useOnyx from '@hooks/useOnyx';
import {createDraftWorkspace, createWorkspace} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {TravelNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceConfirmationForTravelPageProps = StackScreenProps<TravelNavigatorParamList, typeof SCREENS.TRAVEL.WORKSPACE_CONFIRMATION>;

function WorkspaceConfirmationForTravelPage({route}: WorkspaceConfirmationForTravelPageProps) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const activePolicy = useActivePolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();

    const goBack = () => {
        Navigation.goBack(route.params?.backTo ?? ROUTES.TRAVEL_UPGRADE.route);
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
