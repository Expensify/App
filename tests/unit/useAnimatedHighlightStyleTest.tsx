import {render} from '@testing-library/react-native';

import ScreenVisibilityProvider from '@components/ScreenWrapper/ScreenVisibilityProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';

import type * as ReanimatedModule from 'react-native-reanimated';

import React, {useEffect} from 'react';

// Runs the callback, or the pulse scheduled when the entry finishes never plays.
jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock'),
    scheduleOnRN: jest.fn((callback: (...args: unknown[]) => void, ...args: unknown[]) => callback(...args)),
}));

// Distinct from the pulse durations, so a reveal can be told apart.
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

let harnessRenders = 0;

function Harness({shouldHighlight, highlightKey}: {shouldHighlight: boolean; highlightKey: string | undefined}) {
    useAnimatedHighlightStyle({
        shouldHighlight,
        highlightKey,
        itemEnterDuration: ENTRY_DURATION,
        highlightStartDuration: PULSE_START_DURATION,
        highlightEndDuration: PULSE_END_DURATION,
    });
    useEffect(() => {
        harnessRenders += 1;
    });
    return null;
}

type HarnessState = {
    shouldHighlight: boolean;
    highlightKey: string | null;
    isScreenVisible: boolean;
    didScreenTransitionEnd: boolean;
    isRowMounted: boolean;
};

let setScreenVisible: (isVisible: boolean) => void = () => {};

const cover = () => setScreenVisible(false);
const uncover = () => setScreenVisible(true);

/** `highlightKey: null` asks for a keyless row, since `undefined` would take the default. */
function renderHarness(shouldHighlight: boolean, {highlightKey = 'row-A', didScreenTransitionEnd = true}: Partial<Pick<HarnessState, 'highlightKey' | 'didScreenTransitionEnd'>> = {}) {
    let state: HarnessState = {shouldHighlight, highlightKey, isScreenVisible: true, didScreenTransitionEnd, isRowMounted: true};
    const buildRow = () => (
        <Harness
            shouldHighlight={state.shouldHighlight}
            highlightKey={state.highlightKey ?? undefined}
        />
    );
    const buildStatus = () => ({didScreenTransitionEnd: state.didScreenTransitionEnd, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false});
    let row = buildRow();
    let status = buildStatus();
    const buildTree = () => (
        <ScreenWrapperStatusContext.Provider value={status}>
            <ScreenVisibilityProvider isVisible={state.isScreenVisible}>{state.isRowMounted && row}</ScreenVisibilityProvider>
        </ScreenWrapperStatusContext.Provider>
    );
    const utils = render(buildTree());

    // Rebuilt only when a parent would re-render the row, so otherwise it re-renders only for what it reads.
    const update = (change: Partial<HarnessState>, {shouldRerenderRow}: {shouldRerenderRow: boolean}) => {
        state = {...state, ...change};
        if (shouldRerenderRow) {
            row = buildRow();
        }
        if (change.didScreenTransitionEnd !== undefined) {
            status = buildStatus();
        }
        utils.rerender(buildTree());
    };
    setScreenVisible = (isVisible) => update({isScreenVisible: isVisible}, {shouldRerenderRow: false});

    return {
        setShouldHighlight: (highlight: boolean) => update({shouldHighlight: highlight}, {shouldRerenderRow: true}),
        recycleInto: (key: string, highlight = false) => update({highlightKey: key, shouldHighlight: highlight}, {shouldRerenderRow: true}),
        endTransition: () => update({didScreenTransitionEnd: true}, {shouldRerenderRow: false}),
        unmountRow: () => update({isRowMounted: false}, {shouldRerenderRow: false}),
        uncoverAndRecycleInto: (key: string) => update({isScreenVisible: true, highlightKey: key, shouldHighlight: false}, {shouldRerenderRow: true}),
        coverAndAskToHighlight: () => update({isScreenVisible: false, shouldHighlight: true}, {shouldRerenderRow: true}),
        coverAndMountHighlighted: () => update({isScreenVisible: false, isRowMounted: true, shouldHighlight: true}, {shouldRerenderRow: true}),
    };
}

describe('useAnimatedHighlightStyle', () => {
    beforeEach(() => {
        scheduleOnRNMock.mockImplementation((callback: (...args: unknown[]) => void, ...args: unknown[]) => callback(...args));
        timingSpy.mockClear();
        sequenceSpy.mockClear();
        harnessRenders = 0;
    });

    it('plays the entry and its pulse immediately when the screen can be seen', () => {
        // Given a row asked to highlight on a screen the user can see
        // When it renders
        renderHarness(true);

        // Then it fades in and pulses right away, with nothing held back
        expect(entryPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);
        expect(revealPlays()).toBe(0);
    });

    it('reveals a covered row immediately and defers only its pulse until the screen is uncovered, then never replays', () => {
        // Given a row on a screen that another screen covers
        const {setShouldHighlight} = renderHarness(false);
        cover();

        // When the row is asked to highlight while covered
        setShouldHighlight(true);

        // Then it is shown at once, since the screen may never be uncovered, but its pulse waits
        expect(revealPlays()).toBe(1);
        expect(entryPlays()).toBe(0);
        expect(pulsePlays()).toBe(0);

        // When the screen is uncovered
        uncover();

        // Then the row pulses where the user can see it, without being revealed again
        expect(pulsePlays()).toBe(1);
        expect(revealPlays()).toBe(1);
        expect(entryPlays()).toBe(0);

        // When the screen is covered and uncovered again
        cover();
        uncover();

        // Then the row does not pulse a second time
        expect(pulsePlays()).toBe(1);
    });

    it('still pulses on return when the highlight was cleared while the row was covered, since the row is unchanged', () => {
        // Given a row on a screen that another screen covers
        const {setShouldHighlight} = renderHarness(false);
        cover();

        // When the highlight is asked for and retracted while covered, as a one-render caller or a lapsed window does
        setShouldHighlight(true);
        setShouldHighlight(false);

        // Then the row still pulses on return, since it still shows the item the play was for
        uncover();
        expect(revealPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);
    });

    it('pulses a keyless row on return, since a caller that always shows the same thing cannot be recycled into another', () => {
        // Given a keyless row, like a menu row, covered by another screen
        const {setShouldHighlight} = renderHarness(false, {highlightKey: null});
        cover();

        // When the highlight is asked for a single render while the row is covered
        setShouldHighlight(true);
        setShouldHighlight(false);
        expect(pulsePlays()).toBe(0);

        // Then the play it owes survives to the return, since no key changed
        uncover();
        expect(revealPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);
    });

    it('does not pulse on return when the list recycled the row into another item while it was covered', () => {
        // Given a row asked to highlight while its screen is covered
        const {setShouldHighlight, recycleInto} = renderHarness(false);
        cover();
        setShouldHighlight(true);

        // When the list reuses the row for another item before the screen is uncovered
        recycleInto('row-B');

        // Then nothing pulses on return, since the row no longer shows the item that was added
        uncover();
        expect(pulsePlays()).toBe(0);
    });

    it('does not reveal a covered row twice, however often it re-renders before it is uncovered', () => {
        // Given a row revealed under a cover and waiting to pulse
        const {setShouldHighlight} = renderHarness(false);
        cover();
        setShouldHighlight(true);
        expect(revealPlays()).toBe(1);

        // When it re-renders while still covered, with the highlight turned off and back on
        setShouldHighlight(false);
        setShouldHighlight(true);

        // Then it is not revealed again and still waits to pulse
        expect(revealPlays()).toBe(1);
        expect(entryPlays()).toBe(0);
        expect(pulsePlays()).toBe(0);

        // When the screen is uncovered
        uncover();

        // Then the row only pulses, since it is already showing
        expect(entryPlays()).toBe(0);
        expect(pulsePlays()).toBe(1);
    });

    it('plays once the screen transition ends, even though the highlight was cleared while the play was waiting', () => {
        // Given a row asked to highlight while its screen is still transitioning in
        const {setShouldHighlight, endTransition} = renderHarness(true, {didScreenTransitionEnd: false});
        expect(entryPlays()).toBe(0);

        // When a one-render caller, like a field appearing on the confirmation page, retracts it before the transition ends
        setShouldHighlight(false);
        endTransition();

        // Then the row still plays, since the request was not lost to the wait
        expect(entryPlays()).toBe(1);
        expect(pulsePlays()).toBe(1);
    });

    it('does not replay while the highlight stays on, but plays again after it turns off and back on', () => {
        // Given a row that has played its highlight
        const {setShouldHighlight} = renderHarness(true);
        expect(entryPlays()).toBe(1);

        // When it re-renders with the highlight still on
        setShouldHighlight(true);

        // Then it does not play again
        expect(entryPlays()).toBe(1);

        // When the highlight turns off and back on
        setShouldHighlight(false);
        setShouldHighlight(true);

        // Then it plays again, since that is a new request
        expect(entryPlays()).toBe(2);
    });

    it('waits for the screen transition to end before playing', () => {
        // Given a row asked to highlight on a screen still transitioning in, which has not played yet
        const {endTransition} = renderHarness(true, {didScreenTransitionEnd: false});
        expect(entryPlays()).toBe(0);

        // When the transition ends
        endTransition();

        // Then the row plays, now that the screen has settled
        expect(entryPlays()).toBe(1);
    });

    it('pulses a row whose highlight was retracted while the entry was still playing, because the row is the one it was armed for', () => {
        // Given a row whose entry is still playing, with the pulse it schedules held until flushed
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

        // When the highlight is retracted and then the entry finishes
        setShouldHighlight(false);
        flush();

        // Then the row pulses, since it still shows the item the play was for
        expect(pulsePlays()).toBe(1);
    });

    it('plays for a row the list recycled it into that is also new, since asking never stopped but the row changed', () => {
        // Given a new row that has had its play
        const {recycleInto} = renderHarness(true);
        expect(pulsePlays()).toBe(1);

        // When the list reuses this instance for another new row, so the highlight is never retracted
        recycleInto('row-B', true);

        // Then the new row gets its own play
        expect(pulsePlays()).toBe(2);
        expect(entryPlays()).toBe(2);
    });

    it('does not pulse a row the list recycled into another item while the entry was still playing', () => {
        // Given a row whose entry is still playing, with the pulse it schedules held until flushed
        const queued: Array<() => void> = [];
        scheduleOnRNMock.mockImplementation((callback: () => void) => {
            queued.push(callback);
        });
        const flush = () => {
            for (const callback of queued.splice(0)) {
                callback();
            }
        };

        const {recycleInto} = renderHarness(true);
        flush();
        expect(entryPlays()).toBe(1);

        // When the list reuses the row for another item and then the entry finishes
        recycleInto('row-B');
        flush();

        // Then it does not pulse, since the row no longer shows the item that was added
        expect(pulsePlays()).toBe(0);
    });

    it('does not re-render a row when its screen is covered or uncovered', () => {
        // Given a row with nothing to play, like nearly every row
        renderHarness(false);
        const rendersBeforeCover = harnessRenders;

        // When a panel covers the screen and then closes
        cover();
        uncover();

        // Then the row does not re-render
        expect(harnessRenders).toBe(rendersBeforeCover);
    });

    it('does not pulse a row that unmounted while it waited for the screen to be uncovered', () => {
        // Given a row revealed under a cover, waiting to pulse
        const {setShouldHighlight, unmountRow} = renderHarness(false);
        cover();
        setShouldHighlight(true);

        // When the row unmounts and the screen is then uncovered
        unmountRow();
        uncover();

        // Then nothing pulses, since the row the pulse was owed to is gone
        expect(pulsePlays()).toBe(0);
    });

    it('does not pulse a row the list recycled into another item in the same update that uncovers the screen', () => {
        // Given a row revealed under a cover and waiting to pulse
        const {setShouldHighlight, uncoverAndRecycleInto} = renderHarness(false);
        cover();
        setShouldHighlight(true);
        expect(revealPlays()).toBe(1);

        // When a single update uncovers the screen and hands the row another item
        uncoverAndRecycleInto('row-B');

        // Then nothing pulses: the row dropped its wait before the screen was published as visible
        expect(pulsePlays()).toBe(0);
    });

    it('waits for the screen to be uncovered when a single update covers it and asks the row to highlight', () => {
        // Given a row on a screen the user can see
        const {coverAndAskToHighlight} = renderHarness(false);

        // When one update covers the screen and asks the row to highlight
        coverAndAskToHighlight();

        // Then the row is revealed but its pulse waits, since the screen was published as covered before the row acted
        expect(entryPlays()).toBe(0);
        expect(revealPlays()).toBe(1);
        expect(pulsePlays()).toBe(0);

        // When the screen is uncovered
        uncover();

        // Then the row pulses where the user can see it
        expect(pulsePlays()).toBe(1);
    });

    it('waits for the screen to be uncovered when a row mounts highlighted in the update that covers the screen', () => {
        // Given a screen the user can see, before the list renders the row for a new item
        const {unmountRow, coverAndMountHighlighted} = renderHarness(false);
        unmountRow();

        // When one update covers the screen and mounts the row already highlighted
        coverAndMountHighlighted();

        // Then the row is revealed but its pulse waits, rather than playing behind the cover
        expect(entryPlays()).toBe(0);
        expect(revealPlays()).toBe(1);
        expect(pulsePlays()).toBe(0);

        // When the screen is uncovered
        uncover();

        // Then the row pulses where the user can see it
        expect(pulsePlays()).toBe(1);
    });
});
