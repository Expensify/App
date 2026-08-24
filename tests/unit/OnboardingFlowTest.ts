import {getOnboardingInitialPath, getRequired2FAOnboardingResumePath, startOnboardingFlow} from '@libs/actions/Welcome/OnboardingFlow';
import type {GetOnboardingInitialPathParamsType} from '@libs/actions/Welcome/OnboardingFlow';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type * as NativeNavigation from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(),
    getRootState: jest.fn(),
    resetRoot: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/getAdaptedStateFromPath', () => jest.fn());

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    findFocusedRoute: jest.fn(),
}));

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
        const mockedGetCurrentRoute = jest.mocked(navigationRef.getCurrentRoute);
        const mockedGetRootState = jest.mocked(navigationRef.getRootState);
        const mockedResetRoot = jest.mocked(navigationRef.resetRoot);
        /* eslint-enable @typescript-eslint/unbound-method */
        const mockedGetAdaptedStateFromPath = jest.mocked(getAdaptedStateFromPath);
        const mockedFindFocusedRoute = jest.mocked(findFocusedRoute);

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

        // startOnboardingFlow only reads `routes` off the root state, but getRootState's return type requires a full
        // NavigationState, so build a minimal-but-complete one to avoid an unsafe type assertion.
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
            // The onboarding modal navigator is already mounted; getAdaptedStateFromPath resolves to it.
            mockedGetAdaptedStateFromPath.mockReturnValue({routes: [{name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}]} as ReturnType<typeof getAdaptedStateFromPath>);
        });

        it('should not call resetRoot when the merged route list is unchanged (no-op that would still fire replaceState)', () => {
            mockedGetCurrentRoute.mockReturnValue({key: 'route-key', name: SCREENS.ONBOARDING.PRIVATE_DOMAIN, params: {}});
            // Resolved target focuses a different route name, so the name-only guard passes through to the merge check.
            mockedFindFocusedRoute.mockReturnValue({key: 'focused-key', name: SCREENS.ONBOARDING.PERSONAL_DETAILS});
            mockedGetRootState.mockReturnValue(buildRootState([{key: 'onboarding', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}]));

            startOnboardingFlow(params);

            expect(mockedResetRoot).not.toHaveBeenCalled();
        });

        it('should call resetRoot when the merged route list adds the onboarding navigator', () => {
            mockedGetCurrentRoute.mockReturnValue({key: 'route-key', name: SCREENS.HOME});
            mockedFindFocusedRoute.mockReturnValue({key: 'focused-key', name: SCREENS.ONBOARDING.PERSONAL_DETAILS});
            // Root state does not yet contain the onboarding navigator, so the merge appends it and the route list changes.
            mockedGetRootState.mockReturnValue(buildRootState([{key: 'home', name: SCREENS.HOME}]));

            startOnboardingFlow(params);

            expect(mockedResetRoot).toHaveBeenCalledTimes(1);
        });

        it('should not call resetRoot when the resolved route name already matches the current route', () => {
            mockedGetCurrentRoute.mockReturnValue({key: 'route-key', name: SCREENS.ONBOARDING.PERSONAL_DETAILS, params: {}});
            mockedFindFocusedRoute.mockReturnValue({key: 'focused-key', name: SCREENS.ONBOARDING.PERSONAL_DETAILS});
            mockedGetRootState.mockReturnValue(buildRootState([{key: 'home', name: SCREENS.HOME}]));

            startOnboardingFlow(params);

            expect(mockedResetRoot).not.toHaveBeenCalled();
        });
    });
});
