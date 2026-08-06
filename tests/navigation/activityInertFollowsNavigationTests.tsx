import {act, render, screen} from '@testing-library/react-native';

import ScreenActivityWrapper from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {ScaledSize} from 'react-native';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import type {WindowDimensionsChangeMock} from '../utils/mockWindowDimensionsChange';

import completeRevealTransition from '../utils/completeRevealTransition';
import {buildWindowSize, mockWindowDimensionsChange} from '../utils/mockWindowDimensionsChange';

/**
 * The one design decision the wrapper makes on its own: the accessibility state follows the navigation state,
 * while the Activity mode lags behind it on the reveal. Everything here runs on the real useIsScreenCovered,
 * the real useScreenActivityMode and the real TransitionTracker, so only the navigator itself is replaced -
 * a harness that stubs either hook can no longer tell the two timings apart.
 */

const mockIsFocused = jest.fn<boolean, []>();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused(),
}));

const effectLog: string[] = [];

function ScreenContent() {
    useEffect(() => {
        effectLog.push('mount');
        return () => {
            effectLog.push('unmount');
        };
    }, []);
    return <View testID="screen-content" />;
}

function WrappedScreen({isScreenBlurred}: {isScreenBlurred: boolean}) {
    return (
        <ScreenActivityWrapper
            isScreenBlurred={isScreenBlurred}
            routeKey="key-1"
            routeName="MiddleScreen"
        >
            <ScreenContent />
        </ScreenActivityWrapper>
    );
}

/** The mode is only observable through the effects, which React unmounts for a hidden Activity and mounts on reveal. */
function isDeprioritized() {
    return effectLog.at(-1) === 'unmount';
}

function isInAccessibilityTree() {
    return screen.queryByTestId('screen-content') !== null;
}

function flushFirstRenderFrame() {
    act(() => {
        jest.advanceTimersByTime(20);
    });
}

const INITIAL_WINDOW_SIZE: ScaledSize = buildWindowSize(400, 900);

let windowDimensions: WindowDimensionsChangeMock;

describe('inert follows the navigation state, not the Activity mode', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        effectLog.length = 0;
        mockIsFocused.mockReturnValue(true);
        windowDimensions = mockWindowDimensionsChange(INITIAL_WINDOW_SIZE);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('gives the screen back to the accessibility tree while its Activity is still hidden', async () => {
        const {rerender} = render(<WrappedScreen isScreenBlurred={false} />);
        flushFirstRenderFrame();
        rerender(<WrappedScreen isScreenBlurred />);
        expect(isDeprioritized()).toBe(true);

        rerender(<WrappedScreen isScreenBlurred={false} />);

        // This is the whole point: the user is already looking at the screen, so it has to be usable now, even
        // though its updates only arrive when the transition ends.
        expect(isDeprioritized()).toBe(true);
        expect(isInAccessibilityTree()).toBe(true);

        await completeRevealTransition();

        expect(isDeprioritized()).toBe(false);
    });

    it('takes the screen out of the accessibility tree in the same commit that covers it', () => {
        const {rerender} = render(<WrappedScreen isScreenBlurred={false} />);
        flushFirstRenderFrame();

        rerender(<WrappedScreen isScreenBlurred />);

        expect(isInAccessibilityTree()).toBe(false);
    });

    it('takes a screen out of the accessibility tree when its whole navigator loses focus', () => {
        const {rerender} = render(<WrappedScreen isScreenBlurred={false} />);
        flushFirstRenderFrame();

        mockIsFocused.mockReturnValue(false);
        rerender(<WrappedScreen isScreenBlurred={false} />);

        expect(isInAccessibilityTree()).toBe(false);
    });

    it('keeps a covered screen out of the accessibility tree even while a resize reveals its Activity', () => {
        const {rerender} = render(<WrappedScreen isScreenBlurred={false} />);
        flushFirstRenderFrame();
        rerender(<WrappedScreen isScreenBlurred />);
        expect(isDeprioritized()).toBe(true);

        // A resize unhides every covered screen so it can lay itself out, which must not hand it back to the user.
        act(() => {
            windowDimensions.emit(buildWindowSize(1200, 900));
        });

        expect(isDeprioritized()).toBe(false);
        expect(isInAccessibilityTree()).toBe(false);
    });
});
