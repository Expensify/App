import {render} from '@testing-library/react-native';

import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ComponentType, ReactNode} from 'react';

import React, {useEffect} from 'react';

import type {AnyEffectHook, RenderStep, ScreenProps} from '../../../utils/ScreenActivityEffectTestUtils';

import {
    ActivityScreen,
    AnyEffectHookProvider,
    drainLog,
    hidden,
    leaf,
    Leaf,
    LiveScreen,
    record,
    resetLog,
    runOn,
    settle,
    Subject,
    visible,
} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * A screen of a nested navigator sits inside the <Activity> of the screen holding it, so its effects can be hidden by
 * either. The hook answers to no screen, so these tests hold a nested screen to what a flat one does, and two screens
 * next to each other to what two live screens do.
 */

/** The screen of a nested navigator, where the <Activity> of the screen holding it is the one that hides. */
function OuterHiddenNestedScreen({isHidden: isOuterHidden, children}: ScreenProps) {
    return (
        <ActivityScreen isHidden={isOuterHidden}>
            <ActivityScreen isHidden={false}>{children}</ActivityScreen>
        </ActivityScreen>
    );
}

/** The same nesting, where the <Activity> of the screen itself is the one that hides. */
function InnerHiddenNestedScreen({isHidden: isInnerHidden, children}: ScreenProps) {
    return (
        <ActivityScreen isHidden={false}>
            <ActivityScreen isHidden={isInnerHidden}>{children}</ActivityScreen>
        </ActivityScreen>
    );
}

/** Two independently covered screens, which is the state overlapping navigator transitions put them in. */
function overlappingNestedScreen(isOuterHidden: boolean, isInnerHidden: boolean) {
    return (
        <AnyEffectHookProvider hook={useScreenActivityEffect}>
            <ActivityScreen isHidden={isOuterHidden}>
                <ActivityScreen isHidden={isInnerHidden}>
                    <Subject value="a" />
                </ActivityScreen>
            </ActivityScreen>
        </AnyEffectHookProvider>
    );
}

/** One step of two screens next to each other, where a null step means the screen has left the navigation stack. */
type StackStep = [RenderStep | null, RenderStep | null];

/** Two screens of one navigator next to each other, put through the steps as pairs of a left and a right step. */
async function runStack(hook: AnyEffectHook, Screen: ComponentType<ScreenProps>, steps: readonly StackStep[]): Promise<string[][]> {
    const screen = (step: RenderStep | null) => (step === null ? null : <Screen isHidden={step.isHidden}>{step.children}</Screen>);
    const stack = ([left, right]: StackStep) => (
        <AnyEffectHookProvider hook={hook}>
            {screen(left)}
            {screen(right)}
        </AnyEffectHookProvider>
    );
    const [first, ...rest] = steps;
    if (first === undefined) {
        throw new Error('The first step has to render both screens.');
    }
    resetLog();
    const {rerender, unmount} = render(stack(first));
    await settle();
    const commits = [drainLog()];

    for (const step of rest) {
        rerender(stack(step));
        await settle();
        commits.push(drainLog());
    }

    unmount();
    await settle();
    commits.push(drainLog());
    return commits;
}

describe('useScreenActivityEffect on nested screens', () => {
    beforeEach(() => {
        resetLog();
    });

    describe('a second screen next to it', () => {
        it('keeps two screens of one navigator independent', async () => {
            // Given two screens of one navigator, each with its own screen of the behavior under test
            const steps: StackStep[] = [
                [visible(<Subject value="left" />), visible(<Subject value="right" />)],
                [hidden(<Subject value="left" />), visible(<Subject value="right" />)],
                [hidden(<Subject value="left" />), visible(null)],
                [visible(<Subject value="left" />), visible(null)],
            ];

            // When the left screen is covered and a component of the visible right screen then goes away
            // Then the cover of one screen defers nothing of the other, because each call site answers for itself alone
            expect(await runStack(useScreenActivityEffect, ActivityScreen, steps)).toEqual([['setup:s:left', 'setup:s:right'], [], ['cleanup:s:right'], [], ['cleanup:s:left']]);

            // And that is what two screens that both stay live in the background do
            expect(await runStack(useEffect, LiveScreen, steps)).toEqual(await runStack(useScreenActivityEffect, ActivityScreen, steps));
        });

        it('releases a covered screen that leaves the stack before a body of the other screen sets up', async () => {
            // Given a covered left screen popped in the commit that mounts a component on the visible right screen
            const steps: StackStep[] = [
                [visible(<Subject value="left" />), visible(null)],
                [hidden(<Subject value="left" />), visible(null)],
                [null, visible(<Subject value="right" />)],
            ];

            // When both changes land in one commit
            const activity = await runStack(useScreenActivityEffect, ActivityScreen, steps);
            const live = await runStack(useEffect, LiveScreen, steps);

            // Then the body of the right screen drains the queued release before its own setup, exactly as a live
            // screen runs every cleanup of a commit before any setup
            expect(live).toEqual([['setup:s:left'], [], ['cleanup:s:left', 'setup:s:right'], ['cleanup:s:right']]);
            expect(activity).toEqual(live);
        });
    });

    describe('a screen nested inside another screen', () => {
        const coverAndReveal = [visible(<Subject value="a" />), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

        it('keeps the setup when the screen holding the nested one hides', async () => {
            // Given a screen of a nested navigator, whose <Activity> sits inside the <Activity> of the screen holding it
            // When the outer screen is covered and revealed
            const nested = await runOn(useScreenActivityEffect, OuterHiddenNestedScreen, coverAndReveal);

            // Then the setup survives, because the hide reaches the hook as a passive cleanup with nothing owed
            expect(nested).toEqual(await runOn(useEffect, LiveScreen, coverAndReveal));
        });

        it('releases the setup when the screen holding the nested one leaves the stack while covered', async () => {
            // Given a nested screen whose outer screen is popped without ever being revealed again
            const steps = [visible(<Subject value="a" />), hidden(<Subject value="a" />)];

            // When the outer screen leaves the navigation stack
            const nested = await runOn(useScreenActivityEffect, OuterHiddenNestedScreen, steps);

            // Then the deletion of the hidden tree releases the whole nested screen once the commit is over
            const expected = [['setup:s:a'], [], ['cleanup:s:a']];
            expect(nested).toEqual(expected);
            expect(await runOn(useEffect, LiveScreen, steps)).toEqual(expected);
        });

        it('releases a component of the nested screen removed while the outer screen was hidden, exactly as a live screen does', async () => {
            // Given two components on a nested screen, of which one goes away while the outer screen is covered
            const both = (
                <>
                    <Subject value="a" />
                    <Subject value="b" />
                </>
            );
            const steps = [visible(both), hidden(both), hidden(<Subject value="a" />), visible(<Subject value="a" />)];

            // When the component is removed and the outer screen is revealed afterwards
            const nested = await runOn(useScreenActivityEffect, OuterHiddenNestedScreen, steps);
            const live = await runOn(useEffect, LiveScreen, steps);

            // Then the release lands in the commit of the removal, exactly as it does on a screen of its own
            expect(live).toEqual([['setup:s:a', 'setup:s:b'], [], ['cleanup:s:b'], [], ['cleanup:s:a']]);
            expect(nested).toEqual(live);
        });

        it('releases a nested screen removed while the screen holding it was hidden, exactly as a live screen does', async () => {
            // Given a nested screen that goes away as a whole behind the cover, on an outer screen with an effect
            const content = (hasNested: boolean) => (
                <>
                    <Subject value="outer" />
                    {hasNested ? (
                        <ActivityScreen isHidden={false}>
                            <Subject value="a" />
                        </ActivityScreen>
                    ) : null}
                </>
            );
            const steps = [visible(content(true)), hidden(content(true)), hidden(content(false)), visible(content(false))];

            // When the nested screen is removed and the outer screen is revealed without it
            const removed = await runOn(useScreenActivityEffect, ActivityScreen, steps);
            const live = await runOn(useEffect, LiveScreen, steps);

            // Then the deletion of the nested <Activity> releases its effect once the commit is over
            expect(live).toEqual([['setup:s:outer', 'setup:s:a'], [], ['cleanup:s:a'], [], ['cleanup:s:outer']]);
            expect(removed).toEqual(live);
        });

        it('releases a nested screen removed while hidden before a fresh nested screen mounts', async () => {
            // Given a nested screen removed behind the cover and a new one mounting after a reveal that ran no effect
            const nested = (children: ReactNode) => <ActivityScreen isHidden={false}>{children}</ActivityScreen>;
            const steps = [
                visible(<Leaf>{nested(<Subject value="a" />)}</Leaf>),
                hidden(<Leaf>{nested(<Subject value="a" />)}</Leaf>),
                hidden(<Leaf>{null}</Leaf>),
                visible(<Leaf>{null}</Leaf>),
                leaf(nested(<Subject value="b" />)),
            ];

            // When the new nested screen mounts from state inside the outer screen
            const removed = await runOn(useScreenActivityEffect, ActivityScreen, steps);
            const live = await runOn(useEffect, LiveScreen, steps);

            // Then the old one was released in the commit of its removal, and the new subtree sets up with nothing pending
            expect(live).toEqual([['setup:s:a'], [], ['cleanup:s:a'], [], ['setup:s:b'], ['cleanup:s:b']]);
            expect(removed).toEqual(live);
        });

        it('keeps the setup live when the <Activity> of the nested screen itself hides', async () => {
            // Given the same nesting, with the screen holding the nested one staying visible
            // When the nested screen is covered by a screen of its own navigator and revealed again
            const nested = await runOn(useScreenActivityEffect, InnerHiddenNestedScreen, coverAndReveal);

            // Then the setup survives exactly as on a flat screen
            expect(nested).toEqual(await runOn(useEffect, LiveScreen, coverAndReveal));
        });

        it('keeps the setup live when the covers of the outer and inner screens overlap', async () => {
            // Given two nested screens which can each be covered while the other one is already hidden
            const innerFirst = [
                overlappingNestedScreen(false, false),
                overlappingNestedScreen(false, true),
                overlappingNestedScreen(true, true),
                overlappingNestedScreen(false, true),
                overlappingNestedScreen(false, false),
            ];
            const outerFirst = [
                overlappingNestedScreen(false, false),
                overlappingNestedScreen(true, false),
                overlappingNestedScreen(true, true),
                overlappingNestedScreen(false, true),
                overlappingNestedScreen(false, false),
            ];

            // When the outer cover starts before or after the inner one and both screens are eventually revealed
            const innerFirstCalls = await record(innerFirst);
            resetLog();
            const outerFirstCalls = await record(outerFirst);

            // Then one setup stays alive until the outer screen leaves the stack, in both orders
            const expected = [['setup:s:a'], [], [], [], [], ['cleanup:s:a']];
            expect(innerFirstCalls).toEqual(expected);
            expect(outerFirstCalls).toEqual(expected);
        });
    });
});
