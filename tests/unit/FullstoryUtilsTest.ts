/* eslint-disable @typescript-eslint/naming-convention -- Test assertions use FullStory's external snake_case keys. */
import CONST from '@src/CONST';
import {buildFullstoryUserVars, buildPageViewedEvent, getOnboardingStep} from '@src/libs/Fullstory/utils';
import createRandomPolicy from '../utils/collections/policies';

describe('FullstoryUtils', () => {
    it('builds expected FullStory user vars from onboarding and workspace context', () => {
        const policy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Test Workspace'),
            role: CONST.POLICY.ROLE.ADMIN,
            pendingAction: undefined,
            employeeList: {
                1: {email: 'a@test.com'},
                2: {email: 'b@test.com'},
            },
        };

        const userVars = buildFullstoryUserVars({
            account: {isFromPublicDomain: true},
            activePolicy: policy,
            introSelected: {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                companySize: '1-10',
            },
            loginList: {
                test: {
                    partnerName: 'google.com',
                },
            },
            onboarding: {
                hasCompletedGuidedSetupFlow: false,
                signupQualifier: CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB,
            },
            onboardingCompanySize: '1-10',
            onboardingLastVisitedPath: '/onboarding/workspace',
            onboardingPurposeSelected: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
            policies: {
                [`policy_${policy.id}`]: policy,
            },
            session: {email: 'test@test.com'},
            userMetadata: {
                freeTrialEndDate: '2099-05-31 23:59:59',
                paidMember: true,
            },
        });

        expect(userVars).toMatchObject({
            user_type_path: 'team_1_10_public',
            account_type: 'business',
            user_status: 'new',
            has_completed_onboarding: false,
            onb_step: 'registration',
            user_role: 'admin',
            workspace_state: 'has_workspaces',
            workspace_count: 1,
            workspace_member_count: 2,
            free_trial_end_date: '2099-05-31 23:59:59',
            free_trial_status: 'active',
            plan_type: 'collect',
            paid_member: true,
            auth_method: 'google',
        });
        expect(userVars.days_till_trial_end).toBeGreaterThan(0);
    });

    it('builds page viewed event metadata', () => {
        expect(buildPageViewedEvent('OnboardingWorkspace', '/onboarding/workspace')).toEqual({
            screen_name: 'OnboardingWorkspace',
            entry_point: '/onboarding/workspace',
            onb_step: 'registration',
        });
    });

    it('returns completed onboarding step when flow is finished', () => {
        expect(getOnboardingStep('/settings/workspaces', true)).toBe('completed');
    });
});
