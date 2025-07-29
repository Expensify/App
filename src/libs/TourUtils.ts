import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {IntroSelected} from './actions/Report';
import {completeTestDriveTask} from './actions/Task';
import Navigation from './Navigation/Navigation';

function getTestDriveURL(shouldUseNarrowLayout: boolean, introSelected?: IntroSelected) {
    if (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE) {
        return shouldUseNarrowLayout ? CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE : CONST.STORYLANE.EMPLOYEE_TOUR;
    }

    if (introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
        return shouldUseNarrowLayout ? CONST.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE : CONST.STORYLANE.TRACK_WORKSPACE_TOUR;
    }

    return shouldUseNarrowLayout ? CONST.STORYLANE.ADMIN_TOUR_MOBILE : CONST.STORYLANE.ADMIN_TOUR;
}

function startTestDrive(introSelected: IntroSelected | undefined, viewTourReport: OnyxEntry<Report>, viewTourReportID: string | undefined, shouldUpdateSelfTourViewedOnlyLocally = false) {
    InteractionManager.runAfterInteractions(() => {
        if (
            introSelected?.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ||
            introSelected?.choice === CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER ||
            introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE ||
            (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE)
        ) {
            completeTestDriveTask(viewTourReport, viewTourReportID, shouldUpdateSelfTourViewedOnlyLocally);
            Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
        } else {
            Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
        }
    });
}

export {getTestDriveURL, startTestDrive};
