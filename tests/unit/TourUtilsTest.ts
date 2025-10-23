import {getTestDriveURL} from '@libs/TourUtils';
import CONST from '@src/CONST';

describe('TourUtils', () => {
    describe('getTestDriveURL', () => {
        describe('NewDot users with introSelected NVP', () => {
            describe('Invited employee', () => {
                it('returns proper URL when screen is narrow', () => {
                    const url = getTestDriveURL(true, {choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE}, false);

                    expect(url).toBe(CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE);
                });

                it('returns proper URL when screen is not narrow', () => {
                    const url = getTestDriveURL(false, {choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE}, false);

                    expect(url).toBe(CONST.STORYLANE.EMPLOYEE_TOUR);
                });
            });

            describe('Intro selected is Track Workspace', () => {
                it('returns proper URL when screen is narrow', () => {
                    const url = getTestDriveURL(true, {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}, false);

                    expect(url).toBe(CONST.STORYLANE.TRACK_WORKSPACE_TOUR_MOBILE);
                });

                it('returns proper URL when screen is not narrow', () => {
                    const url = getTestDriveURL(false, {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}, false);

                    expect(url).toBe(CONST.STORYLANE.TRACK_WORKSPACE_TOUR);
                });
            });

            describe('Default case - Admin tour', () => {
                it('returns proper URL when screen is narrow', () => {
                    const url = getTestDriveURL(true, {}, false);

                    expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_MOBILE);
                });

                it('returns proper URL when screen is not narrow', () => {
                    const url = getTestDriveURL(false, {}, false);

                    expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR);
                });
            });
        });

        describe('Migrated users from Classic - no introSelected NVP', () => {
            describe('User is admin of a workspace', () => {
                it('returns proper URL when screen is narrow', () => {
                    const url = getTestDriveURL(true, undefined, true);

                    expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_MOBILE);
                });

                it('returns proper URL when screen is not narrow', () => {
                    const url = getTestDriveURL(false, undefined, true);

                    expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR);
                });
            });

            describe('Default case - Employee tour', () => {
                it('returns proper URL when screen is narrow', () => {
                    const url = getTestDriveURL(true, undefined, false);

                    expect(url).toBe(CONST.STORYLANE.EMPLOYEE_TOUR_MOBILE);
                });

                it('returns proper URL when screen is not narrow', () => {
                    const url = getTestDriveURL(false, undefined, false);

                    expect(url).toBe(CONST.STORYLANE.EMPLOYEE_TOUR);
                });
            });
        });
    });
});
