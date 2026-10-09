import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import React, {useEffect} from 'react';

import {
    ActivityScreen,
    expectEveryConfigToMatch,
    hidden,
    leaf,
    Leaf,
    LiveScreen,
    log,
    resetLog,
    runEveryConfig,
    runOn,
    Subject,
    track,
    useAnyEffect,
    visible,
} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * Every test here renders one structure on useEffect and on useScreenActivityEffect, once on a screen that stays live
 * in the background and once on a screen wrapped in an <Activity>, and compares the effect calls commit by commit. The
 * last commit of every scenario is the screen leaving the navigation stack, so every test also covers the teardown.
 *
 * runs.liveUseEffect is the baseline the hook is written to reproduce, and runs.activityUseEffect is what an effect of
 * a covered screen gets today, which is what the hook exists to avoid.
 */

/** A setup that returns nothing, so a release of it is something no log can show. */
function WithoutCleanup({value}: {value: string}) {
    useAnyEffect(() => log(`setup:s:${value}`), [value]);
    return null;
}

/** Two components with an effect each, where the second can go away without the first one remounting with it. */
function Siblings({value, hasSecond = true}: {value: string; hasSecond?: boolean}) {
    return (
        <>
            <Subject
                name="s1"
                value={value}
            />
            {hasSecond ? (
                <Subject
                    name="s2"
                    value={value}
                />
            ) : null}
        </>
    );
}

/** A parent with an effect of its own around a child with one, which is the smallest tree React orders. */
function Parent({value}: {value: string}) {
    useAnyEffect(track(`parent:${value}`), [value]);
    return (
        <Subject
            name="child"
            value={value}
        />
    );
}

let setupCount = 0;

/** A subject whose calls name the setup they came from, so a release can be tied to the instance that owns it. */
function CountedSubject({value}: {value: string}) {
    useAnyEffect(() => {
        setupCount += 1;
        const name = `s${setupCount}:${value}`;
        log(`setup:${name}`);
        return () => log(`cleanup:${name}`);
    }, [value]);
    return null;
}

/** Two call sites in one component, of which only the second depends on the value. */
function Pair({value}: {value: string}) {
    useAnyEffect(track('first:a'), []);
    useAnyEffect(track(`second:${value}`), [value]);
    return null;
}

describe('useScreenActivityEffect compared to useEffect', () => {
    beforeEach(() => {
        resetLog();
    });

    describe('a screen that never hides', () => {
        it('runs the same calls through a mount, a dependency change, a removal and a remount', async () => {
            // Given one effect on a screen that is never covered, which is what most of the app renders
            const steps = [visible(<Subject value="a" />), visible(<Subject value="b" />), visible(null), visible(<Subject value="c" />)];

            // When the dependency changes, the component goes away, and a new one takes its place
            const runs = await runEveryConfig(steps);

            // Then the hook is useEffect, because every release ran from the passive cleanup React still held
            expectEveryConfigToMatch(runs, [['setup:s:a'], ['cleanup:s:a', 'setup:s:b'], ['cleanup:s:b'], ['setup:s:c'], ['cleanup:s:c']]);
        });

        it('runs the same calls in the same order for two sibling components', async () => {
            // Given two components with an effect each, so the calls of one can be told from the calls of the other
            const steps = [visible(<Siblings value="a" />), visible(<Siblings value="b" />), visible(null)];

            // When the dependency of both changes and both are then removed
            const runs = await runEveryConfig(steps);

            // Then both release before either sets up again, because that is the order of the phases of one commit
            expectEveryConfigToMatch(runs, [['setup:s1:a', 'setup:s2:a'], ['cleanup:s1:a', 'cleanup:s2:a', 'setup:s1:b', 'setup:s2:b'], ['cleanup:s1:b', 'cleanup:s2:b'], []]);
        });

        it('runs the same calls in the same order for a parent and its child', async () => {
            // Given a parent and a child that both have an effect, which is how a screen is really built
            const steps = [visible(<Parent value="a" />), visible(<Parent value="b" />), visible(null)];

            // When the dependency of both changes and the whole subtree is then removed
            const runs = await runEveryConfig(steps);

            // Then the child sets up first and the parent releases first, because React mounts up and tears down down
            expectEveryConfigToMatch(runs, [
                ['setup:child:a', 'setup:parent:a'],
                ['cleanup:child:a', 'cleanup:parent:a', 'setup:child:b', 'setup:parent:b'],
                ['cleanup:parent:b', 'cleanup:child:b'],
                [],
            ]);
        });
    });

    describe('a cover and a reveal', () => {
        it('keeps the setup live through a cover and reveal cycle, exactly as the live screen does', async () => {
            // Given an effect holding something the screen still needs while another screen is on top of it
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

            // When the screen is covered, revealed again, and finally leaves the stack
            const runs = await runEveryConfig(steps);

            // Then the cover and the reveal run nothing at all, which is what the screen that stays live does
            const expected = [['setup:s:a'], [], [], ['cleanup:s:a']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);

            // And plain useEffect releases on the cover and acquires again on the reveal, which is the churn to avoid
            expect(runs.activityUseEffect).toEqual([['setup:s:a'], ['cleanup:s:a'], ['setup:s:a'], ['cleanup:s:a']]);
        });

        it('keeps the setup live through two cover and reveal cycles', async () => {
            // Given an effect on a screen the user leaves and comes back to twice, which a stack does all the time
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

            // When the screen goes through two full cover and reveal cycles
            const runs = await runEveryConfig(steps);

            // Then nothing accumulates, because a reveal with nothing owed leaves the entry alone
            const expected = [['setup:s:a'], [], [], [], [], ['cleanup:s:a']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('keeps a setup that returned no cleanup live through a cover and reveal cycle', async () => {
            // Given an effect that returns nothing, so running its body twice is the only thing that can be seen
            const steps = [visible(<WithoutCleanup value="a" />), hidden(<WithoutCleanup value="a" />), visible(<WithoutCleanup value="a" />)];

            // When the screen is covered and revealed again
            const runs = await runEveryConfig(steps);

            // Then the body runs once, because the entry counts as set up even with no cleanup to keep
            const expected = [['setup:s:a'], [], [], []];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('runs the cleanup when the screen leaves the stack while it is still covered', async () => {
            // Given an effect on a screen that is popped from under the screen covering it, which a deep link does
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />)];

            // When the screen leaves the stack without ever being revealed
            const runs = await runEveryConfig(steps);

            // Then the hook releases right after the commit that deleted the hidden screen, so nothing is left behind
            const expected = [['setup:s:a'], [], ['cleanup:s:a']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('runs a dependency change that lands together with the reveal in that same commit', async () => {
            // Given an effect whose dependency changes in the very commit that reveals the screen
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="b" />)];

            // When the screen is revealed with the new dependency
            const runs = await runEveryConfig(steps);

            // Then the reveal releases the old setup and runs the new one, because the dependencies really did change
            const expected = [['setup:s:a'], [], ['cleanup:s:a', 'setup:s:b'], ['cleanup:s:b']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('runs a dependency change that landed while the screen was hidden on the reveal', async () => {
            // Given an effect whose dependency changes while the screen is covered, which Onyx does behind the cover
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), hidden(<Subject value="b" />), visible(<Subject value="b" />)];

            // When the screen is revealed after the change
            const runs = await runEveryConfig(steps);
            expect(runs.liveUseEffect).toEqual([['setup:s:a'], [], ['cleanup:s:a', 'setup:s:b'], [], ['cleanup:s:b']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);

            // Then the same calls run in the same order, moved from the commit of the change to the commit of the
            // reveal, because the old setup stays live until a body can release it
            expect(runs.activityScreenActivityEffect).toEqual([['setup:s:a'], [], [], ['cleanup:s:a', 'setup:s:b'], ['cleanup:s:b']]);
        });

        it('runs a dependency change that lands together with the cover on the reveal', async () => {
            // Given an effect whose dependency changes in the very commit that covers the screen
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="b" />), visible(<Subject value="b" />)];

            // When the screen is covered with the new dependency and revealed later
            const runs = await runEveryConfig(steps);

            // Then the change is not lost, only deferred: React commits the hide first and the update of the hidden
            // tree after it, so this is a change behind the cover, and the old setup survives the cover
            expect(runs.liveUseEffect).toEqual([['setup:s:a'], ['cleanup:s:a', 'setup:s:b'], [], ['cleanup:s:b']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);
            expect(runs.activityScreenActivityEffect).toEqual([['setup:s:a'], [], ['cleanup:s:a', 'setup:s:b'], ['cleanup:s:b']]);
        });

        it('runs the setup of a component mounted while the screen was hidden on the reveal, as plain useEffect does', async () => {
            // Given a component that appears while the screen is already covered
            const steps = [visible(null), hidden(null), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

            // When the screen is revealed
            const runs = await runEveryConfig(steps);
            expect(runs.liveUseEffect).toEqual([[], [], ['setup:s:a'], [], ['cleanup:s:a']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);

            // Then the setup waits for the reveal, and that deferral is the <Activity> rather than the hook
            const deferred = [[], [], [], ['setup:s:a'], ['cleanup:s:a']];
            expect(runs.activityScreenActivityEffect).toEqual(deferred);
            expect(runs.activityUseEffect).toEqual(deferred);
        });

        it('runs the setup of a screen that mounted hidden on the reveal, as plain useEffect does', async () => {
            // Given a screen that mounts under another one, which is what a pre-mounted destination does
            const steps = [hidden(<Subject value="a" />), visible(<Subject value="a" />)];

            // When the screen is revealed
            const runs = await runEveryConfig(steps);

            // Then its mount effects run on the reveal, which is why the wrapper keeps the first frame visible
            expect(runs.liveUseEffect).toEqual([['setup:s:a'], [], ['cleanup:s:a']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);
            const deferred = [[], ['setup:s:a'], ['cleanup:s:a']];
            expect(runs.activityScreenActivityEffect).toEqual(deferred);
            expect(runs.activityUseEffect).toEqual(deferred);
        });

        it('never runs a component that mounted and was removed while the screen was hidden, as plain useEffect does', async () => {
            // Given a component that appears and goes away again entirely behind the cover
            const steps = [visible(null), hidden(null), hidden(<Subject value="a" />), hidden(null), visible(null)];

            // When the screen is revealed after it is gone
            const runs = await runEveryConfig(steps);

            // Then nothing ran at all, because a hidden subtree never mounted its effects in the first place
            expect(runs.liveUseEffect).toEqual([[], [], ['setup:s:a'], ['cleanup:s:a'], [], []]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);
            const emptyCommits = [[], [], [], [], [], []];
            expect(runs.activityScreenActivityEffect).toEqual(emptyCommits);
            expect(runs.activityUseEffect).toEqual(emptyCommits);
        });
    });

    describe('removing the component', () => {
        it('runs the cleanup at once after a cover and reveal cycle', async () => {
            // Given a component that survived a cover, so the reveal connected its passive cleanup again
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />), visible(null)];

            // When the component is removed after the reveal
            const runs = await runEveryConfig(steps);

            // Then it still releases at once, from the passive cleanup the reveal gave back to React
            const expected = [['setup:s:a'], [], [], ['cleanup:s:a'], []];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('runs the cleanup right after the commit when the removal lands together with the reveal', async () => {
            // Given a component that is removed in the very commit that reveals the screen, next to one that stays
            const steps = [
                visible(<Siblings value="a" />),
                hidden(<Siblings value="a" />),
                visible(
                    <Siblings
                        value="a"
                        hasSecond={false}
                    />,
                ),
            ];

            // When the screen is revealed without it
            const runs = await runEveryConfig(steps);

            // Then the release lands in that same step, because the removed component had no passive cleanup to run
            // and the hook releases it once the commit is over
            const expected = [['setup:s1:a', 'setup:s2:a'], [], ['cleanup:s2:a'], ['cleanup:s1:a']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('releases a component removed while hidden right after that commit, exactly as the live screen does', async () => {
            // Given the only effect of the screen going away behind the cover, and a component mounting afterwards from
            // state inside the screen, so that commit renders nothing above the leaf
            const steps = [
                visible(
                    <Leaf>
                        <Subject value="a" />
                    </Leaf>,
                ),
                hidden(
                    <Leaf>
                        <Subject value="a" />
                    </Leaf>,
                ),
                hidden(<Leaf>{null}</Leaf>),
                visible(<Leaf>{null}</Leaf>),
                leaf(<Subject value="b" />),
            ];

            // When the component goes away behind the cover, the screen is revealed, and another one mounts on it
            const runs = await runEveryConfig(steps);

            // Then the release lands in the commit of the removal, because the insertion cleanup of the removal is
            // followed by no mount of the call site, and the component that mounts afterwards sets up as usual
            const expected = [['setup:s:a'], [], ['cleanup:s:a'], [], ['setup:s:b'], ['cleanup:s:b']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);

            // And plain useEffect released it at the cover already, which is the churn the hook avoids
            expect(runs.activityUseEffect).toEqual([['setup:s:a'], ['cleanup:s:a'], [], [], ['setup:s:b'], ['cleanup:s:b']]);
        });

        it('leaves nothing behind for a component that mounts and goes away between two reveals that ran no effect', async () => {
            // Given a component mounted and removed from the leaf between two cover and reveal cycles of an empty screen
            const steps = [
                visible(<Leaf>{null}</Leaf>),
                hidden(<Leaf>{null}</Leaf>),
                visible(<Leaf>{null}</Leaf>),
                leaf(<Subject value="a" />),
                leaf(null),
                hidden(<Leaf>{null}</Leaf>),
                visible(<Leaf>{null}</Leaf>),
            ];

            // When the screen goes through the second cover and reveal
            const runs = await runEveryConfig(steps);

            // Then the second reveal runs nothing, because the removed component left no setup behind
            expectEveryConfigToMatch(runs, [[], [], [], ['setup:s:a'], ['cleanup:s:a'], [], [], []]);
        });

        it('leaves the sibling that stayed alive untouched when one of two is removed while hidden', async () => {
            // Given two components behind a cover, of which only one goes away
            const steps = [
                visible(<Siblings value="a" />),
                hidden(<Siblings value="a" />),
                hidden(
                    <Siblings
                        value="a"
                        hasSecond={false}
                    />,
                ),
                visible(
                    <Siblings
                        value="a"
                        hasSecond={false}
                    />,
                ),
            ];

            // When the screen is revealed with only the surviving one on it
            const runs = await runEveryConfig(steps);

            // Then only the component that is gone is released, in the commit that removed it
            const expected = [['setup:s1:a', 'setup:s2:a'], [], ['cleanup:s2:a'], [], ['cleanup:s1:a']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });
    });

    describe('the order of the effect calls', () => {
        it('re-runs only the call site whose dependencies changed while the screen was hidden', async () => {
            // Given a component with a mount-once effect next to one that depends on a value that changes behind the cover
            const steps = [visible(<Pair value="a" />), hidden(<Pair value="a" />), hidden(<Pair value="b" />), visible(<Pair value="b" />)];

            // When the screen is revealed after the change
            const runs = await runEveryConfig(steps);

            // Then the mount-once call site is left alone, because the reveal finds nothing owed for it
            expect(runs.liveUseEffect).toEqual([['setup:first:a', 'setup:second:a'], [], ['cleanup:second:a', 'setup:second:b'], [], ['cleanup:first:a', 'cleanup:second:b']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);
            expect(runs.activityScreenActivityEffect).toEqual([['setup:first:a', 'setup:second:a'], [], [], ['cleanup:second:a', 'setup:second:b'], ['cleanup:first:a', 'cleanup:second:b']]);
        });

        it('swaps each sibling at its own place on a reveal that re-runs both', async () => {
            // Given two siblings whose dependency changes behind the cover, so the reveal has to re-run both
            const steps = [visible(<Siblings value="a" />), hidden(<Siblings value="a" />), hidden(<Siblings value="b" />), visible(<Siblings value="b" />)];

            // When the screen is revealed
            const runs = await runEveryConfig(steps);

            // Then a live screen releases both siblings before it sets either of them up again
            expect(runs.liveUseEffect).toEqual([['setup:s1:a', 'setup:s2:a'], [], ['cleanup:s1:a', 'cleanup:s2:a', 'setup:s1:b', 'setup:s2:b'], [], ['cleanup:s1:b', 'cleanup:s2:b']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);

            // And the reveal runs the body of each call site in turn, which releases and sets up in one go, so the
            // first sibling acquires before the second released. A single-owner resource shared by two call sites of
            // one screen is held twice for that moment, which is the one order the hook cannot reproduce.
            expect(runs.activityScreenActivityEffect).toEqual([
                ['setup:s1:a', 'setup:s2:a'],
                [],
                [],
                ['cleanup:s1:a', 'setup:s1:b', 'cleanup:s2:a', 'setup:s2:b'],
                ['cleanup:s1:b', 'cleanup:s2:b'],
            ]);
        });

        it('swaps the child before the parent on a reveal that re-runs both', async () => {
            // Given a parent and a child whose shared dependency changes behind the cover
            const steps = [visible(<Parent value="a" />), hidden(<Parent value="a" />), hidden(<Parent value="b" />), visible(<Parent value="b" />)];

            // When the screen is revealed
            const runs = await runEveryConfig(steps);

            // Then the reveal runs the bodies from the child up, exactly as the setups of a live commit run, with the
            // release of each call site right before its own setup
            expect(runs.liveUseEffect).toEqual([
                ['setup:child:a', 'setup:parent:a'],
                [],
                ['cleanup:child:a', 'cleanup:parent:a', 'setup:child:b', 'setup:parent:b'],
                [],
                ['cleanup:parent:b', 'cleanup:child:b'],
            ]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);
            expect(runs.activityScreenActivityEffect).toEqual([
                ['setup:child:a', 'setup:parent:a'],
                [],
                [],
                ['cleanup:child:a', 'setup:child:b', 'cleanup:parent:a', 'setup:parent:b'],
                ['cleanup:parent:b', 'cleanup:child:b'],
            ]);
        });

        it('releases nothing on a cover where plain useEffect releases a whole subtree from the parent down', async () => {
            // Given a parent and a child on a screen that gets covered, which is a hide rather than a deletion
            const steps = [visible(<Parent value="a" />), hidden(<Parent value="a" />)];

            // When the screen is covered and then leaves the stack while still covered
            const runs = await runEveryConfig(steps);

            // Then the live screen keeps everything through the cover, with the hook and useEffect alike
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);

            // And plain useEffect gets the teardown of the whole subtree on the cover, parent first
            expect(runs.activityUseEffect).toEqual([['setup:child:a', 'setup:parent:a'], ['cleanup:parent:a', 'cleanup:child:a'], []]);

            // And the hook gets it once, when the screen really goes away, in the order React deletes the tree in
            expect(runs.activityScreenActivityEffect).toEqual([['setup:child:a', 'setup:parent:a'], [], ['cleanup:parent:a', 'cleanup:child:a']]);
        });

        it('releases in tree order when a sibling was added in front of another, exactly as the live screen does', async () => {
            // Given a component that is added in front of one that is already mounted, so the two orders differ
            const steps = [
                visible([
                    <Subject
                        key="s2"
                        name="s2"
                        value="a"
                    />,
                ]),
                visible([
                    <Subject
                        key="s1"
                        name="s1"
                        value="a"
                    />,
                    <Subject
                        key="s2"
                        name="s2"
                        value="a"
                    />,
                ]),
            ];

            // When the screen leaves the navigation stack with both on it
            const runs = await runEveryConfig(steps);

            // Then React releases in tree order, which puts the one added last first, and the hook follows because every
            // cleanup of a visible screen runs at its own place
            expectEveryConfigToMatch(runs, [['setup:s2:a'], ['setup:s1:a'], ['cleanup:s1:a', 'cleanup:s2:a']]);
        });

        it('releases the sibling that went away first in its own commit, and the other when the screen leaves the stack covered', async () => {
            // Given one of two siblings removed behind the cover of a screen that is then popped without a reveal
            const steps = [
                visible(<Siblings value="a" />),
                hidden(<Siblings value="a" />),
                hidden(
                    <Siblings
                        value="a"
                        hasSecond={false}
                    />,
                ),
            ];

            // When the screen leaves the stack while still covered
            const runs = await runEveryConfig(steps);

            // Then each release lands in the commit of its own removal, which is exactly what the live screen does
            const expected = [['setup:s1:a', 'setup:s2:a'], [], ['cleanup:s2:a'], ['cleanup:s1:a']];
            expect(runs.liveUseEffect).toEqual(expected);
            expect(runs.liveScreenActivityEffect).toEqual(expected);
            expect(runs.activityScreenActivityEffect).toEqual(expected);
        });

        it('releases the instance removed while the screen was hidden before the new one mounts, exactly as the live screen does', async () => {
            // Given a component that is removed and mounted again entirely behind the cover, which a remount is, with
            // every call naming the setup it belongs to so that a release cannot be read as the wrong instance
            const steps = [
                visible(<CountedSubject value="a" />),
                hidden(<CountedSubject value="a" />),
                hidden(null),
                hidden(<CountedSubject value="a" />),
                visible(<CountedSubject value="a" />),
            ];

            // When the screen is revealed
            setupCount = 0;
            const live = await runOn(useEffect, LiveScreen, steps);
            setupCount = 0;
            const activity = await runOn(useScreenActivityEffect, ActivityScreen, steps);

            // Then the instance that went away is released in its own commit, and the reveal sets the new one up, so a
            // single-owner resource is never held by two instances at once
            expect(live).toEqual([['setup:s1:a'], [], ['cleanup:s1:a'], ['setup:s2:a'], [], ['cleanup:s2:a']]);
            expect(activity).toEqual([['setup:s1:a'], [], ['cleanup:s1:a'], [], ['setup:s2:a'], ['cleanup:s2:a']]);
        });
    });

    it('releases a replaced instance before setting up its replacement in the reveal commit', async () => {
        // Given an instance replaced by one with another key in the commit that reveals the screen
        const steps = [
            visible(
                <Subject
                    key="old"
                    value="old"
                />,
            ),
            hidden(
                <Subject
                    key="old"
                    value="old"
                />,
            ),
            visible(
                <Subject
                    key="new"
                    value="new"
                />,
            ),
        ];

        // When the screen is revealed with the replacement
        const runs = await runEveryConfig(steps);

        // Then the old instance is released before the new one sets up, exactly as on a live screen, so a single-owner
        // resource passes from one to the other
        expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);
        expect(runs.activityScreenActivityEffect).toEqual(runs.liveUseEffect);
        expect(runs.activityScreenActivityEffect).toEqual([['setup:s:old'], [], ['cleanup:s:old', 'setup:s:new'], ['cleanup:s:new']]);
    });

    describe('what a cover cannot reproduce', () => {
        it('coalesces a dependency change that was undone before the reveal into one run', async () => {
            // Given a dependency that changes and changes back while the screen is covered
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />), hidden(<Subject value="b" />), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

            // When the screen is revealed with the dependency it was covered with
            const runs = await runEveryConfig(steps);

            // Then a live screen ran the effect for the value nobody ever saw
            expect(runs.liveUseEffect).toEqual([['setup:s:a'], [], ['cleanup:s:a', 'setup:s:b'], ['cleanup:s:b', 'setup:s:a'], [], ['cleanup:s:a']]);
            expect(runs.liveScreenActivityEffect).toEqual(runs.liveUseEffect);

            // And the hook ran it once on the reveal, because React compares the dependencies render to render, so the
            // change and its undoing both count as one, not against the setup that is live
            expect(runs.activityScreenActivityEffect).toEqual([['setup:s:a'], [], [], [], ['cleanup:s:a', 'setup:s:a'], ['cleanup:s:a']]);
        });
    });
});
