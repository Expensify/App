import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {IntroSelected} from './Report';
import {completeTestDriveTask} from './Task';

function startTestDrive(
    introSelected: IntroSelected | undefined,
    shouldUpdateSelfTourViewedOnlyLocally: boolean,
    hasUserBeenAddedToNudgeMigration: boolean,
    isUserPaidPolicyMember: boolean,
    viewTourTaskReport: OnyxEntry<OnyxTypes.Report>,
    viewTourTaskParentReport: OnyxEntry<OnyxTypes.Report>,
    isViewTourTaskParentReportArchived: boolean,
) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        if (
            hasUserBeenAddedToNudgeMigration ||
            isUserPaidPolicyMember ||
            introSelected?.choice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ||
            introSelected?.choice === CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER ||
            introSelected?.choice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE ||
            (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE)
        ) {
            completeTestDriveTask(viewTourTaskReport, viewTourTaskParentReport, isViewTourTaskParentReportArchived, shouldUpdateSelfTourViewedOnlyLocally);
            Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
        } else {
            Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
        }
    });
}

// eslint-disable-next-line import/prefer-default-export
export {startTestDrive};
