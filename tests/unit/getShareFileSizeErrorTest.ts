import getShareFileSizeError from '@pages/Share/getShareFileSizeError';

import CONST from '@src/CONST';

import {translateLocal} from '../utils/TestHelper';

describe('getShareFileSizeError', () => {
    it.each([
        [
            'above the maximum',
            CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1,
            {title: translateLocal('attachmentPicker.attachmentTooLarge'), message: translateLocal('attachmentPicker.sizeExceeded')},
        ],
        [
            'below the minimum',
            CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE - 1,
            {title: translateLocal('attachmentPicker.attachmentTooSmall'), message: translateLocal('attachmentPicker.sizeNotMet')},
        ],
        ['exactly the maximum', CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE, undefined],
        ['exactly the minimum', CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE, undefined],
    ])('returns the right copy for a size %s', (_, size, expectedError) => {
        // Given a shared file of this size

        // When its size is checked against the API limits
        const sizeError = getShareFileSizeError(size, translateLocal);

        // Then only sizes the API would reject get an error, and the limits themselves are allowed
        expect(sizeError).toEqual(expectedError);
    });
});
