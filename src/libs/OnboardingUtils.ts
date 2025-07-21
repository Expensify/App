import type {OnboardingAccounting} from '@src/CONST';
import CONST from '@src/CONST';
import type {OnboardingCompanySize} from './actions/Welcome/OnboardingFlow';
import getPlatform from './getPlatform';

const supportedIntegrationsInNewDot = ['quickbooksOnline', 'quickbooksDesktop', 'xero', 'netsuite', 'intacct', 'other'] as OnboardingAccounting[];

/**
 * Determines if the user should be redirected to old dot based on company size and platform
 * @param companySize - The company size from onboarding
 * @param userReportedIntegration - The user reported integration
 * @returns boolean - True if user should be redirected to old dot
 */
function shouldOnboardingRedirectToOldDot(companySize: OnboardingCompanySize | undefined, userReportedIntegration: OnboardingAccounting | undefined): boolean {
    // Desktop users should never be redirected to old dot
    if (getPlatform() === CONST.PLATFORM.DESKTOP) {
        return false;
    }

    // Check if the integration is supported in NewDot
    const isSupportedIntegration = (!!userReportedIntegration && supportedIntegrationsInNewDot.includes(userReportedIntegration)) || userReportedIntegration === null;

    // Don't redirect if integration is supported and company size is MICRO or SMALL
    const isMicroOrSmallCompany = companySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO || companySize === CONST.ONBOARDING_COMPANY_SIZE.SMALL;
    if (isSupportedIntegration && isMicroOrSmallCompany) {
        return false;
    }

    // Redirect to old dot in all other cases (unsupported integration or larger company size)
    return true;
}

// eslint-disable-next-line import/prefer-default-export
export {shouldOnboardingRedirectToOldDot};
