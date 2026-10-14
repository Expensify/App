import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';

import {openApp} from '@userActions/App';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Account, Locale, Onboarding} from '@src/types/onyx';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';

import {getStateFromPath} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import type {OnboardingCompanySize, OnboardingMessage, OnboardingPurpose, OnboardingTask, OnboardingTaskLinks} from './buildOnboardingMessages';

import {buildOnboardingMessages} from './buildOnboardingMessages';

type GetOnboardingInitialPathParamsType = {
    isUserFromPublicDomain: boolean;
    hasAccessiblePolicies: boolean;
    onboardingValuesParam?: Onboarding;
    currentOnboardingPurposeSelected: OnyxEntry<OnboardingPurpose>;
    currentOnboardingCompanySize: OnyxEntry<OnboardingCompanySize>;
    onboardingInitialPath: OnyxEntry<string> | null;
    onboardingValues: OnyxEntry<Onboarding>;
    isAccountValidated?: boolean;
    /** When set, startOnboardingFlow navigates here directly instead of re-deriving via getOnboardingInitialPath. */
    resumePath?: string;
};

let onboardingData: OnyxEntry<Onboarding>;

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        if (!value) {
            return;
        }
        onboardingData = value;
    },
});

/**
 * Start a new onboarding flow or continue from the last visited onboarding page.
 */
function startOnboardingFlow(startOnboardingFlowParams: GetOnboardingInitialPathParamsType) {
    const rootState = navigationRef.getRootState();

    if (rootState.routes.some((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR)) {
        return;
    }

    const onboardingPath = startOnboardingFlowParams.resumePath ?? getOnboardingInitialPath(startOnboardingFlowParams);
    const adaptedState = getAdaptedStateFromPath(onboardingPath as Route, undefined, false);
    const rootStateRouteNamesSet = new Set(rootState.routes.map((route) => route.name));

    navigationRef.resetRoot({
        ...rootState,
        ...adaptedState,
        stale: true,
        routes: [...rootState.routes, ...(adaptedState?.routes.filter((route) => !rootStateRouteNamesSet.has(route.name)) ?? [])],
    } as PartialState<NavigationState>);
}

function getOnboardingInitialPath(getOnboardingInitialPathParams: GetOnboardingInitialPathParamsType): string {
    const {
        isUserFromPublicDomain,
        hasAccessiblePolicies,
        onboardingValuesParam,
        currentOnboardingPurposeSelected,
        currentOnboardingCompanySize,
        onboardingInitialPath,
        onboardingValues,
        isAccountValidated,
    } = getOnboardingInitialPathParams;
    const initialPath = onboardingInitialPath ?? '';
    const state = getStateFromPath(initialPath, linkingConfig.config);
    const currentOnboardingValues = onboardingValuesParam ?? onboardingValues;
    const isVsb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const isVsbOrSmb = isVsb || isSmb;
    const isIndividual = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL;
    const isCurrentOnboardingPurposeManageTeam = currentOnboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM;

    if (isVsbOrSmb) {
        Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
    }

    if (isIndividual) {
        Onyx.set(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES, [
            CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
            CONST.ONBOARDING_CHOICES.EMPLOYER,
            CONST.ONBOARDING_CHOICES.TRACK_BUSINESS,
            CONST.ONBOARDING_CHOICES.TRACK_PERSONAL,
        ]);
    }
    // A validated account has no reason to be on the onboarding "add work email" screen.
    if (isUserFromPublicDomain && !onboardingValuesParam?.isMergeAccountStepCompleted && !isAccountValidated) {
        return `/${ROUTES.ONBOARDING_WORK_EMAIL.route}`;
    }

    // PRIVATE_DOMAIN ("People you may know are already here") only makes sense for users on a private domain. Only redirect
    // validated accounts; unvalidated users mid-AddWorkEmail can legitimately land here while isFromPublicDomain is stale.
    if (isUserFromPublicDomain && isAccountValidated && initialPath.includes(ROUTES.ONBOARDING_PRIVATE_DOMAIN.route)) {
        if (isVsbOrSmb) {
            return `/${ROUTES.ONBOARDING_EMPLOYEES.route}`;
        }
        return `/${ROUTES.ONBOARDING_PURPOSE.route}`;
    }

    if (!isUserFromPublicDomain && hasAccessiblePolicies) {
        if (initialPath) {
            return initialPath;
        }
        return `/${ROUTES.ONBOARDING_PERSONAL_DETAILS.route}`;
    }

    if (isVsbOrSmb) {
        return `/${ROUTES.ONBOARDING_EMPLOYEES.route}`;
    }

    if (state?.routes?.at(-1)?.name !== NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR) {
        return `/${ROUTES.ONBOARDING_ROOT.route}`;
    }

    if (initialPath.includes(ROUTES.ONBOARDING_EMPLOYEES.route) && currentOnboardingPurposeSelected !== null && !isCurrentOnboardingPurposeManageTeam) {
        return `/${ROUTES.ONBOARDING_PURPOSE.route}`;
    }

    if (
        (initialPath.includes(ROUTES.ONBOARDING_ACCOUNTING.route) || initialPath.includes(ROUTES.ONBOARDING_INTERESTED_FEATURES.route)) &&
        ((currentOnboardingPurposeSelected !== null && !isCurrentOnboardingPurposeManageTeam) || (currentOnboardingCompanySize === null && currentOnboardingPurposeSelected !== null))
    ) {
        return `/${ROUTES.ONBOARDING_PURPOSE.route}`;
    }

    return initialPath;
}

function buildOnboardingFlowParams(
    account: OnyxEntry<Account>,
    onboardingValues: OnyxEntry<Onboarding>,
    onboardingCompanySize: OnyxEntry<OnboardingCompanySize>,
    onboardingPurposeSelected: OnyxEntry<OnboardingPurpose>,
    onboardingInitialPath: OnyxEntry<string> | null,
): GetOnboardingInitialPathParamsType {
    return {
        onboardingValuesParam: onboardingValues ?? undefined,
        isUserFromPublicDomain: !!account?.isFromPublicDomain,
        hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
        currentOnboardingCompanySize: onboardingCompanySize,
        currentOnboardingPurposeSelected: onboardingPurposeSelected,
        onboardingInitialPath,
        onboardingValues,
        isAccountValidated: !!account?.validated,
    };
}

/**
 * Resolves the onboarding path to resume after required-2FA setup during incomplete guided setup.
 */
function getRequired2FAOnboardingResumePath(onboardingFlowParams: GetOnboardingInitialPathParamsType): string {
    const savedPath = onboardingFlowParams.onboardingInitialPath ?? '';

    if (savedPath.includes(ROUTES.ONBOARDING_WORK_EMAIL.route)) {
        return savedPath;
    }

    if (!savedPath || savedPath === `/${ROUTES.ONBOARDING_ROOT.route}`) {
        if (onboardingFlowParams.isUserFromPublicDomain) {
            return `/${ROUTES.ONBOARDING_WORK_EMAIL.route}`;
        }
        if (!onboardingFlowParams.isUserFromPublicDomain && onboardingFlowParams.hasAccessiblePolicies) {
            return `/${ROUTES.ONBOARDING_PERSONAL_DETAILS.route}`;
        }
    }

    return getOnboardingInitialPath(onboardingFlowParams);
}

/**
 * After required-2FA setup during incomplete guided setup, reload app data then resume onboarding.
 * Re-asserts incomplete onboarding after openApp (server may return empty nvp_onboarding) so AuthScreens
 * mounts ONBOARDING_MODAL_NAVIGATOR, then starts the flow at the resolved resume path.
 */
async function resumeOnboardingAfterRequired2FASetup(onboardingFlowParams: GetOnboardingInitialPathParamsType) {
    await openApp();

    await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});

    await Navigation.waitForProtectedRoutes();

    const resumePath = getRequired2FAOnboardingResumePath(onboardingFlowParams);

    startOnboardingFlow({
        ...onboardingFlowParams,
        onboardingInitialPath: resumePath,
        resumePath,
    });
}

const getOnboardingMessages = (locale?: Locale) => buildOnboardingMessages(onboardingData, locale);

export type {OnboardingMessage, OnboardingTask, OnboardingTaskLinks, OnboardingPurpose, OnboardingCompanySize, GetOnboardingInitialPathParamsType};
export {buildOnboardingFlowParams, getOnboardingInitialPath, getRequired2FAOnboardingResumePath, resumeOnboardingAfterRequired2FASetup, startOnboardingFlow, getOnboardingMessages};
