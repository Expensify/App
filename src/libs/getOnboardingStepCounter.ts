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

const screenResolution: Record<OnboardingScreen, OnboardingScreen> = {
    [ONBOARDING.DYNAMIC_WORK_EMAIL]: ONBOARDING.DYNAMIC_WORK_EMAIL,
    [ONBOARDING.DYNAMIC_WORK_EMAIL_VALIDATION]: ONBOARDING.DYNAMIC_WORK_EMAIL_VALIDATION,
    [ONBOARDING.DYNAMIC_PRIVATE_DOMAIN]: ONBOARDING.DYNAMIC_PRIVATE_DOMAIN,
    [ONBOARDING.DYNAMIC_PERSONAL_DETAILS]: ONBOARDING.DYNAMIC_PERSONAL_DETAILS,
    [ONBOARDING.DYNAMIC_WORKSPACES]: ONBOARDING.DYNAMIC_WORKSPACES,
    [ONBOARDING.DYNAMIC_PURPOSE]: ONBOARDING.DYNAMIC_PURPOSE,
    [ONBOARDING.DYNAMIC_EMPLOYEES]: ONBOARDING.DYNAMIC_EMPLOYEES,
    [ONBOARDING.DYNAMIC_ACCOUNTING]: ONBOARDING.DYNAMIC_ACCOUNTING,
    [ONBOARDING.DYNAMIC_INTERESTED_FEATURES]: ONBOARDING.DYNAMIC_INTERESTED_FEATURES,
    [ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL]: ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL,
    [ONBOARDING.DYNAMIC_WORKSPACE_CONFIRMATION]: ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL,
    [ONBOARDING.DYNAMIC_WORKSPACE_CURRENCY]: ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL,
    [ONBOARDING.DYNAMIC_WORKSPACE_INVITE]: ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL,
};

// Screens that follow PURPOSE. For private domain users, PERSONAL_DETAILS is filtered out.
const purposeSuffixes = {
    [ONBOARDING_CHOICES.MANAGE_TEAM]: [ONBOARDING.DYNAMIC_EMPLOYEES, ONBOARDING.DYNAMIC_ACCOUNTING, ONBOARDING.DYNAMIC_INTERESTED_FEATURES],
    [ONBOARDING_CHOICES.PERSONAL_SPEND]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS, ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL],
    [ONBOARDING_CHOICES.TRACK_WORKSPACE]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS, ONBOARDING.DYNAMIC_WORKSPACE_OPTIONAL],
    [ONBOARDING_CHOICES.EMPLOYER]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS],
    [ONBOARDING_CHOICES.CHAT_SPLIT]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS],
    [ONBOARDING_CHOICES.LOOKING_AROUND]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS],
    [ONBOARDING_CHOICES.ADMIN]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS],
    [ONBOARDING_CHOICES.SUBMIT]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS],
    [ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER]: [ONBOARDING.DYNAMIC_PERSONAL_DETAILS],
} satisfies Record<ValueOf<typeof ONBOARDING_CHOICES>, OnboardingScreen[]>;

// VSB/SMB have fixed suffixes; individual (null) is handled via purposeSuffixes.
const qualifierSuffixes = {
    [ONBOARDING_SIGNUP_QUALIFIERS.VSB]: [ONBOARDING.DYNAMIC_ACCOUNTING, ONBOARDING.DYNAMIC_INTERESTED_FEATURES],
    [ONBOARDING_SIGNUP_QUALIFIERS.SMB]: [ONBOARDING.DYNAMIC_EMPLOYEES, ONBOARDING.DYNAMIC_ACCOUNTING, ONBOARDING.DYNAMIC_INTERESTED_FEATURES],
    [ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL]: null,
} satisfies Record<ValueOf<typeof ONBOARDING_SIGNUP_QUALIFIERS>, OnboardingScreen[] | null>;

const maxSuffixLength = Math.max(...Object.values(purposeSuffixes).map((s) => s.length));
const maxPrivateSuffixLength = Math.max(...Object.values(purposeSuffixes).map((s) => s.filter((p) => p !== ONBOARDING.DYNAMIC_PERSONAL_DETAILS).length));

function getResolvedPage(page: OnboardingScreen, context: OnboardingFlowContext): OnboardingScreen {
    // In public domain flows, PRIVATE_DOMAIN is used as a variant of WORK_EMAIL_VALIDATION
    if (page === ONBOARDING.DYNAMIC_PRIVATE_DOMAIN && context.isFromPublicDomain) {
        return ONBOARDING.DYNAMIC_WORK_EMAIL_VALIDATION;
    }
    return screenResolution[page];
}

function getDomainPrefix(context: OnboardingFlowContext): OnboardingScreen[] {
    if (context.isFromPublicDomain) {
        if (context.isMergeAccountStepSkipped === false) {
            return [ONBOARDING.DYNAMIC_WORK_EMAIL, ONBOARDING.DYNAMIC_WORK_EMAIL_VALIDATION, ONBOARDING.DYNAMIC_WORKSPACES];
        }
        // User skipped the work email step — they never see WORK_EMAIL_VALIDATION
        if (context.isMergeAccountStepSkipped === true) {
            return [ONBOARDING.DYNAMIC_WORK_EMAIL];
        }
        return [ONBOARDING.DYNAMIC_WORK_EMAIL, ONBOARDING.DYNAMIC_WORK_EMAIL_VALIDATION];
    }
    if (context.hasAccessibleDomainPolicies) {
        return [ONBOARDING.DYNAMIC_PERSONAL_DETAILS, ONBOARDING.DYNAMIC_PRIVATE_DOMAIN, ONBOARDING.DYNAMIC_WORKSPACES];
    }
    return [];
}

function getOnboardingFlow(context: OnboardingFlowContext): OnboardingScreen[] | undefined {
    const prefix = getDomainPrefix(context);
    const isPrivateDomain = !context.isFromPublicDomain && !!context.hasAccessibleDomainPolicies;

    const qualifierSuffix = context.signupQualifier ? qualifierSuffixes[context.signupQualifier] : null;
    if (qualifierSuffix) {
        return [...prefix, ...qualifierSuffix];
    }

    if (!context.purposeSelected) {
        return undefined;
    }

    const suffix = purposeSuffixes[context.purposeSelected];
    const adjustedSuffix = isPrivateDomain ? suffix.filter((s) => s !== ONBOARDING.DYNAMIC_PERSONAL_DETAILS) : suffix;
    return [...prefix, ONBOARDING.DYNAMIC_PURPOSE, ...adjustedSuffix];
}

function getOnboardingStepCounter(page: OnboardingScreen, context: OnboardingFlowContext): OnboardingStepResult | undefined {
    const resolvedPage = getResolvedPage(page, context);
    const flow = getOnboardingFlow(context);

    if (!flow) {
        const prefix = getDomainPrefix(context);
        const knownScreens = [...prefix, ONBOARDING.DYNAMIC_PURPOSE];
        const index = knownScreens.indexOf(resolvedPage);
        if (index === -1) {
            return undefined;
        }
        const isPrivateDomain = !context.isFromPublicDomain && !!context.hasAccessibleDomainPolicies;
        const maxFlowLength = prefix.length + 1 + (isPrivateDomain ? maxPrivateSuffixLength : maxSuffixLength);
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
