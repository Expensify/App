import {act, render} from '@testing-library/react-native';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type * as ReanimatedModule from 'react-native-reanimated';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// The callback has to run, or the pulse the entry animation schedules on completion is never reached.
jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock'),
    scheduleOnRN: jest.fn((callback: (...args: unknown[]) => void, ...args: unknown[]) => callback(...args)),
}));

// Distinct from the pulse durations, so a reveal is told apart from the pulse's own timings.
const ENTRY_DURATION = 111;
const PULSE_START_DURATION = 222;
const PULSE_END_DURATION = 333;

const {scheduleOnRN: scheduleOnRNMock} = jest.requireMock<{scheduleOnRN: jest.Mock}>('react-native-worklets');
const reanimated = jest.requireMock<typeof ReanimatedModule>('react-native-reanimated');
const timingSpy = jest.spyOn(reanimated, 'withTiming');
const sequenceSpy = jest.spyOn(reanimated, 'withSequence');

// The entry is the only animation passing a completion callback, a reveal the only bare timing at the entry duration, and the pulse the only sequence.
const entryPlays = () => timingSpy.mock.calls.filter(([, , onFinished]) => !!onFinished).length;
const revealPlays = () => timingSpy.mock.calls.filter(([, config, onFinished]) => !onFinished && config?.duration === ENTRY_DURATION).length;
const pulsePlays = () => sequenceSpy.mock.calls.length;

type HarnessParamList = {
    A: undefined;
    B: undefined;
};

const Stack = createPlatformStackNavigator<HarnessParamList>();
const navigationRef = createNavigationContainerRef<HarnessParamList>();

function Harness({shouldHighlight}: {shouldHighlight: boolean}) {
    useAnimatedHighlightStyle({
        shouldHighlight,
        itemEnterDuration: ENTRY_DURATION,
        highlightStartDuration: PULSE_START_DURATION,
        highlightEndDuration: PULSE_END_DURATION,
    });
    return null;
}

function EmptyScreen() {
    return null;
}

function renderHarness(shouldHighlight: boolean) {
    const buildTree = (highlight: boolean) => (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
                <Stack.Screen name="A">{() => <Harness shouldHighlight={highlight} />}</Stack.Screen>
                <Stack.Screen
                    name="B"
                    component={EmptyScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
    const utils = render(buildTree(shouldHighlight));
    return {
        ...utils,
        setShouldHighlight: (highlight: boolean) => utils.rerender(buildTree(highlight)),
    };
}

describe('useAnimatedHighlightStyle', () => {
    beforeEach(() => {
        scheduleOnRNMock.mockImplementation((callback: (...args: unknown[]) => void, ...args: unknown[]) => callback(...args));
        timingSpy.mockClear();
        sequenceSpy.mockClear();
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayoutOnWideRHP: true});
    });

    it('plays the entry and its pulse immediately when the screen is focused', () => {
        renderHarness(true);
        expect(entryPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);
        expect(revealPlays()).toBe(0);
    });

    it('reveals a covered row immediately and defers only its pulse until the screen regains focus, then never replays', () => {
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        expect(revealPlays()).toBe(1);
        expect(entryPlays()).toBe(0);
        expect(pulsePlays()).toBe(0);

        act(() => {
            navigationRef.goBack();
        });
        expect(pulsePlays()).toBe(1);
        expect(revealPlays()).toBe(1);
        expect(entryPlays()).toBe(0);

        act(() => {
            navigationRef.navigate('B');
        });
        act(() => {
            navigationRef.goBack();
        });
        expect(pulsePlays()).toBe(1);
    });

    it('plays in the background on a wide pane even while unfocused', () => {
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayoutOnWideRHP: false});
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        expect(entryPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);

        act(() => {
            navigationRef.goBack();
        });
        expect(entryPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);
    });

    it('does not pulse when the highlight is cleared before the screen regains focus', () => {
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        setShouldHighlight(false);

        act(() => {
            navigationRef.goBack();
        });
        expect(revealPlays()).toBe(1);
        expect(pulsePlays()).toBe(0);
    });

    it('does not replay the entry when the pane turns wide while a revealed row is still waiting for focus', () => {
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        expect(revealPlays()).toBe(1);

        // ScreenWrapper publishes the wide-RHP flag a commit after the width is registered, so the effect re-runs on an already revealed row.
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayoutOnWideRHP: false});
        setShouldHighlight(true);
        expect(revealPlays()).toBe(1);
        expect(entryPlays()).toBe(0);
        expect(pulsePlays()).toBe(1);
    });

    it('reveals but does not play a row whose highlight was cleared before the screen transition ended', () => {
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: false, shouldUseNarrowLayoutOnWideRHP: true});
        const {setShouldHighlight} = renderHarness(true);
        expect(entryPlays()).toBe(0);

        setShouldHighlight(false);
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayoutOnWideRHP: true});
        setShouldHighlight(false);
        expect(entryPlays()).toBe(0);
        expect(pulsePlays()).toBe(0);
        expect(revealPlays()).toBe(1);
    });

    it('does not replay while the highlight stays on, but plays again after it turns off and back on', () => {
        const {setShouldHighlight} = renderHarness(true);
        expect(entryPlays()).toBe(1);

        setShouldHighlight(true);
        expect(entryPlays()).toBe(1);

        setShouldHighlight(false);
        setShouldHighlight(true);
        expect(entryPlays()).toBe(2);
    });

    it('waits for the screen transition to end before playing', () => {
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: false, shouldUseNarrowLayoutOnWideRHP: true});
        const {setShouldHighlight} = renderHarness(true);
        expect(entryPlays()).toBe(0);

        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayoutOnWideRHP: true});
        setShouldHighlight(true);
        expect(entryPlays()).toBe(1);
    });

    it('does not pulse a row whose highlight was retracted while the entry was still playing', () => {
        const queued: Array<() => void> = [];
        scheduleOnRNMock.mockImplementation((callback: () => void) => {
            queued.push(callback);
        });
        const flush = () => {
            for (const callback of queued.splice(0)) {
                callback();
            }
        };

        const {setShouldHighlight} = renderHarness(true);
        flush();
        expect(entryPlays()).toBe(1);
        expect(pulsePlays()).toBe(0);

        setShouldHighlight(false);
        flush();

        expect(pulsePlays()).toBe(0);
    });
});
