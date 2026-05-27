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
                currentOnboardingCompanySize: null,
                onboardingInitialPath: '/',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/employees');
        });

        it('should return personal details for VSB with accessible policies on a fresh start', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                currentOnboardingCompanySize: null,
                onboardingInitialPath: '',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/personal-details');
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
            expect(path).toBe('/onboarding/accounting');
        });

        it('should return employees for VSB when resuming at accounting without a company size', () => {
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
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                currentOnboardingCompanySize: null,
                onboardingInitialPath: '/onboarding/accounting',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/employees');
        });

        it('should return employees for VSB when resuming with legacy MICRO company size', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: true,
                onboardingValuesParam: {
                    hasCompletedGuidedSetupFlow: false,
                    shouldRedirectToClassicAfterMerge: false,
                    shouldValidate: false,
                    isMergingAccountBlocked: false,
                    isMergeAccountStepCompleted: false,
                    signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB,
                },
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
                onboardingInitialPath: '/onboarding/interested-features',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/employees');
        });

        it('should resume VSB onboarding when a valid company size is selected', () => {
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
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL,
                onboardingInitialPath: '/onboarding/accounting',
                onboardingValues: undefined,
            };
            const path = getOnboardingInitialPath(params);
            expect(path).toBe('/onboarding/accounting');
        });
    });
});
