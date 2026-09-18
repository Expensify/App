import getReceiptCameraFormatFiltersAndroid from '@pages/iou/request/step/IOURequestStepScan/utils/getReceiptCameraFormatFilters/index.android';
import getReceiptCameraFormatFiltersIOS from '@pages/iou/request/step/IOURequestStepScan/utils/getReceiptCameraFormatFilters/index.ios';

import CONST from '@src/CONST';

const WINDOW_WIDTH = 390;
const WINDOW_HEIGHT = 844;

describe('getReceiptCameraFormatFilters', () => {
    it('ranks aspect ratio and photo resolution above everything else', () => {
        const filters = getReceiptCameraFormatFiltersIOS({windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT});

        expect(filters.at(0)).toEqual({photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO});
        expect(filters.at(1)).toEqual({photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}});
    });

    it('matches the iOS video resolution to the photo target so snapshots keep their quality', () => {
        const filters = getReceiptCameraFormatFiltersIOS({windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT});

        expect(filters.at(2)).toEqual({videoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}});
    });

    it('caps the Android video resolution to the screen, which is all its preview screenshot needs', () => {
        const filters = getReceiptCameraFormatFiltersAndroid({windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT});

        expect(filters.at(2)).toEqual({videoResolution: {width: WINDOW_HEIGHT, height: WINDOW_WIDTH}});
    });

    it('carries no autoFocusSystem filter, which would change the weights of every other filter', () => {
        const iosFilters = getReceiptCameraFormatFiltersIOS({windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT});
        const androidFilters = getReceiptCameraFormatFiltersAndroid({windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT});

        expect(iosFilters).toHaveLength(3);
        expect(androidFilters).toHaveLength(3);
        expect(iosFilters.some((filter) => 'autoFocusSystem' in filter)).toBe(false);
        expect(androidFilters.some((filter) => 'autoFocusSystem' in filter)).toBe(false);
    });
});
