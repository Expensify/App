/**
 * Workspace-creation starters kept outside `App.ts` so that `App.ts` does not import the policy action module and close an import cycle.
 */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import getCurrentUrl from '@libs/Navigation/currentUrl';
import willRouteNavigateToRHP from '@libs/Navigation/helpers/willRouteNavigateToRHP';
import WorkspaceCreationReveal from '@libs/Navigation/helpers/WorkspaceCreationReveal';
import Navigation from '@libs/Navigation/Navigation';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {isLoggingInAsNewUser as isLoggingInAsNewUserSessionUtils} from '@libs/SessionUtils';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import type {PolicyOwner} from './PolicyDraft';

import {createWorkspace} from './Policy';
import {createDraftInitialWorkspace, generateDefaultWorkspaceName, generatePolicyID} from './PolicyDraft';

type PolicyType = typeof CONST.POLICY.TYPE.TEAM | typeof CONST.POLICY.TYPE.CORPORATE;

type CreateWorkspaceWithPolicyDraftParams = {
    isSelfTourViewed: boolean | undefined;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    policyOwner?: PolicyOwner;
    policyName: string;
    transitionFromOldDot?: boolean;
    makeMeAdmin?: boolean;
    backTo?: string;
    policyID?: string;
    currency: string;
    file?: File;
    routeToNavigateAfterCreate?: Route;
    activePolicy: OnyxEntry<OnyxTypes.Policy>;
    conciergeChat: OnyxEntry<OnyxTypes.Report>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    shouldCreateControlPolicy?: boolean;
    type?: PolicyType;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    hasActiveAdminPolicies: boolean;
    hasOwnedPaidPolicy: boolean;
    isAnnualSubscription?: boolean;
    /** AccountID of the delegate acting on behalf of the current user */
    delegateAccountID: number | undefined;
};

/**
 * Create a new draft workspace and navigate to it
 */
function createWorkspaceWithPolicyDraftAndNavigateToIt(params: CreateWorkspaceWithPolicyDraftParams) {
    const {
        introSelected,
        policyOwner,
        policyName,
        transitionFromOldDot = false,
        makeMeAdmin = false,
        backTo = '',
        policyID = '',
        currency,
        file,
        routeToNavigateAfterCreate,
        activePolicy,
        conciergeChat,
        currentUserAccountIDParam,
        currentUserEmailParam,
        shouldCreateControlPolicy,
        type,
        isSelfTourViewed,
        betas,
        hasActiveAdminPolicies,
        hasOwnedPaidPolicy,
        isAnnualSubscription = false,
        delegateAccountID,
    } = params;

    const policyIDWithDefault = policyID || generatePolicyID();
    createDraftInitialWorkspace({
        introSelected,
        workspaceName: policyName,
        currentUserAccountID: currentUserAccountIDParam,
        currentUserEmail: currentUserEmailParam,
        currency,
        policyID: policyIDWithDefault,
        makeMeAdmin,
        file,
        type,
    });
    Navigation.isNavigationReady().then(() => {
        if (transitionFromOldDot) {
            // We must call goBack() to remove the /transition route from history
            Navigation.goBack();
        }
        const routeToNavigate = routeToNavigateAfterCreate ?? ROUTES.WORKSPACE_INITIAL.getRoute(policyIDWithDefault, backTo);
        savePolicyDraftByNewWorkspace({
            policyID: policyIDWithDefault,
            policyName,
            policyOwner,
            makeMeAdmin,
            currency,
            file,
            introSelected,
            activePolicy,
            conciergeChat,
            currentUserAccountIDParam,
            currentUserEmailParam,
            shouldCreateControlPolicy,
            type,
            isSelfTourViewed,
            betas,
            hasActiveAdminPolicies,
            hasOwnedPaidPolicy,
            isAnnualSubscription,
            delegateAccountID,
        });

        if (transitionFromOldDot) {
            Navigation.navigate(routeToNavigate);
        } else if (Navigation.isTopmostRouteModalScreen()) {
            // `revealRouteBeforeDismissingModal` only works for fullscreen targets. Modal targets
            // (e.g. workspace confirmation success) still need to open after the current RHP closes.
            if (willRouteNavigateToRHP(routeToNavigate)) {
                Navigation.dismissModal({
                    afterTransition: () => Navigation.navigate(routeToNavigate),
                });
                return;
            }

            WorkspaceCreationReveal.beginRevealUnderRHP();
            Navigation.revealRouteBeforeDismissingModal(routeToNavigate);
        } else {
            Navigation.navigate(routeToNavigate, {forceReplace: true});
        }
    });
}

function createWorkspaceWithPolicyDraft(params: CreateWorkspaceWithPolicyDraftParams) {
    const {
        introSelected,
        policyName,
        makeMeAdmin = false,
        policyID = '',
        currency,
        file,
        activePolicy,
        conciergeChat,
        currentUserAccountIDParam,
        currentUserEmailParam,
        shouldCreateControlPolicy,
        isSelfTourViewed,
        betas,
        hasActiveAdminPolicies,
        delegateAccountID,
        hasOwnedPaidPolicy,
    } = params;

    createDraftInitialWorkspace({
        introSelected,
        workspaceName: policyName,
        currentUserAccountID: currentUserAccountIDParam,
        currentUserEmail: currentUserEmailParam,
        currency,
        policyID,
        makeMeAdmin,
        file,
    });
    savePolicyDraftByNewWorkspace({
        policyID,
        policyName,
        makeMeAdmin,
        currency,
        file,
        introSelected,
        activePolicy,
        conciergeChat,
        currentUserAccountIDParam,
        currentUserEmailParam,
        shouldCreateControlPolicy,
        isSelfTourViewed,
        betas,
        hasActiveAdminPolicies,
        delegateAccountID,
        hasOwnedPaidPolicy,
    });
}

type SavePolicyDraftByNewWorkspaceParams = {
    isSelfTourViewed: boolean | undefined;
    policyID?: string;
    policyName: string;
    policyOwner?: PolicyOwner;
    makeMeAdmin?: boolean;
    currency?: string;
    file?: File;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicy: OnyxEntry<OnyxTypes.Policy>;
    conciergeChat: OnyxEntry<OnyxTypes.Report>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    shouldCreateControlPolicy?: boolean;
    type?: PolicyType;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    hasActiveAdminPolicies: boolean;
    hasOwnedPaidPolicy: boolean;
    isAnnualSubscription?: boolean;
    delegateAccountID: number | undefined;
};

/**
 * Create a new workspace and delete the draft
 */
function savePolicyDraftByNewWorkspace({
    policyID,
    policyName,
    policyOwner,
    makeMeAdmin = false,
    currency = '',
    file,
    introSelected,
    activePolicy,
    conciergeChat,
    currentUserAccountIDParam,
    currentUserEmailParam,
    shouldCreateControlPolicy,
    type,
    isSelfTourViewed,
    betas,
    hasActiveAdminPolicies,
    hasOwnedPaidPolicy,
    isAnnualSubscription = false,
    delegateAccountID,
}: SavePolicyDraftByNewWorkspaceParams) {
    createWorkspace({
        policyOwner,
        makeMeAdmin,
        policyName,
        policyID,
        engagementChoice: isTrackOnboardingChoice(introSelected?.choice) ? CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE : CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
        currency,
        file,
        introSelected,
        activePolicy,
        conciergeChat,
        currentUserAccountIDParam,
        currentUserEmailParam,
        shouldCreateControlPolicy,
        type,
        isSelfTourViewed,
        betas,
        hasActiveAdminPolicies,
        hasOwnedPaidPolicy,
        isAnnualSubscription,
        delegateAccountID,
    });
}

/**
 * This action runs when the Navigator is ready and the current route changes
 *
 * currentPath should be the path as reported by the NavigationContainer
 *
 * The transition link contains an exitTo param that contains the route to
 * navigate to after the user is signed in. A user can transition from OldDot
 * with a different account than the one they are currently signed in with, so
 * we only navigate if they are not signing in as a new user. Once they are
 * signed in as that new user, this action will run again and the navigation
 * will occur.

 * When the exitTo route is 'workspace/new', we create a new
 * workspace and navigate to it
 */
type SetUpPoliciesAndNavigateParams = {
    session: OnyxEntry<OnyxTypes.Session>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    currency: string;
    activePolicy: OnyxEntry<OnyxTypes.Policy>;
    isSelfTourViewed: boolean | undefined;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    hasActiveAdminPolicies: boolean;
    lastWorkspaceNumber: number | undefined;
    translate: LocalizedTranslate;
    conciergeChat: OnyxEntry<OnyxTypes.Report>;
    policyOwnerAccountID: number | undefined;
    policyOwnerDisplayName: string | undefined;
    hasOwnedPaidPolicy: boolean;
    delegateAccountID: number | undefined;
};

function setUpPoliciesAndNavigate({
    session,
    introSelected,
    currency,
    activePolicy,
    isSelfTourViewed,
    betas,
    hasActiveAdminPolicies,
    hasOwnedPaidPolicy,
    lastWorkspaceNumber,
    translate,
    conciergeChat,
    policyOwnerAccountID,
    policyOwnerDisplayName,
    delegateAccountID,
}: SetUpPoliciesAndNavigateParams) {
    const currentUrl = getCurrentUrl();
    if (!session || !currentUrl?.includes('exitTo')) {
        return;
    }

    const isLoggingInAsNewUser = !!session.email && isLoggingInAsNewUserSessionUtils(currentUrl, session.email);
    const url = new URL(currentUrl);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the exitTo query param holds a route path coming from a transition link
    const exitTo = url.searchParams.get('exitTo') as Route | null;

    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = url.searchParams.get('ownerEmail') ?? session.email ?? '';
    const makeMeAdmin = !!url.searchParams.get('makeMeAdmin');
    const policyName = url.searchParams.get('policyName') ?? '';

    // Sign out the current user if we're transitioning with a different user
    const isTransitioning = Str.startsWith(url.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS));

    const shouldCreateFreePolicy = !isLoggingInAsNewUser && isTransitioning && exitTo === ROUTES.WORKSPACE_NEW;
    if (shouldCreateFreePolicy) {
        createWorkspaceWithPolicyDraftAndNavigateToIt({
            introSelected,
            currency,
            policyOwner: {email: policyOwnerEmail, accountID: policyOwnerAccountID},
            policyName: policyName || generateDefaultWorkspaceName(policyOwnerEmail, policyOwnerDisplayName, lastWorkspaceNumber, translate),
            transitionFromOldDot: true,
            makeMeAdmin,
            activePolicy,
            conciergeChat,
            currentUserAccountIDParam: session.accountID ?? CONST.DEFAULT_NUMBER_ID,
            currentUserEmailParam: session.email ?? '',
            isSelfTourViewed,
            betas,
            hasActiveAdminPolicies,
            delegateAccountID,
            hasOwnedPaidPolicy,
        });
        return;
    }
    if (!isLoggingInAsNewUser && exitTo) {
        Navigation.waitForProtectedRoutes().then(() => {
            Navigation.navigate(exitTo);
        });
    }
}

export {createWorkspaceWithPolicyDraft, createWorkspaceWithPolicyDraftAndNavigateToIt, setUpPoliciesAndNavigate};
