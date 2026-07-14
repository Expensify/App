import {buildFileFromAvatarCropResult, serializeAvatarCropImage} from '@libs/AvatarCropUtils';
import {base64ToFile, convertFileObjectOrUriToBase64DataURL} from '@libs/fileDownload/FileUtils';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import type {AvatarCropResult} from '@src/types/onyx';

jest.mock('@libs/getPlatform', () => jest.fn());
jest.mock('@libs/Log');
jest.mock('@libs/fileDownload/FileUtils', () => ({
    base64ToFile: jest.fn(),
    convertFileObjectOrUriToBase64DataURL: jest.fn(),
}));

const mockedGetPlatform = jest.mocked(getPlatform);
const mockedBase64ToFile = jest.mocked(base64ToFile);
const mockedConvertToBase64 = jest.mocked(convertFileObjectOrUriToBase64DataURL);

describe('AvatarCropUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('serializeAvatarCropImage', () => {
        it('resolves undefined when the image has no uri', async () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

            await expect(serializeAvatarCropImage({uri: '', name: 'a.png', type: 'image/png'})).resolves.toBeUndefined();
            expect(mockedConvertToBase64).not.toHaveBeenCalled();
        });

        it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('returns the file uri unchanged on %s (native)', async (platform) => {
            mockedGetPlatform.mockReturnValue(platform);

            await expect(
                serializeAvatarCropImage({
                    uri: 'file:///tmp/a.png',
                    name: 'a.png',
                    type: 'image/png',
                }),
            ).resolves.toBe('file:///tmp/a.png');
            expect(mockedConvertToBase64).not.toHaveBeenCalled();
        });

        it('converts to a base64 data URL on web', async () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            mockedConvertToBase64.mockResolvedValue('data:image/png;base64,AAAA');
            const image = {
                uri: 'blob:http://localhost/abc',
                name: 'a.png',
                type: 'image/png',
            };

            await expect(serializeAvatarCropImage(image)).resolves.toBe('data:image/png;base64,AAAA');
            expect(mockedConvertToBase64).toHaveBeenCalledWith(image);
        });

        it('falls back to the original uri when base64 conversion fails on web', async () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            mockedConvertToBase64.mockRejectedValue(new Error('boom'));

            await expect(
                serializeAvatarCropImage({
                    uri: 'blob:http://localhost/abc',
                    name: 'a.png',
                    type: 'image/png',
                }),
            ).resolves.toBe('blob:http://localhost/abc');
        });
    });

    describe('buildFileFromAvatarCropResult', () => {
        const dataUrlResult: AvatarCropResult = {
            token: '1',
            uri: 'data:image/png;base64,AAAA',
            name: 'a.png',
            type: 'image/png',
        };

        it('rebuilds a File from a base64 data URL on web', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const file = new File([], 'a.png');
            mockedBase64ToFile.mockReturnValue(file);

            expect(buildFileFromAvatarCropResult(dataUrlResult)).toBe(file);
            expect(mockedBase64ToFile).toHaveBeenCalledWith(dataUrlResult.uri, dataUrlResult.name);
        });

        it('falls back to a manipulator result object when base64 reconstruction throws on web', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            mockedBase64ToFile.mockImplementation(() => {
                throw new Error('boom');
            });

            expect(buildFileFromAvatarCropResult(dataUrlResult)).toEqual({
                uri: dataUrlResult.uri,
                name: dataUrlResult.name,
                type: dataUrlResult.type,
                size: 0,
                width: 0,
                height: 0,
            });
        });

        it('returns a manipulator result object on web when the uri is not a data URL', () => {
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
            const result: AvatarCropResult = {
                token: '1',
                uri: 'blob:http://localhost/abc',
                name: 'a.png',
                type: 'image/png',
                size: 10,
                width: 20,
                height: 30,
            };

            expect(buildFileFromAvatarCropResult(result)).toEqual({
                uri: result.uri,
                name: 'a.png',
                type: 'image/png',
                size: 10,
                width: 20,
                height: 30,
            });
            expect(mockedBase64ToFile).not.toHaveBeenCalled();
        });

        it.each([CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('returns a manipulator result object on %s (native), defaulting missing dimensions', (platform) => {
            mockedGetPlatform.mockReturnValue(platform);
            const result: AvatarCropResult = {
                token: '1',
                uri: 'file:///tmp/a.png',
                name: 'a.png',
                type: 'image/png',
            };

            expect(buildFileFromAvatarCropResult(result)).toEqual({
                uri: 'file:///tmp/a.png',
                name: 'a.png',
                type: 'image/png',
                size: 0,
                width: 0,
                height: 0,
            });
            expect(mockedBase64ToFile).not.toHaveBeenCalled();
        });
    });
});
