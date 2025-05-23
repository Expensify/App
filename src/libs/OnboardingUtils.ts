import type {OnboardingAccounting, OnboardingCompanySize} from '@src/CONST';
import CONST from '@src/CONST';
import getPlatform from './getPlatform';

const supportedIntegrationsInNewDot = ['quickbooksOnline', 'quickbooksDesktop', 'xero', 'netsuite', 'intacct', 'other'] as OnboardingAccounting[];

/**
 * Determines if the user should be redirected to old dot based on company size and platform
 * @param companySize - The company size from onboarding
 * @param userReportedIntegration - The user reported integration
 * @returns boolean - True if user should be redirected to old dot
 */
function shouldOnboardingRedirectToOldDot(companySize: OnboardingCompanySize | undefined, userReportedIntegration: OnboardingAccounting | undefined): boolean {
    const isSupportedIntegration = (!!userReportedIntegration && supportedIntegrationsInNewDot.includes(userReportedIntegration)) || userReportedIntegration === null;
    return getPlatform() !== CONST.PLATFORM.DESKTOP && (!isSupportedIntegration || companySize !== CONST.ONBOARDING_COMPANY_SIZE.MICRO);
}

// eslint-disable-next-line import/prefer-default-export
export {shouldOnboardingRedirectToOldDot};
