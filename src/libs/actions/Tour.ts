import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {IntroSelected} from './Report';
import {completeTestDriveTask} from './Task';

function startTestDrive(
    introSelected: IntroSelected | undefined,
    viewTourReport: OnyxEntry<Report>,
    viewTourReportID: string | undefined,
    shouldUpdateSelfTourViewedOnlyLocally = false,
    hasUserBeenAddedToNudgeMigration = false,
) {
    InteractionManager.runAfterInteractions(() => {
        if (
            hasUserBeenAddedToNudgeMigration ||
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

// eslint-disable-next-line import/prefer-default-export
export {startTestDrive};
