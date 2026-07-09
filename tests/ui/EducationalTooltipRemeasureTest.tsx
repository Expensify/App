import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import {DeviceEventEmitter, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {...actual, useIsFocused: () => true};
});

const INITIAL_METRICS = {
    frame: {x: 0, y: 0, width: 411, height: 914},
    insets: {top: 24, left: 0, right: 0, bottom: 24},
};

/** A stand-in for the native view the tooltip measures, reporting whatever position we tell it to. */
function createTarget(x: number) {
    return {
        measureInWindow: jest.fn((callback: (x: number, y: number, width: number, height: number) => void) => {
            callback(x, 300, 70, 28);
        }),
    };
}

function layoutEvent(target: ReturnType<typeof createTarget>) {
    return {target, nativeEvent: {layout: {x: 0, y: 300, width: 70, height: 28}, target}};
}

function renderTooltip(shouldHideOnScroll = false) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
                <PortalProvider>
                    <EducationalTooltip
                        shouldRender
                        shouldHideOnScroll={shouldHideOnScroll}
                        renderTooltipContent={() => <View />}
                    >
                        <View testID="anchor" />
                    </EducationalTooltip>
                </PortalProvider>
            </SafeAreaProvider>
        </ComposeProviders>,
    );
}

/** Drive the tooltip through its first display so it is measured and shown. */
function displayTooltip(anchor: ReturnType<typeof screen.getByTestId>, target: ReturnType<typeof createTarget>) {
    fireEvent(anchor, 'layout', layoutEvent(target));
    act(() => {
        jest.advanceTimersByTime(CONST.TOOLTIP_ANIMATION_DURATION + 1);
    });
}

describe('EducationalTooltip', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('should re-measure the wrapped component when it is laid out again', () => {
        renderTooltip();
        const anchor = screen.getByTestId('anchor');

        // First layout: the tooltip measures and displays against the initial position.
        const initialTarget = createTarget(270);
        fireEvent(anchor, 'layout', layoutEvent(initialTarget));
        act(() => {
            jest.advanceTimersByTime(CONST.TOOLTIP_ANIMATION_DURATION + 1);
        });

        expect(initialTarget.measureInWindow).toHaveBeenCalled();

        // The wrapped component moves (as it does mid-rotation) and is laid out again. The tooltip
        // has to measure the new position, otherwise it stays anchored to where the component was.
        const movedTarget = createTarget(218);
        fireEvent(anchor, 'layout', layoutEvent(movedTarget));

        expect(movedTarget.measureInWindow).toHaveBeenCalled();
    });

    it('should not measure on the very first layout until the display timer elapses', () => {
        renderTooltip();
        const anchor = screen.getByTestId('anchor');

        const target = createTarget(270);
        fireEvent(anchor, 'layout', layoutEvent(target));

        // Nothing has displayed yet, so the delayed onLayout path still owns the first measurement.
        expect(target.measureInWindow).not.toHaveBeenCalled();
    });

    describe('when shouldHideOnScroll is set', () => {
        it('should not measure while the page is scrolling, since the tooltip is hidden', () => {
            renderTooltip(true);
            const target = createTarget(270);
            displayTooltip(screen.getByTestId('anchor'), target);
            target.measureInWindow.mockClear();

            act(() => {
                DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
            });

            expect(target.measureInWindow).not.toHaveBeenCalled();
        });

        it('should re-measure once scrolling stops, so the tooltip follows the anchor or hides', () => {
            renderTooltip(true);
            const target = createTarget(270);
            displayTooltip(screen.getByTestId('anchor'), target);
            target.measureInWindow.mockClear();

            act(() => {
                DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
            });

            expect(target.measureInWindow).toHaveBeenCalled();
        });
    });
});
