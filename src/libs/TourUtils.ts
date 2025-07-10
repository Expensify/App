import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {IntroSelected} from './actions/Report';
import type {OnboardingPurpose} from './actions/Welcome/OnboardingFlow';

function getNavatticURL(environment: ValueOf<typeof CONST.ENVIRONMENT>, introSelected?: OnboardingPurpose) {
    const adminTourURL = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.NAVATTIC.ADMIN_TOUR_PRODUCTION : CONST.NAVATTIC.ADMIN_TOUR_STAGING;
    const employeeTourURL = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.NAVATTIC.EMPLOYEE_TOUR_PRODUCTION : CONST.NAVATTIC.EMPLOYEE_TOUR_STAGING;
    return introSelected === CONST.SELECTABLE_ONBOARDING_CHOICES.MANAGE_TEAM ? adminTourURL : employeeTourURL;
}

function getTestDriveURL(shouldUseNarrowLayout: boolean, introSelected?: IntroSelected) {
    // At the moment we are using Navattic link, but it will be changed to Storylane in the future.
    if (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE) {
        return CONST.NAVATTIC.EMPLOYEE_TOUR_PRODUCTION;
    }

    if (shouldUseNarrowLayout) {
        return introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE ? CONST.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE : CONST.STORYLANE.ADMIN_TOUR_MOBILE;
    }

    return introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE ? CONST.STORYLANE.TRACK_WORKSPACE_TOUR : CONST.STORYLANE.ADMIN_TOUR;
}

export {getNavatticURL, getTestDriveURL};
