import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {IntroSelected} from './Report';

function startTestDrive(introSelected: IntroSelected | undefined, hasUserBeenAddedToNudgeMigration: boolean, isUserPaidPolicyMember: boolean) {
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
            Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
        } else {
            Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
        }
    });
}

// eslint-disable-next-line import/prefer-default-export
export {startTestDrive};
