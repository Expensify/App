import {getTestDriveURL} from '@libs/TourUtils';
import CONST from '@src/CONST';

describe('TourUtils', () => {
    describe('getTestDriveURL', () => {
        describe('Invited employee', () => {
            it('returns proper URL when screen is narrow', () => {
                const url = getTestDriveURL(true, {choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE});

                expect(url).toBe(CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE);
            });

            it('returns proper URL when screen is not narrow', () => {
                const url = getTestDriveURL(false, {choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE});

                expect(url).toBe(CONST.STORYLANE.EMPLOYEE_TOUR);
            });
        });

        describe('Intro selected is Track Workspace', () => {
            it('returns proper URL when screen is narrow', () => {
                const url = getTestDriveURL(true, {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE});

                expect(url).toBe(CONST.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE);
            });

            it('returns proper URL when screen is not narrow', () => {
                const url = getTestDriveURL(false, {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE});

                expect(url).toBe(CONST.STORYLANE.TRACK_WORKSPACE_TOUR);
            });
        });

        describe('Default case - Admin tour', () => {
            it('returns proper URL when screen is narrow', () => {
                const url = getTestDriveURL(true);

                expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_MOBILE);
            });

            it('returns proper URL when screen is not narrow', () => {
                const url = getTestDriveURL(false);

                expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR);
            });
        });
    });
});
