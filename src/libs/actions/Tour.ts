import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {IntroSelected} from './Report';

function startTestDrive(introSelected: IntroSelected | undefined, hasUserBeenAddedToNudgeMigration: boolean, isUserPaidPolicyMember: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        void introSelected;
        void hasUserBeenAddedToNudgeMigration;
        void isUserPaidPolicyMember;
        Navigation.navigate(ROUTES.TEST_DRIVE_DEMO_ROOT);
    });
}

// eslint-disable-next-line import/prefer-default-export
export {startTestDrive};
