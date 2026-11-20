import {act, render} from '@testing-library/react-native';

import Onfido from '@components/Onfido/index.native';

import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';

import CONST from '@src/CONST';

import React from 'react';
import {Alert} from 'react-native';
import {checkMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';

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

    it('reports an error instead of starting the SDK without a token', () => {
        // Given the bank account page renders the flow after its stored token was cleared
        const onError = jest.fn();

        // When the component mounts with an empty token
        render(
            <Onfido
                sdkToken=""
                onSuccess={jest.fn()}
                onUserExit={jest.fn()}
                onError={onError}
            />,
        );

        // Then the SDK is never created, because the iOS SDK crashes the app on a token it can't read, and the page is told about the error so it can go back
        expect(EntrustIdv.instances).toHaveLength(0);
        expect(onError).toHaveBeenCalledWith(CONST.ERROR.UNKNOWN_ERROR);
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

    it('shows the camera alert when iOS reports a denied camera', async () => {
        // Given a running flow on iOS where the camera is blocked and the microphone is allowed
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // The shared react-native-permissions mock returns a plain object, but the component chains `.then`, so this test resolves a promise.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the two permissions the component asks for are needed
        jest.mocked(checkMultiple).mockResolvedValueOnce({
            [PERMISSIONS.IOS.CAMERA]: RESULTS.BLOCKED,
            [PERMISSIONS.IOS.MICROPHONE]: RESULTS.GRANTED,
        } as Awaited<ReturnType<typeof checkMultiple>>);
        const {callbacks, onError} = renderOnfido();

        // When the SDK reports a denied camera the way iOS sends it: the type is an encoded Swift enum case, and there is no category
        await act(async () => {
            callbacks.onError?.({type: {cameraPermissionDenied: {}}, message: 'Flow error due to camera permission being declined at app-level'});
        });

        // Then the camera alert is shown so the user can open Settings, instead of a generic error
        expect(checkMultiple).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });
});
