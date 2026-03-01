import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {StepCounterParams} from '@src/languages/params';
import SCREENS from '@src/SCREENS';

type OnboardingScreen = ValueOf<typeof SCREENS.ONBOARDING>;

type OnboardingFlowContext = {
    signupQualifier?: ValueOf<typeof CONST.ONBOARDING_SIGNUP_QUALIFIERS>;
    isFromPublicDomain?: boolean;
    hasAccessibleDomainPolicies?: boolean;
    purposeSelected?: ValueOf<typeof CONST.ONBOARDING_CHOICES>;
    isMergeAccountStepSkipped?: boolean;
};

type OnboardingStepResult = {
    stepCounter: StepCounterParams;
    progressBarPercentage: number;
};

const {ONBOARDING} = SCREENS;
const {ONBOARDING_CHOICES, ONBOARDING_SIGNUP_QUALIFIERS} = CONST;

const subPageMapping: Partial<Record<OnboardingScreen, OnboardingScreen>> = {
    [ONBOARDING.WORKSPACE_CONFIRMATION]: ONBOARDING.WORKSPACE_OPTIONAL,
    [ONBOARDING.WORKSPACE_CURRENCY]: ONBOARDING.WORKSPACE_OPTIONAL,
    [ONBOARDING.WORKSPACE_INVITE]: ONBOARDING.WORKSPACE_OPTIONAL,
};

function getResolvedPage(page: OnboardingScreen, context: OnboardingFlowContext): OnboardingScreen {
    if (page === ONBOARDING.PRIVATE_DOMAIN && context.isFromPublicDomain) {
        return ONBOARDING.WORK_EMAIL_VALIDATION;
    }
    return subPageMapping[page] ?? page;
}

function getDomainPrefix(context: OnboardingFlowContext): OnboardingScreen[] {
    if (context.isFromPublicDomain) {
        if (context.isMergeAccountStepSkipped === false) {
            return [ONBOARDING.WORK_EMAIL, ONBOARDING.WORK_EMAIL_VALIDATION, ONBOARDING.WORKSPACES];
        }
        return [ONBOARDING.WORK_EMAIL, ONBOARDING.WORK_EMAIL_VALIDATION];
    }
    if (context.hasAccessibleDomainPolicies) {
        return [ONBOARDING.PERSONAL_DETAILS, ONBOARDING.PRIVATE_DOMAIN, ONBOARDING.WORKSPACES];
    }
    return [];
}

function getOnboardingFlow(context: OnboardingFlowContext): OnboardingScreen[] | undefined {
    const prefix = getDomainPrefix(context);
    const isPrivateDomain = !context.isFromPublicDomain && !!context.hasAccessibleDomainPolicies;

    if (context.signupQualifier === ONBOARDING_SIGNUP_QUALIFIERS.VSB) {
        return [...prefix, ONBOARDING.ACCOUNTING, ONBOARDING.INTERESTED_FEATURES];
    }
    if (context.signupQualifier === ONBOARDING_SIGNUP_QUALIFIERS.SMB) {
        return [...prefix, ONBOARDING.EMPLOYEES, ONBOARDING.ACCOUNTING, ONBOARDING.INTERESTED_FEATURES];
    }
    if (!context.purposeSelected) {
        return undefined;
    }

    const base = [...prefix, ONBOARDING.PURPOSE];

    if (context.purposeSelected === ONBOARDING_CHOICES.MANAGE_TEAM) {
        return [...base, ONBOARDING.EMPLOYEES, ONBOARDING.ACCOUNTING, ONBOARDING.INTERESTED_FEATURES];
    }
    if (context.purposeSelected === ONBOARDING_CHOICES.PERSONAL_SPEND || context.purposeSelected === ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        return isPrivateDomain ? [...base, ONBOARDING.WORKSPACE_OPTIONAL] : [...base, ONBOARDING.PERSONAL_DETAILS, ONBOARDING.WORKSPACE_OPTIONAL];
    }
    return isPrivateDomain ? base : [...base, ONBOARDING.PERSONAL_DETAILS];
}

function getOnboardingStepCounter(page: OnboardingScreen, context: OnboardingFlowContext): OnboardingStepResult | undefined {
    const resolvedPage = getResolvedPage(page, context);
    const flow = getOnboardingFlow(context);

    if (!flow) {
        const knownScreens = [...getDomainPrefix(context), ONBOARDING.PURPOSE];
        const index = knownScreens.indexOf(resolvedPage);
        if (index === -1) {
            return undefined;
        }
        // Use the longest possible flow as denominator so the progress bar
        // never moves backward when a purpose is selected on the next screen.
        const maxFlowLength = Math.max(...Object.values(ONBOARDING_CHOICES).map((purpose) => getOnboardingFlow({...context, purposeSelected: purpose})?.length ?? 0));
        return {
            stepCounter: {step: index + 1},
            progressBarPercentage: Math.round(((index + 1) / maxFlowLength) * 100),
        };
    }

    const index = flow.indexOf(resolvedPage);
    if (index === -1) {
        return undefined;
    }
    return {
        stepCounter: {step: index + 1, total: flow.length},
        progressBarPercentage: Math.round(((index + 1) / flow.length) * 100),
    };
}

export {getOnboardingFlow, getOnboardingStepCounter};
export type {OnboardingFlowContext, OnboardingScreen, OnboardingStepResult};
