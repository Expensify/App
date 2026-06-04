import {getOnboardingInitialPath} from '@libs/actions/Welcome/OnboardingFlow';
import type {GetOnboardingInitialPathParamsType} from '@libs/actions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';

describe('OnboardingFlow', () => {
    describe('getOnboardingInitialPath', () => {
        it('should return the correct path for personal spend', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/personal-details');
        });

        it('should return the correct path for SMB', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/work-email');
        });

        it('should return the correct path for VSB', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: false,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/employees');
        });

        it('should return the correct path for SMB and is not from public domain', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: false,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.SUBMIT,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/employees');
        });

        it('should skip the work email step when the account is already validated', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/',
                onboardingValues: undefined,
                isAccountValidated: true,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).not.toBe('/onboarding/work-email');
            expect(path).toBe('/onboarding/employees');
        });

        it('should still route to the work email step when the account is not validated', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.EMPLOYER,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/',
                onboardingValues: undefined,
                isAccountValidated: false,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/work-email');
        });

        it('should skip a private-domain URL for a public-domain validated user', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: true,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/onboarding/private-domain',
                onboardingValues: undefined,
                isAccountValidated: true,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/purpose');
        });

        it('should not redirect away from a private-domain URL for a public-domain unvalidated user', () => {
            // Mirrors the BaseOnboardingPrivateDomain screen-level guard: an unvalidated public-domain user who just
            // submitted a work email may land here while isFromPublicDomain is stale. They must keep the private-domain step.
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: true,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/onboarding/private-domain',
                onboardingValues: undefined,
                isAccountValidated: false,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).not.toBe('/onboarding/purpose');
        });

        it('should not redirect away from a work-email-validation URL for a public-domain user', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: true,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: true,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: '/onboarding/work-email/validation',
                onboardingValues: undefined,
                isAccountValidated: true,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).not.toBe('/onboarding/purpose');
        });
    });
});
