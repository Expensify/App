import CONST from '@src/CONST';
import {getOnboardingFlow, getOnboardingStepCounter, getPreviousOnboardingRoute} from '@src/libs/getOnboardingStepCounter';
import type {OnboardingFlowContext, OnboardingScreen} from '@src/libs/getOnboardingStepCounter';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const {ONBOARDING_CHOICES, ONBOARDING_SIGNUP_QUALIFIERS} = CONST;

describe('getOnboardingFlow', () => {
    it('returns [EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for VSB without domain context', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb'})).toEqual([SCREENS.ONBOARDING.EMPLOYEES, SCREENS.ONBOARDING.ACCOUNTING, SCREENS.ONBOARDING.INTERESTED_FEATURES]);
    });

    it('returns [EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for SMB without domain context', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb'})).toEqual([SCREENS.ONBOARDING.EMPLOYEES, SCREENS.ONBOARDING.ACCOUNTING, SCREENS.ONBOARDING.INTERESTED_FEATURES]);
    });

    it('returns [PURPOSE, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
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
        expect(getOnboardingFlow({signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.EMPLOYER})).toEqual([SCREENS.ONBOARDING.PURPOSE, SCREENS.ONBOARDING.PERSONAL_DETAILS]);
    });

    it('returns undefined for individual without purposeSelected', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual'})).toBeUndefined();
    });

    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for public + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns [WORK_EMAIL, WORK_EMAIL_VALIDATION, EMPLOYEES, ACCOUNTING, INTERESTED_FEATURES] for public + SMB', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', isFromPublicDomain: true})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 6-step flow for public + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
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
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
        ]);
    });

    it('returns 6-step flow for public + merge + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: false})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.WORKSPACES,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 7-step flow for public + merge + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            SCREENS.ONBOARDING.WORK_EMAIL,
            SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION,
            SCREENS.ONBOARDING.WORKSPACES,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
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
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 3-step flow for public + skipped + VSB (employees is the first step)', () => {
        // A skipped work email step is no longer part of the navigable flow, so EMPLOYEES becomes the first step.
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: true})).toEqual([
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 3-step flow for public + validated + VSB (employees is the first step)', () => {
        // A validated work email is no longer part of the navigable flow, so EMPLOYEES becomes the first step.
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true})).toEqual([
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 3-step flow for public + validated + merge + VSB (employees is the first step)', () => {
        // Validated accounts skip work email even when merge is not completed, matching navigation behavior.
        expect(getOnboardingFlow({signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true, isMergeAccountStepSkipped: false})).toEqual([
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 3-step flow for public + validated + SMB (employees is the first step)', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', isFromPublicDomain: true, isAccountValidated: true})).toEqual([
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    // Unvalidated private-domain users traverse PERSONAL_DETAILS -> PRIVATE_DOMAIN, then skip straight to the qualifier/purpose suffix.
    it('returns 5-step flow for unvalidated private domain + VSB', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.PRIVATE_DOMAIN,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 5-step flow for unvalidated private domain + SMB', () => {
        expect(getOnboardingFlow({signupQualifier: 'smb', hasAccessibleDomainPolicies: true})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.PRIVATE_DOMAIN,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    // Validated private-domain users skip PRIVATE_DOMAIN and traverse WORKSPACES only when joinable workspaces exist.
    it('returns 5-step flow for validated private domain + VSB with joinable workspaces', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true, isAccountValidated: true, hasJoinablePolicies: true})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.WORKSPACES,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 4-step flow for validated private domain + VSB without joinable workspaces', () => {
        expect(getOnboardingFlow({signupQualifier: 'vsb', hasAccessibleDomainPolicies: true, isAccountValidated: true, hasJoinablePolicies: false})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
        ]);
    });

    it('returns 6-step flow for unvalidated private domain + individual + MANAGE_TEAM', () => {
        expect(getOnboardingFlow({signupQualifier: 'individual', hasAccessibleDomainPolicies: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toEqual([
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.PRIVATE_DOMAIN,
            SCREENS.ONBOARDING.PURPOSE,
            SCREENS.ONBOARDING.EMPLOYEES,
            SCREENS.ONBOARDING.ACCOUNTING,
            SCREENS.ONBOARDING.INTERESTED_FEATURES,
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
            SCREENS.ONBOARDING.PERSONAL_DETAILS,
            SCREENS.ONBOARDING.PRIVATE_DOMAIN,
            SCREENS.ONBOARDING.PURPOSE,
        ]);
    });
});

describe('getOnboardingStepCounter', () => {
    it('returns correct step/total/percentage for each page in VSB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb'};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for each page in SMB flow', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'smb'};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 4}, progressBarPercentage: 75});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 4, total: 4}, progressBarPercentage: 100});
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
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + merge + individual + MANAGE_TEAM', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toEqual({stepCounter: {step: 1, total: 7}, progressBarPercentage: 14});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ctx)).toEqual({stepCounter: {step: 2, total: 7}, progressBarPercentage: 29});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORKSPACES, ctx)).toEqual({stepCounter: {step: 3, total: 7}, progressBarPercentage: 43});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 4, total: 7}, progressBarPercentage: 57});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 5, total: 7}, progressBarPercentage: 71});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 6, total: 7}, progressBarPercentage: 86});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 7, total: 7}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + individual + MANAGE_TEAM (no gaps)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 4}, progressBarPercentage: 25});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 2, total: 4}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 3, total: 4}, progressBarPercentage: 75});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 4, total: 4}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + individual + PERSONAL_SPEND (no gaps)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: true, purposeSelected: ONBOARDING_CHOICES.PERSONAL_SPEND};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 1, total: 2}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 2, total: 2}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + skipped + VSB (employees is the first step)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: true};
        // The skipped work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for public + validated + VSB (employees is the first step)', () => {
        const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true, isMergeAccountStepSkipped: false};
        // The validated work email step is excluded from the flow, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 1, total: 3}, progressBarPercentage: 33});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 2, total: 3}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 3, total: 3}, progressBarPercentage: 100});
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
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PERSONAL_DETAILS, ctx)).toEqual({stepCounter: {step: 1, total: 6}, progressBarPercentage: 17});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PRIVATE_DOMAIN, ctx)).toEqual({stepCounter: {step: 2, total: 6}, progressBarPercentage: 33});
        // WORKSPACES is not traversed by an unvalidated private-domain user, so it has no step counter.
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORKSPACES, ctx)).toBeUndefined();
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx)).toEqual({stepCounter: {step: 3, total: 6}, progressBarPercentage: 50});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.EMPLOYEES, ctx)).toEqual({stepCounter: {step: 4, total: 6}, progressBarPercentage: 67});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.ACCOUNTING, ctx)).toEqual({stepCounter: {step: 5, total: 6}, progressBarPercentage: 83});
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.INTERESTED_FEATURES, ctx)).toEqual({stepCounter: {step: 6, total: 6}, progressBarPercentage: 100});
    });

    it('returns correct step/total/percentage for validated private domain + individual + MANAGE_TEAM with joinable workspaces (7-step flow)', () => {
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
    });

    describe('sub-page mappings', () => {
        it('PRIVATE_DOMAIN resolves to WORK_EMAIL_VALIDATION step in public domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'individual', isFromPublicDomain: true, isMergeAccountStepSkipped: false, purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM};
            expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PRIVATE_DOMAIN, ctx)).toEqual(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ctx));
        });

        it('PRIVATE_DOMAIN is its own step in private domain flows', () => {
            const ctx: OnboardingFlowContext = {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true};
            expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PRIVATE_DOMAIN, ctx)).toBeDefined();
            expect(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ctx)).toBeUndefined();
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
                    {page: SCREENS.ONBOARDING.WORK_EMAIL, step: 1, pct: 17},
                    {page: SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, step: 2, pct: 33},
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
                    {page: SCREENS.ONBOARDING.WORK_EMAIL, step: 1, pct: 14},
                    {page: SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, step: 2, pct: 29},
                    {page: SCREENS.ONBOARDING.WORKSPACES, step: 3, pct: 43},
                ],
            },
            {
                label: 'private',
                ctx: {signupQualifier: 'individual', hasAccessibleDomainPolicies: true},
                expectedPurposeStep: 3,
                expectedPurposePct: 50,
                prefixPages: [
                    {page: SCREENS.ONBOARDING.PERSONAL_DETAILS, step: 1, pct: 17},
                    {page: SCREENS.ONBOARDING.PRIVATE_DOMAIN, step: 2, pct: 33},
                ],
            },
        ];

        it.each(domainVariants)('$label: PURPOSE returns step $expectedPurposeStep without total', ({ctx, expectedPurposeStep, expectedPurposePct}) => {
            const result = getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, ctx);
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
            expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PRIVATE_DOMAIN, ctx)).toEqual(getOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, ctx));
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

        it.each(domainVariants)('$label: PURPOSE indeterminate % ≤ min next-page % across all purposes', ({ctx}) => {
            const indeterminateCtx: OnboardingFlowContext = {signupQualifier: 'individual', ...ctx};
            const purposeResult = getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, indeterminateCtx);
            expect(purposeResult).toBeDefined();

            for (const purpose of Object.values(ONBOARDING_CHOICES)) {
                const flow = getOnboardingFlow({...indeterminateCtx, purposeSelected: purpose});
                if (!flow) {
                    continue;
                }
                const purposeIndex = flow.indexOf(SCREENS.ONBOARDING.PURPOSE);
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
        expect(getOnboardingStepCounter(SCREENS.ONBOARDING.PURPOSE, {signupQualifier: 'vsb'})).toBeUndefined();
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
    it('returns undefined when employees is the first onboarding step', () => {
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb'})).toBeUndefined();
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

    it('returns workspaces for public domain VSB with merge flow', () => {
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: false})).toBe(
            ROUTES.ONBOARDING_WORKSPACES.getRoute(),
        );
    });

    it('returns work email validation for public domain VSB without merge skip', () => {
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', isFromPublicDomain: true})).toBe(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
    });

    it('returns undefined for public domain VSB when merge account step was skipped (employees is the first step)', () => {
        // The skipped work email step is not a navigable previous route, so employees has no back destination.
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', isFromPublicDomain: true, isMergeAccountStepSkipped: true})).toBeUndefined();
    });

    it('returns undefined for public domain VSB when account is validated (employees is the first step)', () => {
        // The validated work email step is not a navigable previous route, so employees has no back destination.
        expect(
            getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', isFromPublicDomain: true, isAccountValidated: true, isMergeAccountStepSkipped: false}),
        ).toBeUndefined();
    });

    it('returns purpose for individual manage team users', () => {
        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'individual', purposeSelected: ONBOARDING_CHOICES.MANAGE_TEAM})).toBe(
            ROUTES.ONBOARDING_PURPOSE.getRoute(),
        );
    });

    it('passes backTo when resolving the previous onboarding route', () => {
        const backTo = ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

        expect(getPreviousOnboardingRoute(SCREENS.ONBOARDING.EMPLOYEES, {signupQualifier: 'vsb', hasAccessibleDomainPolicies: true}, backTo)).toBe(
            ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(backTo),
        );
    });
});
