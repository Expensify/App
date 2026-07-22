import getWorkspaceCreatedAnalyticsEvent from '@libs/getWorkspaceCreatedAnalyticsEvent';

import CONST from '@src/CONST';

const SALES_ELIGIBLE = CONST.ANALYTICS.EVENT.WORKSPACE_CREATED_SALES_ELIGIBLE.NAME;
const STANDARD = CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.NAME;

const PRIVATE_EMAIL = 'user@expensify.com';
const PUBLIC_EMAIL = 'user@gmail.com';

describe('getWorkspaceCreatedAnalyticsEvent', () => {
    it('returns the sales-eligible event when all criteria are met', () => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM, PRIVATE_EMAIL)).toBe(SALES_ELIGIBLE);
    });

    it.each([
        CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM,
        CONST.ONBOARDING_COMPANY_SIZE.SMALL,
        CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL,
        CONST.ONBOARDING_COMPANY_SIZE.MEDIUM,
        CONST.ONBOARDING_COMPANY_SIZE.LARGE,
    ])('treats company size "%s" (5+ employees) as sales eligible', (companySize) => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.MANAGE_TEAM, companySize, PRIVATE_EMAIL)).toBe(SALES_ELIGIBLE);
    });

    it.each([
        // The "1-4" range is below 5 employees, and the deprecated "1-10" range can include fewer than 5 employees.
        CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL,
        CONST.ONBOARDING_COMPANY_SIZE.MICRO,
    ])('treats company size "%s" (possibly under 5 employees) as not sales eligible', (companySize) => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.MANAGE_TEAM, companySize, PRIVATE_EMAIL)).toBe(STANDARD);
    });

    it('returns the standard event when the intent is not "Manage my team"', () => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE, CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM, PRIVATE_EMAIL)).toBe(STANDARD);
    });

    it('returns the standard event when the email domain is public', () => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM, PUBLIC_EMAIL)).toBe(STANDARD);
    });

    it('returns the standard event when company size is missing', () => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.MANAGE_TEAM, undefined, PRIVATE_EMAIL)).toBe(STANDARD);
    });

    it('returns the standard event when the email is empty', () => {
        expect(getWorkspaceCreatedAnalyticsEvent(CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM, '')).toBe(STANDARD);
    });
});
