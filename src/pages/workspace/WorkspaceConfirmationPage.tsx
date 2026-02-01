import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import {generatePolicyID} from '@libs/actions/Policy/Policy';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LastPaymentMethodType} from '@src/types/onyx';

function WorkspaceConfirmationPage() {
    // It is necessary to use here isSmallScreenWidth because on a wide layout we should always navigate to ROUTES.WORKSPACE_OVERVIEW.
    // shouldUseNarrowLayout cannot be used to determine that as this screen is displayed in RHP and shouldUseNarrowLayout always returns true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const privateSubscription = usePrivateSubscription();
    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const policyID = params.policyID || generatePolicyID();
        const routeToNavigate = isSmallScreenWidth ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        createWorkspaceWithPolicyDraftAndNavigateToIt({
            introSelected,
            policyOwnerEmail: params.owner,
            policyName: params.name,
            transitionFromOldDot: false,
            makeMeAdmin: params.makeMeAdmin,
            backTo: '',
            policyID,
            currency: params.currency,
            file: params.avatarFile as File,
            routeToNavigateAfterCreate: routeToNavigate,
            lastUsedPaymentMethod: lastPaymentMethod?.[policyID] as LastPaymentMethodType,
            activePolicyID,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            shouldCreateControlPolicy: isSubscriptionTypeOfInvoicing(privateSubscription?.type),
        });
    };
    const currentUrl = getCurrentUrl();
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = currentUrl ? (new URL(currentUrl).searchParams.get('ownerEmail') ?? '') : '';

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID="WorkspaceConfirmationPage"
        >
            <WorkspaceConfirmationForm
                policyOwnerEmail={policyOwnerEmail}
                onSubmit={onSubmit}
            />
        </ScreenWrapper>
    );
}

export default WorkspaceConfirmationPage;
