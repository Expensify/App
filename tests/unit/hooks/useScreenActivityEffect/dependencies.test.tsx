import {render} from '@testing-library/react-native';

import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import React, {useEffectEvent, useLayoutEffect, useRef, useState} from 'react';

import {ActivityScreen, drainLog, hidden, LiveScreen, log, resetLog, runEveryConfig, settle, track, useAnyEffect, visible} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * The hook leaves the dependency comparison to React, which runs its insertion effect for a change and not for a reveal,
 * so a reveal tells a dependency change that landed while the screen was hidden from the same work coming back by what
 * the insertion effect recorded. These tests hold that to what useEffect does with the same dependency list.
 */

/** The mount-once effect, whose logged name comes from a value it reads without declaring it. */
function MountOnce({value}: {value: string}) {
    useAnyEffect(track(`s:${value}`), []);
    return null;
}

/** An effect that depends on a number, so a test can compare how the two hooks tell two numbers apart. */
function NumericDependency({dependency}: {dependency: number}) {
    useAnyEffect(track('s:a'), [dependency]);
    return null;
}

/** Two call sites whose dependency list holds a fresh object, which makes every render a change for both. */
function EveryRender({value}: {value: string}) {
    useAnyEffect(track(`first:${value}`), [{}]);
    useAnyEffect(track(`second:${value}`), [{}]);
    return null;
}

/** An effect that seeds its own component from its body, which is what makes a mount run two commits long. */
function StateWriter({value}: {value: string}) {
    const [step, setStep] = useState(0);
    useAnyEffect(() => {
        log(`setup:s:${value}(${step})`);
        if (step === 0) {
            setStep(1);
        }
        return () => log(`cleanup:s:${value}(${step})`);
    }, [step, value]);
    return null;
}

const eventListeners = new Set<() => void>();

function emitEvent() {
    for (const listener of eventListeners) {
        listener();
    }
}

/** A listener kept with an empty dependency list that reads the value through an effect event and through a ref a layout effect writes. */
function LatestValueReader({value}: {value: string}) {
    const readEvent = useEffectEvent(() => log(`event:${value}`));
    const layoutRef = useRef(value);
    useLayoutEffect(() => {
        layoutRef.current = value;
    });
    useScreenActivityEffect(() => {
        const listener = () => {
            readEvent();
            log(`layoutRef:${layoutRef.current}`);
        };
        eventListeners.add(listener);
        return () => {
            eventListeners.delete(listener);
        };
    }, []);
    return null;
}

describe('useScreenActivityEffect dependencies', () => {
    beforeEach(() => {
        resetLog();
    });

    it('compares the dependencies with Object.is, exactly as useEffect does', async () => {
        // Given the two values whose identity is not their equality: NaN is itself, and minus zero is not zero
        const steps = [
            visible(<NumericDependency dependency={Number.NaN} />),
            hidden(<NumericDependency dependency={Number.NaN} />),
            visible(<NumericDependency dependency={Number.NaN} />),
            visible(<NumericDependency dependency={0} />),
            visible(<NumericDependency dependency={-0} />),
        ];

        // When the screen is covered and revealed with NaN, and the dependency then goes to zero and minus zero
        const runs = await runEveryConfig(steps);

        // Then the reveal treats NaN as unchanged and the two zeros as a change, which is what React does
        const expected = [['setup:s:a'], [], [], ['cleanup:s:a', 'setup:s:a'], ['cleanup:s:a', 'setup:s:a'], ['cleanup:s:a']];
        expect(runs.liveUseEffect).toEqual(expected);
        expect(runs.activityScreenActivityEffect).toEqual(expected);
    });

    it('coalesces dependencies that change on every render into one run per reveal', async () => {
        // Given two call sites whose dependency list holds a fresh object, so every render is a change
        const steps = [visible(<EveryRender value="a" />), hidden(<EveryRender value="a" />), hidden(<EveryRender value="a" />), visible(<EveryRender value="a" />)];

        // When two renders happen while the screen is covered
        const runs = await runEveryConfig(steps);

        // Then a live screen runs both call sites for every one of those renders
        expect(runs.liveUseEffect).toEqual([
            ['setup:first:a', 'setup:second:a'],
            ['cleanup:first:a', 'cleanup:second:a', 'setup:first:a', 'setup:second:a'],
            ['cleanup:first:a', 'cleanup:second:a', 'setup:first:a', 'setup:second:a'],
            ['cleanup:first:a', 'cleanup:second:a', 'setup:first:a', 'setup:second:a'],
            ['cleanup:first:a', 'cleanup:second:a'],
        ]);

        // And the covered screen ran no effect for them, so the reveal is one release and one setup per call site,
        // each call site swapping at its own place, because the body of a call site is what releases its old setup
        expect(runs.activityScreenActivityEffect).toEqual([
            ['setup:first:a', 'setup:second:a'],
            [],
            [],
            ['cleanup:first:a', 'setup:first:a', 'cleanup:second:a', 'setup:second:a'],
            ['cleanup:first:a', 'cleanup:second:a'],
        ]);
    });

    it('keeps the values the surviving setup captured, exactly as the live screen does', async () => {
        // Given a mount-once effect reading a value that changes twice while the screen is covered
        const steps = [visible(<MountOnce value="first" />), hidden(<MountOnce value="second" />), visible(<MountOnce value="third" />)];

        // When the screen is revealed
        const runs = await runEveryConfig(steps);

        // Then the setup still holds the value of the render it ran for, because its body never ran again
        const expected = [['setup:s:first'], [], [], ['cleanup:s:first']];
        expect(runs.liveUseEffect).toEqual(expected);
        expect(runs.activityScreenActivityEffect).toEqual(expected);
    });

    it.each([
        {screenName: 'a live screen', Screen: LiveScreen, layoutRefValue: 'b'},
        {screenName: 'a covered screen', Screen: ActivityScreen, layoutRefValue: 'a'},
    ])('lets a kept listener read the latest value through useEffectEvent on $screenName', async ({Screen, layoutRefValue}) => {
        // Given a listener kept with an empty dependency list, which is how a subscription that must survive a cover is written
        const {rerender, unmount} = render(
            <Screen isHidden={false}>
                <LatestValueReader value="a" />
            </Screen>,
        );
        await settle();

        // When the value changes while the screen is covered and the event fires before any reveal
        rerender(
            <Screen isHidden>
                <LatestValueReader value="b" />
            </Screen>,
        );
        await settle();
        emitEvent();

        // Then the effect event reads the new value on both screens, because React updates it in a hidden subtree too,
        // while the ref keeps the old value behind a cover, because no layout effect runs there
        expect(drainLog()).toEqual(['event:b', `layoutRef:${layoutRefValue}`]);
        unmount();
    });

    it('runs a state update from the effect body once, exactly as the live screen does', async () => {
        // Given an effect that seeds its component from its own body, so its mount takes two commits
        const steps = [visible(<StateWriter value="a" />), hidden(<StateWriter value="a" />), visible(<StateWriter value="a" />)];

        // When the screen is covered and revealed after the seeding is done
        const runs = await runEveryConfig(steps);

        // Then the reveal does not seed a second time, because the dependency of the live setup is the state it wrote
        const expected = [['setup:s:a(0)', 'cleanup:s:a(0)', 'setup:s:a(1)'], [], [], ['cleanup:s:a(1)']];
        expect(runs.liveUseEffect).toEqual(expected);
        expect(runs.activityScreenActivityEffect).toEqual(expected);
    });
});
