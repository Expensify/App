import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';

import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {LastPaymentMethodType} from '@src/types/onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';

function DynamicWorkspaceConfirmationPage() {
    // It is necessary to use here isSmallScreenWidth because on a wide layout we should always navigate to ROUTES.WORKSPACE_OVERVIEW.
    // shouldUseNarrowLayout cannot be used to determine that as this screen is displayed in RHP and shouldUseNarrowLayout always returns true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const privateSubscription = usePrivateSubscription();
    const isAnnualSubscription = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const activePolicy = useActivePolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();

    // On narrow layout the new workspace is mounted under this RHP and revealed when the modal
    // dismisses (via revealRouteBeforeDismissingModal). The reveal waits for the new screen to lay
    // out before sliding the RHP out, so we show a spinner on the Confirm button as immediate
    // feedback. It clears when this page unmounts together with the RHP.
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        // policyID is always supplied by WorkspaceConfirmationForm (stable per form instance).
        const policyID = params.policyID;
        const isDifferentOwner = !!params.owner && params.owner !== (currentUserPersonalDetails.email ?? '');
        const shouldShowSuccessPage = isDifferentOwner && !params.makeMeAdmin;
        const workspaceRoute = isSmallScreenWidth ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        const routeToNavigate = shouldShowSuccessPage ? ROUTES.WORKSPACE_CONFIRMATION_SUCCESS : workspaceRoute;
        if (!shouldShowSuccessPage && isSmallScreenWidth) {
            setIsCreatingWorkspace(true);
        }
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
            activePolicy,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            shouldCreateControlPolicy: isSubscriptionTypeOfInvoicing(privateSubscription?.type),
            type: params.planType,
            isSelfTourViewed,
            betas,
            hasActiveAdminPolicies,
            isAnnualSubscription,
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
            testID="DynamicWorkspaceConfirmationPage"
        >
            <WorkspaceConfirmationForm
                policyOwnerEmail={policyOwnerEmail}
                onSubmit={onSubmit}
                isLoading={isCreatingWorkspace}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
        </ScreenWrapper>
    );
}

export default DynamicWorkspaceConfirmationPage;
