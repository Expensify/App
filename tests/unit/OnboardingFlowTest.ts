import {getOnboardingInitialPath, getRequired2FAOnboardingResumePath, startOnboardingFlow} from '@libs/actions/Welcome/OnboardingFlow';
import type {GetOnboardingInitialPathParamsType} from '@libs/actions/Welcome/OnboardingFlow';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type * as NativeNavigation from '@react-navigation/native';

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(),
    resetRoot: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/getAdaptedStateFromPath', () => jest.fn());

describe('OnboardingFlow', () => {
    describe('getOnboardingInitialPath', () => {
        it('should return the onboarding fallback path when the last visited path is null', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: false,
                currentOnboardingPurposeSelected: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                currentOnboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                onboardingInitialPath: null,
                onboardingValues: undefined,
            };

            let path = '';
            expect(() => {
                path = getOnboardingInitialPath(params);
            }).not.toThrow();
            expect(path).toBe('/onboarding');
        });

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

    describe('getRequired2FAOnboardingResumePath', () => {
        it('returns personal-details for private domain users with accessible policies and no saved path', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: true,
                currentOnboardingPurposeSelected: undefined,
                currentOnboardingCompanySize: undefined,
                onboardingInitialPath: null,
                onboardingValues: undefined,
            };

            expect(getRequired2FAOnboardingResumePath(params)).toBe('/onboarding/personal-details');
        });

        it('returns work-email for public domain users with no saved path', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: true,
                hasAccessiblePolicies: false,
                currentOnboardingPurposeSelected: undefined,
                currentOnboardingCompanySize: undefined,
                onboardingInitialPath: '',
                onboardingValues: undefined,
            };

            expect(getRequired2FAOnboardingResumePath(params)).toBe('/onboarding/work-email');
        });

        it('preserves a saved work-email path', () => {
            const params: GetOnboardingInitialPathParamsType = {
                isUserFromPublicDomain: false,
                hasAccessiblePolicies: true,
                currentOnboardingPurposeSelected: undefined,
                currentOnboardingCompanySize: undefined,
                onboardingInitialPath: '/onboarding/work-email/validation',
                onboardingValues: undefined,
            };

            expect(getRequired2FAOnboardingResumePath(params)).toBe('/onboarding/work-email/validation');
        });
    });

    describe('startOnboardingFlow', () => {
        /* eslint-disable @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding */
        const mockedGetRootState = jest.mocked(navigationRef.getRootState);
        const mockedResetRoot = jest.mocked(navigationRef.resetRoot);
        /* eslint-enable @typescript-eslint/unbound-method */
        const mockedGetAdaptedStateFromPath = jest.mocked(getAdaptedStateFromPath);

        const params: GetOnboardingInitialPathParamsType = {
            isUserFromPublicDomain: false,
            hasAccessiblePolicies: true,
            currentOnboardingPurposeSelected: undefined,
            currentOnboardingCompanySize: undefined,
            onboardingInitialPath: '/onboarding/private-domain',
            onboardingValues: undefined,
            // resumePath bypasses getOnboardingInitialPath so the test drives the resolved target directly.
            resumePath: '/onboarding/personal-details',
        };

        // getRootState's return type requires a full NavigationState, so build a minimal-but-complete one.
        const buildRootState = (routes: NativeNavigation.NavigationState['routes']): NativeNavigation.NavigationState => ({
            key: 'root',
            index: Math.max(routes.length - 1, 0),
            routeNames: routes.map((route) => route.name),
            routes,
            type: 'stack',
            stale: false,
        });

        beforeEach(() => {
            jest.clearAllMocks();
            mockedGetAdaptedStateFromPath.mockReturnValue({routes: [{name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}]} as ReturnType<typeof getAdaptedStateFromPath>);
        });

        it('should not call resetRoot when the onboarding navigator is already mounted (no-op that would still fire replaceState)', () => {
            // Onboarding navigator already in the root state, so there is nothing to mount and resetRoot must be skipped.
            mockedGetRootState.mockReturnValue(buildRootState([{key: 'onboarding', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}]));

            startOnboardingFlow(params);

            expect(mockedResetRoot).not.toHaveBeenCalled();
        });

        it('should call resetRoot to mount the onboarding navigator when it is not yet in the root state', () => {
            // Onboarding navigator not yet in root state, so resetRoot runs to mount it.
            mockedGetRootState.mockReturnValue(buildRootState([{key: 'home', name: SCREENS.HOME}]));

            startOnboardingFlow(params);

            expect(mockedResetRoot).toHaveBeenCalledTimes(1);
        });
    });
});
