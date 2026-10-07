import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ComponentType} from 'react';

import React, {useEffect, useRef} from 'react';

import type {RenderStep, ScreenProps, Step} from '../../../utils/ScreenActivityEffectTestUtils';

import {ActivityScreen, hidden, isLeafStep, KeptEffect, leaf, Leaf, LiveScreen, log, PlainEffect, record, resetLog, track, visible} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * A screen that is being migrated runs both hooks at once, either in one component or across its components, so these
 * tests cover what a cover does to a subtree where only some of the effects are meant to survive it. The calls named
 * 'plain' come from useEffect and churn on every cover and reveal, and the ones named 'kept' do not.
 */

/** One component on both hooks, which is what a component looks like halfway through a migration. */
function MixedEffects({value}: {value: string}) {
    useEffect(() => track(`plain:${value}`)(), [value]);
    useScreenActivityEffect(() => track(`kept:${value}`)(), [value]);
    return null;
}

/** The two hooks as siblings instead, which is what a screen looks like halfway through a migration. */
function MixedSiblings({value}: {value: string}) {
    return (
        <>
            <PlainEffect value={value} />
            <KeptEffect value={value} />
        </>
    );
}

/** The trap of a migration halfway: the kept setup stores its resource in a ref that the plain cleanup clears, the way an isMountedRef is. */
function SharedRef() {
    const resourceRef = useRef<string | null>(null);
    useScreenActivityEffect(() => {
        resourceRef.current = 'resource';
        log('open');
        return () => {
            log(resourceRef.current === null ? 'close skipped' : 'close');
            resourceRef.current = null;
        };
    }, []);
    useEffect(
        () => () => {
            resourceRef.current = null;
            log('clear');
        },
        [],
    );
    return null;
}

/** The steps on the given screen, because the components above pick their hook themselves. */
function recordOn(Screen: ComponentType<ScreenProps>, steps: readonly Step[]): Promise<string[][]> {
    const screen = (step: RenderStep) => <Screen isHidden={step.isHidden}>{step.children}</Screen>;
    return record(steps.map((step) => (isLeafStep(step) ? step : screen(step))));
}

/** The steps on a screen wrapped in an <Activity>. */
function recordCovered(steps: readonly Step[]): Promise<string[][]> {
    return recordOn(ActivityScreen, steps);
}

describe('useScreenActivityEffect mixed with useEffect', () => {
    beforeEach(() => {
        resetLog();
    });

    it('releases only the useEffect call site on a cover and sets only that one up again on a reveal', async () => {
        // Given a component whose two effects differ only in the hook they were written with
        const steps = [visible(<MixedEffects value="a" />), hidden(<MixedEffects value="a" />), visible(<MixedEffects value="a" />)];

        // When the screen is covered, revealed, and finally leaves the stack
        const commits = await recordCovered(steps);

        // Then the cover and the reveal only ever touch the plain effect, and the pop releases both in tree order
        expect(commits).toEqual([['setup:plain:a', 'setup:kept:a'], ['cleanup:plain:a'], ['setup:plain:a'], ['cleanup:plain:a', 'cleanup:kept:a']]);
    });

    it('runs a dependency change that landed while hidden on the reveal for both call sites', async () => {
        // Given the same component, with its dependency changing behind the cover
        const steps = [visible(<MixedEffects value="a" />), hidden(<MixedEffects value="a" />), hidden(<MixedEffects value="b" />), visible(<MixedEffects value="b" />)];

        // When the screen is revealed
        const commits = await recordCovered(steps);

        // Then both end up live for the new dependency, the plain one by mounting and the kept one by re-running
        expect(commits).toEqual([['setup:plain:a', 'setup:kept:a'], ['cleanup:plain:a'], [], ['setup:plain:b', 'cleanup:kept:a', 'setup:kept:b'], ['cleanup:plain:b', 'cleanup:kept:b']]);
    });

    it('releases the kept call site of a component removed while hidden right after that commit', async () => {
        // Given a component that goes away behind the cover, so only one of its two effects is still held
        const steps = [
            visible(
                <Leaf>
                    <MixedEffects value="a" />
                </Leaf>,
            ),
            hidden(
                <Leaf>
                    <MixedEffects value="a" />
                </Leaf>,
            ),
            hidden(<Leaf>{null}</Leaf>),
            visible(<Leaf>{null}</Leaf>),
            leaf(<MixedEffects value="b" />),
        ];

        // When the screen is revealed empty and another component mounts on it afterwards from state inside the screen
        const commits = await recordCovered(steps);

        // Then the kept call site the cover left alone is released once the commit of the removal is over, the reveal
        // has nothing left to do, and the mount that follows sets both effects up
        expect(commits).toEqual([['setup:plain:a', 'setup:kept:a'], ['cleanup:plain:a'], ['cleanup:kept:a'], [], ['setup:plain:b', 'setup:kept:b'], ['cleanup:plain:b', 'cleanup:kept:b']]);
    });

    it('releases a kept call site removed while hidden before a reveal that runs plain effects only', async () => {
        // Given a mixed screen whose last kept call site is removed behind the cover while a plain sibling remains
        const steps = [visible(<MixedSiblings value="a" />), hidden(<MixedSiblings value="a" />), hidden(<PlainEffect value="a" />), visible(<PlainEffect value="a" />)];

        // When the plain sibling runs its setup on the reveal and no kept call site runs at all
        const commits = await recordCovered(steps);

        // Then the removed setup was released in the commit of the removal, so the reveal is the plain setup alone
        expect(commits).toEqual([['setup:plain:a', 'setup:kept:a'], ['cleanup:plain:a'], ['cleanup:kept:a'], ['setup:plain:a'], ['cleanup:plain:a']]);
    });

    it('releases the kept call site when the screen leaves the stack while it is still covered', async () => {
        // Given a covered screen that is popped without ever being revealed
        const steps = [visible(<MixedEffects value="a" />), hidden(<MixedEffects value="a" />)];

        // When the screen leaves the navigation stack
        const commits = await recordCovered(steps);

        // Then the deletion of the hidden screen runs the one cleanup the cover skipped, right after the commit
        expect(commits).toEqual([['setup:plain:a', 'setup:kept:a'], ['cleanup:plain:a'], ['cleanup:kept:a']]);
    });

    it('skips the release of a resource the plain cleanup cleared on the cover, where a live screen closes it', async () => {
        // Given a component whose kept cleanup reads the resource from a ref a plain cleanup clears
        const steps = [
            visible(
                <Leaf>
                    <SharedRef />
                </Leaf>,
            ),
            hidden(
                <Leaf>
                    <SharedRef />
                </Leaf>,
            ),
            hidden(<Leaf>{null}</Leaf>),
        ];

        // When the component is removed behind the cover, and the same happens on a screen that stays live
        const covered = await recordCovered(steps);
        resetLog();
        const live = await recordOn(LiveScreen, steps);

        // Then the live screen runs both cleanups in the removal, the kept one first, while the cover already cleared
        // the ref, so the release of the hidden removal finds nothing to close
        expect(live).toEqual([['open'], [], ['close', 'clear'], []]);
        expect(covered).toEqual([['open'], ['clear'], ['close skipped'], []]);
    });

    it('does not care whether the two hooks sit in one component or in two', async () => {
        // Given the two hooks in one component, and then the very same two as siblings
        const cycle = (Subjects: ComponentType<{value: string}>) => [visible(<Subjects value="a" />), hidden(<Subjects value="a" />), visible(<Subjects value="a" />)];

        // When both screens go through a cover and reveal cycle and then leave the stack
        const oneComponent = await recordCovered(cycle(MixedEffects));
        resetLog();
        const twoComponents = await recordCovered(cycle(MixedSiblings));

        // Then the calls match, because the hook holds one entry per call site rather than per component
        expect(twoComponents).toEqual(oneComponent);
    });
});
