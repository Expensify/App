import CONST from '@src/CONST';
import {getOnboardingFlow, getOnboardingStepCounter, getPreviousOnboardingRoute} from '@src/libs/getOnboardingStepCounter';
import type {OnboardingFlowContext, OnboardingScreen} from '@src/libs/getOnboardingStepCounter';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const O = SCREENS.ONBOARDING;
const {ONBOARDING_CHOICES, ONBOARDING_SIGNUP_QUALIFIERS} = CONST;

describe('getOnboardingFlow', () => {
    it('returns [EMPLOYEES, INTERESTED_FEATURES, ACCOUNTING] for VSB without domain context', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb'})).toEqual([O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns [EMPLOYEES, INTERESTED_FEATURES, ACCOUNTING] for SMB without domain context', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb'})).toEqual([O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns [PURPOSE, EMPLOYEES, INTERESTED_FEATURES, ACCOUNTING] for individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([O.PURPOSE, O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns [PURPOSE, PERSONAL_DETAILS] for individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns [PURPOSE, PERSONAL_TRACK_GOAL, PERSONAL_DETAILS] for individual + TRACK_PERSONAL', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL})).toEqual([
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns [PURPOSE, PERSONAL_DETAILS] for individual + EMPLOYER', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.EMPLOYER})).toEqual([O.PURPOSE, O.PERSONAL_DETAILS]);
    });

    it('returns undefined for individual without purposeSelected', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual'})).toBeUndefined();
    });

    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, EMPLOYEES, INTERESTED_FEATURES, ACCOUNTING] for public + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true})).toEqual([O.WORK_EMAIL, O.WORK_EMAIL_VALIDATION, O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, EMPLOYEES, INTERESTED_FEATURES, ACCOUNTING] for public + SMB', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', isFromPublicDomain: true})).toEqual([O.WORK_EMAIL, O.WORK_EMAIL_VALIDATION, O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns 6-step flow for public + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.PURPOSE,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 4-step flow for public + individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 5-step flow for public + individual + TRACK_PERSONAL', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 4-step flow for public + individual + LOOKING_AROUND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.LOOKING_AROUND})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.PURPOSE,
            O.PERSONAL_DETAILS,
        ]);
    });

    it('returns 6-step flow for public + merge + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: false})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.WORKSPACES,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 7-step flow for public + merge + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.WORK_EMAIL,
            O.WORK_EMAIL_VALIDATION,
            O.WORKSPACES,
            O.PURPOSE,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 5-step flow for public + merge + individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.WORKSPACES,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 6-step flow for public + merge + individual + TRACK_PERSONAL', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.WORKSPACES,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 2-step flow for public + skipped + individual + PERSONAL_SPEND', () => {
        // A skipped work email step is no longer part of the navigable flow, so it is excluded.
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 3-step flow for public + skipped + individual + TRACK_PERSONAL', () => {
        // A skipped work email step is no longer part of the navigable flow, so it is excluded.
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL})).toEqual([
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 4-step flow for public + skipped + individual + MANAGE_TEAM', () => {
        // A skipped work email step is no longer part of the navigable flow, so it is excluded.
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.PURPOSE,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 3-step flow for public + skipped + VSB', () => {
        // A skipped work email step is no longer part of the navigable flow, so Employees becomes the first step.
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: true})).toEqual([O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns 3-step flow for public + validated + VSB', () => {
        // A validated work email is no longer part of the navigable flow, so Employees becomes the first step.
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true})).toEqual([O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    it('returns 3-step flow for public + validated + merge + VSB', () => {
        // Validated accounts skip work email even when merge is not completed, matching navigation behavior.
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true, isMergeAccountStepSkipped: false})).toEqual([
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 3-step flow for public + validated + SMB (employees is the first step)', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', isFromPublicDomain: true, isAccountValidated: true})).toEqual([O.EMPLOYEES, O.INTERESTED_FEATURES, O.ACCOUNTING]);
    });

    // Unvalidated private-domain users traverse PERSONAL_DETAILS -> PRIVATE_DOMAIN, then skip straight to the qualifier/purpose suffix.
    it('returns 5-step flow for unvalidated private domain + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 5-step flow for unvalidated private domain + SMB', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', hasAccessibleDomainPolicies: true})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    // Validated private-domain users skip PRIVATE_DOMAIN and traverse WORKSPACES only when joinable workspaces exist.
    it('returns 5-step flow for validated private domain + VSB with joinable workspaces', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true, isAccountValidated: true, hasJoinablePolicies: true})).toEqual([
            O.PERSONAL_DETAILS,
            O.WORKSPACES,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 4-step flow for validated private domain + VSB without joinable workspaces', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true, isAccountValidated: true, hasJoinablePolicies: false})).toEqual([
            O.PERSONAL_DETAILS,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 6-step flow for unvalidated private domain + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.PURPOSE,
            O.EMPLOYEES,
            O.INTERESTED_FEATURES,
            O.ACCOUNTING,
        ]);
    });

    it('returns 3-step flow for unvalidated private domain + individual + PERSONAL_SPEND', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.PRIVATE_DOMAIN,
            SCREENS.ONBOARDING.PURPOSE,
        ]);
    });

    it('returns 4-step flow for unvalidated private domain + individual + TRACK_PERSONAL', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.PRIVATE_DOMAIN,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL,
        ]);
    });

    it('returns 3-step flow for unvalidated private domain + individual + EMPLOYER', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.EMPLOYER})).toEqual([
            O.PERSONAL_DETAILS,
            O.PRIVATE_DOMAIN,
            O.PURPOSE,
        ]);
    });
});

describe('getOnboardingStepCounter', () => {
    it('returns correct step/total/percentage for each page in VSB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb'};
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for each page in SMB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'smb'};
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 4}, progressBarPercentage: 75});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 4, total: 4}, progressBarPercentage: 100});
    });

    it('omits Accounting from the counter when Accounting is disabled', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM, isAccountingEnabled: false};
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toBeUndefined();
    });

    it('returns correct step/total/percentage for individual + PERSONAL_SPEND', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + TRACK_PERSONAL', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + other purpose', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.EMPLOYER};
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + merge + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toEqual({stepCounter: {step: 1, total: 7}, progressBarPercentage: 14});
        expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toEqual({stepCounter: {step: 2, total: 7}, progressBarPercentage: 29});
        expect(getOnboardingStepCounter(O.WORKSPACES, ctx)).toEqual({stepCounter: {step: 3, total: 7}, progressBarPercentage: 43});
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 4, total: 7}, progressBarPercentage: 57});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 5, total: 7}, progressBarPercentage: 71});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 6, total: 7}, progressBarPercentage: 86});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 7, total: 7}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + individual + MANAGE_TEAM (no gaps)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 4}, progressBarPercentage: 75});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 4, total: 4}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + individual + PERSONAL_SPEND (no gaps)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + VSB', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: true};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + validated + VSB', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true, isMergeAccountStepSkipped: false};
        // The validated work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(O.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + individual + TRACK_PERSONAL (no gaps)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.TRACK_PERSONAL};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for unvalidated private domain + individual + MANAGE_TEAM (6-step flow)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(O.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        // WORKSPACES is not traversed by an unvalidated private-domain user, so it has no step counter.
        expect(getOnboardingStepCounter(O.WORKSPACES, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(O.PURPOSE, ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(O.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(O.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter(O.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for validated private domain + individual + MANAGE_TEAM with joinable workspaces (6-step flow)', () => {
        const ctx: OnboardingFlowContext = {
            signupQualifier: 'individual',
            hasAccessibleDomainPolicies: true,
            isAccountValidated: true,
            hasJoinablePolicies: true,
            purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM,
        };
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        // Validated users skip PRIVATE_DOMAIN, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PRIVATE_DOMAIN, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORKSPACES, ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    describe('sub-page mappings', () => {
        it('PRIVATE_DOMAIN resolves to WORK_EMAIL_VALIDATION step in public domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
            expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toEqual(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx));
        });

        it('PRIVATE_DOMAIN is its own step in private domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true};
            expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toBeDefined();
            expect(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx)).toBeUndefined();
        });
    });

    describe('indeterminate flow (no purposeSelected)', () => {
        const domainVariants: Array<{
            label: string;
            ctx: OnboardingFlowContext;
            expectedPurposeStep: number;
            expectedPurposePct: number;
            prefixPages: Array<{page: OnboardingScreen; step: number; pct: number}>;
        }> = [
            {
                label: 'no-domain',
                ctx: {signupQualifier: 'individual'},
                expectedPurposeStep: 1,
                expectedPurposePct: 25,
                prefixPages: [],
            },
            {
                label: 'public',
                ctx: {signupQualifier: 'individual', isFromPublicDomain: true},
                expectedPurposeStep: 3,
                expectedPurposePct: 50,
                prefixPages: [
                    {page: O.WORK_EMAIL, step: 1, pct: 17},
                    {page: O.WORK_EMAIL_VALIDATION, step: 2, pct: 33},
                ],
            },
            {
                label: 'public-skipped',
                ctx: {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true},
                expectedPurposeStep: 1,
                expectedPurposePct: 25,
                prefixPages: [],
            },
            {
                label: 'public-merge',
                ctx: {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false},
                expectedPurposeStep: 4,
                expectedPurposePct: 57,
                prefixPages: [
                    {page: O.WORK_EMAIL, step: 1, pct: 14},
                    {page: O.WORK_EMAIL_VALIDATION, step: 2, pct: 29},
                    {page: O.WORKSPACES, step: 3, pct: 43},
                ],
            },
            {
                label: 'private',
                ctx: {signupQualifier: 'individual', hasAccessibleDomainPolicies: true},
                expectedPurposeStep: 3,
                expectedPurposePct: 50,
                prefixPages: [
                    {page: O.PERSONAL_DETAILS, step: 1, pct: 17},
                    {page: O.PRIVATE_DOMAIN, step: 2, pct: 33},
                ],
            },
        ];

        it.each(domainVariants)('$label: PURPOSE returns step $expectedPurposeStep without total', ({ctx, expectedPurposeStep, expectedPurposePct}) => {
            const result = getOnboardingStepCounter(O.PURPOSE, ctx);
            expect(result).toEqual({stepCounter: {step: expectedPurposeStep}, progressBarPercentage: expectedPurposePct});
        });

        it.each(domainVariants)('$label: prefix pages return correct steps without total', ({ctx, prefixPages}) => {
            for (const {page, step, pct} of prefixPages) {
                const result = getOnboardingStepCounter(page, ctx);
                expect(result).toEqual({stepCounter: {step}, progressBarPercentage: pct});
            }
        });

        it('PRIVATE_DOMAIN resolves to WORK_EMAIL_VALIDATION step in indeterminate public merge flow', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false};
            expect(getOnboardingStepCounter(O.PRIVATE_DOMAIN, ctx)).toEqual(getOnboardingStepCounter(O.WORK_EMAIL_VALIDATION, ctx));
        });
    });

    describe('indeterminate percentages never exceed the next page after purpose selection', () => {
        const domainVariants: Array<{label: string; ctx: Partial<OnboardingFlowContext>}> = [
            {label: 'no-domain', ctx: {}},
            {label: 'public', ctx: {isFromPublicDomain: true}},
            {label: 'public-skipped', ctx: {isFromPublicDomain: true, isMergeAccountStepSkipped: true}},
            {label: 'public-merge', ctx: {isFromPublicDomain: true, isMergeAccountStepSkipped: false}},
            {label: 'private', ctx: {hasAccessibleDomainPolicies: true}},
        ];

        it.each(domainVariants)('$label: PURPOSE indeterminate percent is less than or equal to min next-page percent across all purposes', ({ctx}) => {
            const indeterminateCtx: OnboardingFlowContext = {signupQualifier: 'individual', ...ctx};
            const purposeResult = getOnboardingStepCounter(O.PURPOSE, indeterminateCtx);
            expect(purposeResult).toBeDefined();

            for (const purpose of Object.values(ONBOARDING_CHOICES)) {
                const flow = getOnboardingFlow({...indeterminateCtx, purposeSelected: purpose});
                if (!flow) {
                    continue;
                }
                const purposeIndex = flow.indexOf(O.PURPOSE);
                if (purposeIndex === -1 || purposeIndex >= flow.length - 1) {
                    continue;
                }
                const nextPage = flow.at(purposeIndex + 1);
                if (!nextPage) {
                    continue;
                }
                const nextResult = getOnboardingStepCounter(nextPage, {...indeterminateCtx, purposeSelected: purpose});
                expect(nextResult).toBeDefined();
                expect(nextResult?.progressBarPercentage).toBeGreaterThanOrEqual(purposeResult?.progressBarPercentage ?? 0);
            }
        });
    });

    it('returns undefined for a page that is not in the flow', () => {
        expect(getOnboardingStepCounter(O.PURPOSE, {signupQualifier: 'vsb'})).toBeUndefined();
    });

    describe('every purpose/qualifier combination produces a defined flow', () => {
        const domainVariants: OnboardingFlowContext[] = [
            {},
            {isFromPublicDomain: true},
            {isFromPublicDomain: true, isMergeAccountStepSkipped: true},
            {isFromPublicDomain: true, isMergeAccountStepSkipped: false},
            {hasAccessibleDomainPolicies: true},
        ];

        it.each(Object.values(ONBOARDING_CHOICES))('individual + %s returns a defined flow across all domain variants', (purpose) => {
            for (const domain of domainVariants) {
                const flow = getOnboardingFlow({signupQualifier: 'individual', purposeSelected: purpose, ...domain});
                expect(flow).toBeDefined();
                expect(flow?.length).toBeGreaterThanOrEqual(1);
            }
        });

        it.each(Object.values(ONBOARDING_SIGNUP_QUALIFIERS))('%s qualifier returns a defined flow across all domain variants', (qualifier) => {
            for (const domain of domainVariants) {
                if (qualifier === 'individual') {
                    expect(getOnboardingFlow({signupQualifier: qualifier, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM, ...domain})).toBeDefined();
                } else {
                    expect(getOnboardingFlow({signupQualifier: qualifier, ...domain})).toBeDefined();
                }
            }
        });
    });
});

describe('getPreviousOnboardingRoute', () => {
    it('returns employees before interested features for VSB users', () => {
        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb'})).toBe(ROUTES.ONBOARDING_EMPLOYEES.getRoute());
    });

    it('returns employees before interested features for VSB with accessible domain policies', () => {
        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true})).toBe(ROUTES.ONBOARDING_EMPLOYEES.getRoute());
    });

    it('returns private domain for unvalidated VSB with accessible domain policies', () => {
        // Repro guard: an unvalidated private-domain user came from PRIVATE_DOMAIN, not the never-visited WORKSPACES (which renders blank).
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true})).toBe(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute());
    });

    it('returns workspaces for validated VSB with accessible domain policies and joinable workspaces', () => {
        expect(
            getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true, isAccountValidated: true, hasJoinablePolicies: true}),
        ).toBe(ROUTES.ONBOARDING_WORKSPACES.getRoute());
    });

    it('returns personal details for validated VSB with accessible domain policies but no joinable workspaces', () => {
        // WORKSPACES auto-skips when there are no joinable workspaces, so the previous screen is PERSONAL_DETAILS.
        expect(
            getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true, isAccountValidated: true, hasJoinablePolicies: false}),
        ).toBe(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute());
    });

    it('returns employees before interested features for public domain VSB with merge flow', () => {
        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: false})).toBe(
            ROUTES.ONBOARDING_EMPLOYEES.getRoute(),
        );
    });

    it('returns employees before interested features for public domain VSB without merge skip', () => {
        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb', isFromPublicDomain: true})).toBe(ROUTES.ONBOARDING_EMPLOYEES.getRoute());
    });

    it('returns employees before interested features for public domain VSB when merge account step was skipped', () => {
        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: true})).toBe(
            ROUTES.ONBOARDING_EMPLOYEES.getRoute(),
        );
    });

    it('returns employees before interested features for public domain VSB when account is validated', () => {
        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true, isMergeAccountStepSkipped: false})).toBe(
            ROUTES.ONBOARDING_EMPLOYEES.getRoute(),
        );
    });

    it('returns purpose for individual manage team users', () => {
        expect(getPreviousOnboardingRoute(O.EMPLOYEES, {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toBe(ROUTES.ONBOARDING_PURPOSE.getRoute());
    });

    it('passes backTo when resolving the previous onboarding route', () => {
        const backTo = ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

        expect(getPreviousOnboardingRoute(O.INTERESTED_FEATURES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true}, backTo)).toBe(ROUTES.ONBOARDING_EMPLOYEES.getRoute(backTo));
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true}, backTo)).toBe(
            ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(backTo),
        );
    });
});
