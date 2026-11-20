import {act, render} from '@testing-library/react-native';

import Onfido from '@components/Onfido/index.native';

import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import React from 'react';
import {checkMultiple} from 'react-native-permissions';

import {EntrustIdv} from '../../__mocks__/@entrust.corporation/idvsdk-reactnative';

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'ios'),
}));

const NATIVE_RESULT = {
    document: {type: 'document', countryCode: 'USA', sides: [{type: 'front', id: 'front-id', videoId: 'front-video-id'}]},
    faceVideo: {type: 'faceVideo', id: 'face-video-id'},
};

function renderOnfido() {
    const props = {
        sdkToken: 'sdk-token',
        onSuccess: jest.fn(),
        onUserExit: jest.fn(),
        onError: jest.fn(),
    };
    const view = render(<Onfido {...props} />);
    const instance = EntrustIdv.instances.at(-1);
    if (!instance) {
        throw new Error('Onfido did not create an EntrustIdv instance');
    }
    return {...props, view, callbacks: instance.callbacks, instance};
}

describe('Onfido (native)', () => {
    let hmmmSpy: jest.SpyInstance;
    let infoSpy: jest.SpyInstance;

    beforeEach(() => {
        EntrustIdv.instances = [];
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        hmmmSpy = jest.spyOn(Log, 'hmmm').mockImplementation(() => {});
        infoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});
        jest.mocked(checkMultiple).mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('starts the SDK once on mount', () => {
        // Given the component is rendered
        const {instance} = renderOnfido();

        // Then the SDK is started once with the token, since starting it again would open a second flow
        expect(instance.start).toHaveBeenCalledTimes(1);
        expect(instance.start).toHaveBeenCalledWith(expect.objectContaining({sdkToken: 'sdk-token'}));
    });

    it('handles only the first completion when the SDK fires it twice', () => {
        // Given a running flow
        const {callbacks, onSuccess} = renderOnfido();

        // When the SDK calls onComplete twice, as Android can
        act(() => {
            callbacks.onComplete?.(NATIVE_RESULT);
            callbacks.onComplete?.(NATIVE_RESULT);
        });

        // Then the result is sent once with the mapped payload, so the backend doesn't receive the verification twice
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith({
            document: {front: {id: 'front-id'}, back: undefined},
            face: {id: 'face-video-id', variant: CONST.ONFIDO.NATIVE_FACE_VARIANT.VIDEO},
        });
    });

    it('ignores callbacks after it unmounts', () => {
        // Given the user left the screen while the SDK was still running
        const {callbacks, onSuccess, onUserExit, onError, view} = renderOnfido();
        view.unmount();

        // When the SDK reports a result, an exit and an error afterwards
        act(() => {
            callbacks.onComplete?.(NATIVE_RESULT);
            callbacks.onUserExit?.('UserExit');
            callbacks.onError?.({type: 'ExpiredToken', category: 'Authentication', message: 'Token expired'});
        });

        // Then none of them reach the screen, which would otherwise navigate or change wallet state after the user left
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onUserExit).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(hmmmSpy).not.toHaveBeenCalled();
    });

    it('reports a non-permission error on iOS without checking permissions', () => {
        // Given a running flow on iOS
        const {callbacks, onError} = renderOnfido();

        // When the SDK reports an expired token
        act(() => {
            callbacks.onError?.({type: 'ExpiredToken', category: 'Authentication', message: 'Token expired'});
        });

        // Then the error is reported as it is, instead of showing a permissions alert that has nothing to do with it
        expect(checkMultiple).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith('Token expired');
    });

    it('checks permissions for a permission error on iOS', () => {
        // Given a running flow on iOS
        const {callbacks} = renderOnfido();

        // When the SDK reports a permission error
        act(() => {
            callbacks.onError?.({type: 'PermissionsUnavailable', category: CONST.ONFIDO.NATIVE_ERROR_CATEGORY.PERMISSIONS, message: 'Permissions unavailable'});
        });

        // Then the camera and microphone permissions are checked, so the user can be sent to Settings to grant them
        expect(checkMultiple).toHaveBeenCalledTimes(1);
    });
});
