import {clearAvatarCropDraft, clearAvatarCropResult, setAvatarCropDraft, setAvatarCropResult} from '@libs/actions/AvatarCrop';
import {buildAvatarCropResult, serializeAvatarCropImage} from '@libs/AvatarCropUtils';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AvatarCropResult} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/AvatarCropUtils', () => ({
    serializeAvatarCropImage: jest.fn(),
    buildAvatarCropResult: jest.fn(),
}));

const mockedSerialize = jest.mocked(serializeAvatarCropImage);
const mockedBuildResult = jest.mocked(buildAvatarCropResult);

const TOKEN = 'token-123';
const OPENER_KEY = 'settings/profile/avatar';
const SERIALIZED_URI = 'data:image/png;base64,AAAA';
const BUILT_RESULT: AvatarCropResult = {token: TOKEN, uri: SERIALIZED_URI, name: 'cropped.png', type: 'image/png'};

describe('actions/AvatarCrop', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockedSerialize.mockResolvedValue(SERIALIZED_URI);
        mockedBuildResult.mockResolvedValue(BUILT_RESULT);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('setAvatarCropDraft', () => {
        it('serializes the image and stores the draft with all optional fields', async () => {
            const image = {uri: 'blob:http://localhost/abc', name: 'a.png', type: 'image/png'};

            await setAvatarCropDraft({token: TOKEN, image, openerKey: OPENER_KEY, maskType: 'square', buttonLabelKey: 'common.save'});

            expect(mockedSerialize).toHaveBeenCalledWith(image);
            await expect(getOnyxValue(ONYXKEYS.AVATAR_CROP_DRAFT)).resolves.toEqual({
                token: TOKEN,
                openerKey: OPENER_KEY,
                uri: SERIALIZED_URI,
                name: 'a.png',
                type: 'image/png',
                maskType: 'square',
                buttonLabelKey: 'common.save',
            });
        });

        it('omits optional fields and defaults missing image metadata to empty strings', async () => {
            mockedSerialize.mockResolvedValue(undefined);

            await setAvatarCropDraft({token: TOKEN, image: {uri: 'blob:http://localhost/abc'}, openerKey: OPENER_KEY});

            await expect(getOnyxValue(ONYXKEYS.AVATAR_CROP_DRAFT)).resolves.toEqual({
                token: TOKEN,
                openerKey: OPENER_KEY,
                uri: '',
                name: '',
                type: '',
            });
        });
    });

    describe('clearAvatarCropDraft', () => {
        it('removes a previously stored draft', async () => {
            await setAvatarCropDraft({token: TOKEN, image: {uri: 'blob:http://localhost/abc', name: 'a.png', type: 'image/png'}, openerKey: OPENER_KEY});

            await clearAvatarCropDraft();

            await expect(getOnyxValue(ONYXKEYS.AVATAR_CROP_DRAFT)).resolves.toBeUndefined();
        });
    });

    describe('setAvatarCropResult', () => {
        it('builds the result from the image/token and stores it', async () => {
            const image: CustomRNImageManipulatorResult = {
                uri: 'file:///tmp/cropped.png',
                name: 'cropped.png',
                type: 'image/png',
                size: 1234,
                width: 200,
                height: 200,
            };
            const built: AvatarCropResult = {token: TOKEN, uri: SERIALIZED_URI, name: 'cropped.png', type: 'image/png', size: 1234, width: 200, height: 200};
            mockedBuildResult.mockResolvedValue(built);

            await setAvatarCropResult({token: TOKEN, image});

            expect(mockedBuildResult).toHaveBeenCalledWith(image, TOKEN);
            await expect(getOnyxValue(ONYXKEYS.AVATAR_CROP_RESULT)).resolves.toEqual(built);
        });
    });

    describe('clearAvatarCropResult', () => {
        it('removes a previously stored result', async () => {
            await setAvatarCropResult({token: TOKEN, image: new File(['data'], 'cropped.png', {type: 'image/png'})});

            await clearAvatarCropResult();

            await expect(getOnyxValue(ONYXKEYS.AVATAR_CROP_RESULT)).resolves.toBeUndefined();
        });
    });
});
