import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect, useRef, useState} from 'react';
import Onyx from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';
import useActivePolicy from '@hooks/useActivePolicy';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import {createDraftInitialWorkspace, generatePolicyID} from '@libs/actions/Policy/Policy';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {LastPaymentMethodType} from '@src/types/onyx';

function WorkspaceConfirmationPage() {
    // It is necessary to use here isSmallScreenWidth because on a wide layout we should always navigate to ROUTES.WORKSPACE_OVERVIEW.
    // shouldUseNarrowLayout cannot be used to determine that as this screen is displayed in RHP and shouldUseNarrowLayout always returns true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const privateSubscription = usePrivateSubscription();
    const isAnnualSubscription = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const activePolicy = useActivePolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();

    // Generated once so the same id can be used for the mount-time draft seed, the pre-insert
    // route and the submit handler.
    const [policyID] = useState(() => generatePolicyID());
    const hasSubmitted = useRef(false);

    // Live form values so the seed effect below uses the same currency the user has selected.
    // Keeping the seed and the eventual submit-time draft on the same currency means the
    // distance-rate custom units built by createDraftInitialWorkspace match across both writes —
    // no icon flicker when the modal dismisses.
    const [confirmationDraftValues] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM_DRAFT);
    const seedCurrency = confirmationDraftValues?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    // Narrow-only seed: keep a draft policy in POLICY_DRAFTS so the pre-inserted WORKSPACE_INITIAL
    // (mounted under the RHP by the effect below) renders actual content instead of the
    // FullscreenLoadingIndicator from withPolicyAndFullscreenLoading. POLICY_DRAFTS is excluded
    // from WorkspacesListPage / sidebar so the seed never leaks to a user-visible list.
    // Re-runs when seedCurrency changes so the customUnits match the user's final selection.
    useEffect(() => {
        if (!isSmallScreenWidth) {
            return;
        }
        createDraftInitialWorkspace(introSelected, '', currentUserPersonalDetails.accountID, currentUserPersonalDetails.email ?? '', policyID, false, seedCurrency);
    }, [isSmallScreenWidth, policyID, introSelected, currentUserPersonalDetails.accountID, currentUserPersonalDetails.email, seedCurrency]);

    // Pre-insert + cleanup. Stable for the page's lifetime so we don't churn the navigation state
    // or the seed on form edits — only on mount/unmount.
    //
    // Fired immediately (no PRE_INSERT_FULLSCREEN_DELAY): the IOU flow defers pre-insert by ~300ms
    // because its destination report is heavy to mount and would slow the confirmation page. Our
    // destination is just WORKSPACE_INITIAL, which is lighter, and the delay leaves a window where
    // fast submitters fall back to revealRouteBeforeDismissingModal — that path push-animates the
    // destination from the right (the slide the user sees). Firing on mount means every submit
    // takes the fast (animation-NONE) path.
    useEffect(() => {
        if (!isSmallScreenWidth) {
            return;
        }
        const preInsertRoute: Route = ROUTES.WORKSPACE_INITIAL.getRoute(policyID);
        Navigation.preInsertFullscreenUnderRHP(preInsertRoute, {collapseTabToLeaf: true});

        return () => {
            if (hasSubmitted.current) {
                return;
            }
            if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                Navigation.removePreInsertedFullscreenIfNeeded();
            }
            // Discard the mount-time seed so it never leaks to other surfaces.
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`, null);
        };
    }, [isSmallScreenWidth, policyID]);

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        hasSubmitted.current = true;
        const isDifferentOwner = !!params.owner && params.owner !== (currentUserPersonalDetails.email ?? '');
        const shouldShowSuccessPage = isDifferentOwner && !params.makeMeAdmin;
        const workspaceRoute = isSmallScreenWidth ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        const routeToNavigate = shouldShowSuccessPage ? ROUTES.WORKSPACE_CONFIRMATION_SUCCESS : workspaceRoute;
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
            testID="WorkspaceConfirmationPage"
        >
            <WorkspaceConfirmationForm
                policyOwnerEmail={policyOwnerEmail}
                policyID={policyID}
                onSubmit={onSubmit}
            />
        </ScreenWrapper>
    );
}

export default WorkspaceConfirmationPage;
