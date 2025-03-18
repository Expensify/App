import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {OnboardingPurpose} from '@src/CONST';

function getNavatticURL(environment: ValueOf<typeof CONST.ENVIRONMENT>, introSelected?: OnboardingPurpose) {
    const adminTourURL = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.NAVATTIC.ADMIN_TOUR_PRODUCTION : CONST.NAVATTIC.ADMIN_TOUR_STAGING;
    const employeeTourURL = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.NAVATTIC.EMPLOYEE_TOUR_PRODUCTION : CONST.NAVATTIC.EMPLOYEE_TOUR_STAGING;
    return introSelected === CONST.SELECTABLE_ONBOARDING_CHOICES.MANAGE_TEAM ? adminTourURL : employeeTourURL;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getNavatticURL,
};
