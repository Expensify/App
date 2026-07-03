import {filterObject} from '@libs/ObjectUtils';
import {getActivePolicies, isControlPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Account, IntroSelected, Onboarding, Policy, Session, UserMetadata} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {FullstoryEventName, FullstoryEventPropertiesMap, FullstoryUserVars} from './types';

import FS from '.';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EXPIRED_THRESHOLD_DAYS = -30;
const EXPIRING_SOON_THRESHOLD_DAYS = 14;

type BuildFullstoryUserVarsParams = {
    account: OnyxEntry<Account>;
    activePolicy: OnyxEntry<Policy>;
    introSelected: OnyxEntry<IntroSelected>;
    onboarding: OnyxEntry<Onboarding>;
    onboardingCompanySize: OnyxEntry<string>;
    onboardingLastVisitedPath: OnyxEntry<string>;
    onboardingPurposeSelected: OnyxEntry<ValueOf<typeof CONST.ONBOARDING_CHOICES>>;
    policies: OnyxCollection<Policy> | undefined;
    session: OnyxEntry<Session>;
    userMetadata: OnyxEntry<UserMetadata>;
};

function sanitizeSegment(value: string): string {
    return value
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, '_')
        .replaceAll(/^_+|_+$/g, '');
}

function getNormalizedOnboardingChoice(choice: OnyxEntry<ValueOf<typeof CONST.ONBOARDING_CHOICES>>): string | undefined {
    if (!choice) {
        return;
    }

    const choiceMap: Partial<Record<ValueOf<typeof CONST.ONBOARDING_CHOICES>, string>> = {
        [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'team',
        [CONST.ONBOARDING_CHOICES.TRACK_BUSINESS]: 'track_business',
        [CONST.ONBOARDING_CHOICES.TRACK_PERSONAL]: 'track_personal',
        [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'personal_spend',
        [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'looking_around',
        [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'employer',
        [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'chat_split',
        [CONST.ONBOARDING_CHOICES.ADMIN]: 'admin',
        [CONST.ONBOARDING_CHOICES.SUBMIT]: 'submit',
        [CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER]: 'test_drive_receiver',
    };

    return choiceMap[choice] ?? sanitizeSegment(choice);
}

function buildUserTypePath(choice: OnyxEntry<ValueOf<typeof CONST.ONBOARDING_CHOICES>>, companySize: OnyxEntry<string>, isFromPublicDomain?: boolean): string | undefined {
    const normalizedChoice = getNormalizedOnboardingChoice(choice);
    const normalizedCompanySize = companySize ? sanitizeSegment(companySize) : undefined;
    let domainType: string | undefined;
    if (isFromPublicDomain !== undefined) {
        domainType = isFromPublicDomain ? 'public' : 'private';
    }

    const segments = [normalizedChoice, normalizedCompanySize, domainType].filter(Boolean);
    if (segments.length === 0) {
        return;
    }

    return segments.join('_');
}

function getDaysTillDate(dateString: string | undefined): number | undefined {
    if (!dateString) {
        return;
    }

    const endDate = new Date(dateString);
    if (Number.isNaN(endDate.getTime())) {
        return;
    }

    return Math.ceil((endDate.getTime() - Date.now()) / MS_PER_DAY);
}

function getFreeTrialStatus(daysTillTrialEnd: number | undefined): FullstoryUserVars['free_trial_status'] {
    if (daysTillTrialEnd === undefined) {
        return;
    }
    if (daysTillTrialEnd < EXPIRED_THRESHOLD_DAYS) {
        return 'expired';
    }
    if (daysTillTrialEnd < 0) {
        return 'expired_last30days';
    }
    if (daysTillTrialEnd <= EXPIRING_SOON_THRESHOLD_DAYS) {
        return 'expiring_soon';
    }
    return 'active';
}

function getOnboardingStep(onboardingPath: string | undefined, hasCompletedOnboarding?: boolean): FullstoryUserVars['onb_step'] {
    if (hasCompletedOnboarding) {
        return 'completed';
    }

    if (!onboardingPath) {
        return;
    }

    const normalizedOnboardingPath = onboardingPath.replace(/^\/+/, '').split('?').at(0);

    if (!normalizedOnboardingPath) {
        return;
    }

    if (normalizedOnboardingPath === ROUTES.ONBOARDING_ACCOUNTING.route) {
        return 'accounting';
    }

    if (normalizedOnboardingPath === ROUTES.ONBOARDING_ROOT.route || normalizedOnboardingPath.startsWith(`${ROUTES.ONBOARDING_ROOT.route}/`)) {
        return 'registration';
    }
}

function getUserRole(activePolicies: Policy[]): FullstoryUserVars['user_role'] {
    let userRole: FullstoryUserVars['user_role'] = 'member';

    for (const policy of activePolicies) {
        if (policy?.role === CONST.POLICY.ROLE.ADMIN) {
            return 'admin';
        }
        if (policy?.role === CONST.POLICY.ROLE.AUDITOR) {
            userRole = 'auditor';
        }
    }

    return userRole;
}

function getPlanType(policies: Policy[]): FullstoryUserVars['plan_type'] {
    if (policies.some(isControlPolicy)) {
        return 'control';
    }
    if (policies.some((policy) => policy.type === CONST.POLICY.TYPE.TEAM)) {
        return 'collect';
    }
}

function buildFullstoryUserVars({
    account,
    activePolicy,
    introSelected,
    onboarding,
    onboardingCompanySize,
    onboardingLastVisitedPath,
    onboardingPurposeSelected,
    policies,
    session,
    userMetadata,
}: BuildFullstoryUserVarsParams): FullstoryUserVars {
    const activePolicies = getActivePolicies(policies ?? null, session?.email);
    const hasCompletedOnboarding = onboarding?.hasCompletedGuidedSetupFlow;
    const currentOnboardingChoice = introSelected?.choice ?? onboardingPurposeSelected;
    const companySize = introSelected?.companySize ?? onboardingCompanySize;
    const daysTillTrialEnd = getDaysTillDate(userMetadata?.freeTrialEndDate);
    let userStatus: FullstoryUserVars['user_status'];

    if (hasCompletedOnboarding !== undefined) {
        userStatus = hasCompletedOnboarding ? 'returning' : 'new';
    }

    /* eslint-disable @typescript-eslint/naming-convention -- FullStory schema uses external snake_case keys. */
    return filterObject(
        {
            user_type_path: buildUserTypePath(currentOnboardingChoice, companySize, account?.isFromPublicDomain),
            account_type: activePolicies.length > 0 ? 'business' : 'personal',
            user_status: userStatus,
            has_completed_onboarding: hasCompletedOnboarding,
            onb_step: getOnboardingStep(onboardingLastVisitedPath, hasCompletedOnboarding),
            user_role: getUserRole(activePolicies),
            workspace_state: activePolicies.length > 0 ? 'has_workspaces' : 'no_workspaces',
            workspace_count: activePolicies.length,
            workspace_member_count: activePolicy ? Object.keys(activePolicy.employeeList ?? {}).length : undefined,
            free_trial_end_date: userMetadata?.freeTrialEndDate,
            days_till_trial_end: daysTillTrialEnd,
            free_trial_status: getFreeTrialStatus(daysTillTrialEnd),
            plan_type: getPlanType(activePolicies),
            paid_member: userMetadata?.paidMember,
        } satisfies FullstoryUserVars,
        (_key, value) => value !== undefined,
    );
    /* eslint-enable @typescript-eslint/naming-convention */
}

function trackFullstoryEvent<TEventName extends FullstoryEventName>(eventName: TEventName, eventProperties: FullstoryEventPropertiesMap[TEventName]) {
    FS.event(
        eventName,
        filterObject(eventProperties, (_key, value) => value !== undefined),
    );
}

function buildPageViewedEvent(screenName: string, entryPoint: string): FullstoryEventPropertiesMap['Page_viewed'] {
    /* eslint-disable @typescript-eslint/naming-convention -- FullStory schema uses external snake_case keys. */
    return {
        screen_name: screenName,
        entry_point: entryPoint,
        onb_step: getOnboardingStep(entryPoint),
    };
    /* eslint-enable @typescript-eslint/naming-convention */
}

export {buildFullstoryUserVars, buildPageViewedEvent, getOnboardingStep, trackFullstoryEvent};
