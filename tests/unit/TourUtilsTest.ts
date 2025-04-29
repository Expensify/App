import {getTestDriveURL} from '@libs/TourUtils';
import CONST from '@src/CONST';

describe('TourUtils', () => {
    describe('getTestDriveURL', () => {
        describe('Environment is production', () => {
            it('returns proper URL when screen is narrow', () => {
                const url = getTestDriveURL(CONST.ENVIRONMENT.PRODUCTION, true);

                expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_MOBILE_PRODUCTION);
            });

            it('returns proper URL when screen is not narrow', () => {
                const url = getTestDriveURL(CONST.ENVIRONMENT.PRODUCTION, false);

                expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_PRODUCTION);
            });
        });

        describe('Environment is not production', () => {
            it('returns proper URL when screen is narrow', () => {
                const url = getTestDriveURL(CONST.ENVIRONMENT.STAGING, true);

                expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_MOBILE_STAGING);
            });

            it('returns proper URL when screen is not narrow', () => {
                const url = getTestDriveURL(CONST.ENVIRONMENT.STAGING, false);

                expect(url).toBe(CONST.STORYLANE.ADMIN_TOUR_STAGING);
            });
        });
    });
});
