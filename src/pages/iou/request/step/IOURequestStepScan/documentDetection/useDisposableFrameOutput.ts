import type {CameraFrameOutput, Frame} from 'react-native-vision-camera';

/**
 * VisionCamera's useFrameOutput without its leak: on unmount it detaches the frame callback.
 * The callback lives in the worklet runtime and the native output holds the callback, so without the detach neither is ever freed.
 */
import {useEffect, useState} from 'react';
import {VisionCamera} from 'react-native-vision-camera';
import {provider} from 'react-native-vision-camera-worklets';

type FrameOutputOptions = Parameters<typeof VisionCamera.createFrameOutput>[0];

function createFrameOutput(options: FrameOutputOptions) {
    const frameOutput = VisionCamera.createFrameOutput(options);
    // Without a handler, VisionCamera console.warns on every dropped frame.
    frameOutput.setOnFrameDroppedCallback(() => {});
    return {frameOutput, runtime: provider.createRuntimeForThread(frameOutput.thread)};
}

function useDisposableFrameOutput(options: FrameOutputOptions, onFrame: (frame: Frame) => void): CameraFrameOutput {
    const [{frameOutput, runtime}] = useState(() => createFrameOutput(options));

    useEffect(() => {
        runtime.setOnFrameCallback(frameOutput, onFrame);
    }, [frameOutput, runtime, onFrame]);

    useEffect(() => () => runtime.setOnFrameCallback(frameOutput, undefined), [frameOutput, runtime]);

    return frameOutput;
}

export default useDisposableFrameOutput;
