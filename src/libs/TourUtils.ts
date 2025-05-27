import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {OnboardingPurpose} from '@src/CONST';

function getNavatticURL(environment: ValueOf<typeof CONST.ENVIRONMENT>, introSelected?: OnboardingPurpose) {
    const adminTourURL = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.NAVATTIC.ADMIN_TOUR_PRODUCTION : CONST.NAVATTIC.ADMIN_TOUR_STAGING;
    const employeeTourURL = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.NAVATTIC.EMPLOYEE_TOUR_PRODUCTION : CONST.NAVATTIC.EMPLOYEE_TOUR_STAGING;
    return introSelected === CONST.SELECTABLE_ONBOARDING_CHOICES.MANAGE_TEAM ? adminTourURL : employeeTourURL;
}

function getTestDriveURL(environment: ValueOf<typeof CONST.ENVIRONMENT>, shouldUseNarrowLayout: boolean) {
    if (shouldUseNarrowLayout) {
        return environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.STORYLANE.ADMIN_TOUR_MOBILE_PRODUCTION : CONST.STORYLANE.ADMIN_TOUR_MOBILE_STAGING;
    }

    return environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.STORYLANE.ADMIN_TOUR_PRODUCTION : CONST.STORYLANE.ADMIN_TOUR_STAGING;
}

export {getNavatticURL, getTestDriveURL};
