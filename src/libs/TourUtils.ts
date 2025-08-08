import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {IntroSelected} from './actions/Report';

function getTestDriveURL(shouldUseNarrowLayout: boolean, introSelected: OnyxEntry<IntroSelected>, isUserPolicyAdmin: boolean): string {
    if (introSelected) {
        if (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE) {
            return shouldUseNarrowLayout ? CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE : CONST.STORYLANE.EMPLOYEE_TOUR;
        }

        if (introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
            return shouldUseNarrowLayout ? CONST.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE : CONST.STORYLANE.TRACK_WORKSPACE_TOUR;
        }

        return shouldUseNarrowLayout ? CONST.STORYLANE.ADMIN_TOUR_MOBILE : CONST.STORYLANE.ADMIN_TOUR;
    }

    // Migrated users don't have the introSelected NVP, so we must check if they are an Admin of any Workspace in order
    // to show the Admin demo.
    if (isUserPolicyAdmin) {
        return shouldUseNarrowLayout ? CONST.STORYLANE.ADMIN_TOUR_MOBILE : CONST.STORYLANE.ADMIN_TOUR;
    }

    return shouldUseNarrowLayout ? CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE : CONST.STORYLANE.EMPLOYEE_TOUR;
}

// eslint-disable-next-line import/prefer-default-export
export {getTestDriveURL};
