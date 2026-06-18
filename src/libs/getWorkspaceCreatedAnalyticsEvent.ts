import CONST from '@src/CONST';

import type {GoogleTagManagerEvent} from './GoogleTagManager/types';

import {isEmailPublicDomain} from './LoginUtils';

// Company size ranges that represent 5 or more employees. The "1-4" range and the deprecated "1-10" range are excluded
// because they can include fewer than 5 employees.
const SALES_ELIGIBLE_COMPANY_SIZES = new Set<string>([
    CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM,
    CONST.ONBOARDING_COMPANY_SIZE.SMALL,
    CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL,
    CONST.ONBOARDING_COMPANY_SIZE.MEDIUM,
    CONST.ONBOARDING_COMPANY_SIZE.LARGE,
]);

/**
 * Determines which workspace-created conversion event to publish to the ad platforms.
 *
 * Returns the `workspace_created_sales_eligible` event when the creator matches our higher-value "sales-eligible"
 * profile, defined as all of:
 * - Onboarding intent is "Manage my team"
 * - Company size of 5 or more employees
 * - A private (non-public/free) email domain
 *
 * Otherwise returns the standard `workspace_created` event.
 */
function getWorkspaceCreatedAnalyticsEvent(engagementChoice: string | undefined, companySize: string | undefined, email: string): GoogleTagManagerEvent {
    const isSalesEligible =
        engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM && !!companySize && SALES_ELIGIBLE_COMPANY_SIZES.has(companySize) && !!email && !isEmailPublicDomain(email);

    return isSalesEligible ? CONST.ANALYTICS.EVENT.WORKSPACE_CREATED_SALES_ELIGIBLE.NAME : CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.NAME;
}

export default getWorkspaceCreatedAnalyticsEvent;
