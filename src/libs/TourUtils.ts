import CONST from '@src/CONST';
import type {IntroSelected} from './actions/Report';

function getTestDriveURL(shouldUseNarrowLayout: boolean, introSelected?: IntroSelected) {
    if (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE) {
        return shouldUseNarrowLayout ? CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE : CONST.STORYLANE.EMPLOYEE_TOUR;
    }

    if (introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        return shouldUseNarrowLayout ? CONST.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE : CONST.STORYLANE.TRACK_WORKSPACE_TOUR;
    }

    return shouldUseNarrowLayout ? CONST.STORYLANE.ADMIN_TOUR_MOBILE : CONST.STORYLANE.ADMIN_TOUR;
}

// eslint-disable-next-line import/prefer-default-export
// Untested function
function simulateTourStart(tourName: string): string {
    return `Starting tour: ${tourName}`;
}

export {getTestDriveURL, simulateTourStart};
