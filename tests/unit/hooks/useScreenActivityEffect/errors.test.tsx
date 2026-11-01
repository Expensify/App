import {render} from '@testing-library/react-native';

import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ComponentType} from 'react';

import React, {useEffect, useSyncExternalStore} from 'react';

import type {AnyEffectHook, RenderStep, ScreenProps} from '../../../utils/ScreenActivityEffectTestUtils';

import {
    ActivityScreen,
    AnyEffectHookProvider,
    drainLog,
    hidden,
    LiveScreen,
    log,
    resetLog,
    settle,
    Subject,
    track,
    useAnyEffect,
    visible,
} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * A release the hook runs from a passive cleanup throws where useEffect throws, through React. A release it runs
 * itself, once a commit is over or right before the setup of a reveal, has no commit to throw into, so the hook reports
 * the error and keeps going, and it has no commit to break either, so the cleanup may schedule an update. These tests
 * pin down both, for a cleanup that throws, for a setup that throws, and for a cleanup that sets state.
 */

type ThrowingProps = {name?: string; value?: string; throwsFor?: string};

/** An effect whose cleanup throws for one value, which is a screen effect with a bug in its own teardown. */
function ThrowingCleanup({name = 'throwing', value = 'a', throwsFor = 'a'}: ThrowingProps) {
    useAnyEffect(() => {
        log(`setup:${name}:${value}`);
        return () => {
            log(`cleanup:${name}:${value}`);
            if (value === throwsFor) {
                throw new Error(`cleanup of ${name}:${value} threw`);
            }
        };
    }, [value]);
    return null;
}

/** An effect whose setup throws for one value, which is a screen effect with a bug in the work it acquires. */
function ThrowingSetup({value = 'a', throwsFor = 'a'}: Omit<ThrowingProps, 'name'>) {
    useAnyEffect(() => {
        log(`setup:throwingSetup:${value}`);
        if (value === throwsFor) {
            throw new Error(`setup of throwingSetup:${value} threw`);
        }
        return () => log(`cleanup:throwingSetup:${value}`);
    }, [value]);
    return null;
}

/** A component that outlives the ones next to it, so a test can see whether a throw took the rest of the screen with it. */
function Survivor() {
    useAnyEffect(track('survivor:a'), []);
    return null;
}

/** A screen where the throwing cleanup and an ordinary one can go away together, leaving the survivor behind. */
function ThrowingScreenContent({hasThrowing = true}: {hasThrowing?: boolean}) {
    return (
        <>
            {hasThrowing ? <ThrowingCleanup /> : null}
            {hasThrowing ? <Subject value="a" /> : null}
            <Survivor />
        </>
    );
}

let storeValue = 0;
const listeners = new Set<() => void>();

/** A store one component reads and the cleanup of another writes, which is what a cleanup that resets shared state does. */
const store = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot: () => storeValue,
    set: (next: number) => {
        storeValue = next;
        for (const listener of listeners) {
            listener();
        }
    },
};

function Reader() {
    return <>{useSyncExternalStore(store.subscribe, store.getSnapshot)}</>;
}

function Writer() {
    useScreenActivityEffect(() => () => store.set(1), []);
    return null;
}

/** Records the steps and keeps going when one of them throws, which is what a cleanup that throws does to a commit. */
async function runCatching(hook: AnyEffectHook, Screen: ComponentType<ScreenProps>, steps: readonly RenderStep[]) {
    const tree = (step: RenderStep) => (
        <AnyEffectHookProvider hook={hook}>
            <Screen isHidden={step.isHidden}>{step.children}</Screen>
        </AnyEffectHookProvider>
    );

    const commits: string[][] = [];
    const errors: string[] = [];
    const runStep = async (step: () => void) => {
        try {
            step();
        } catch (error) {
            errors.push(String(error));
        }
        await settle();
        commits.push(drainLog());
    };

    // The mount is recorded like every other step, because a setup that throws throws out of the render itself.
    let controls: ReturnType<typeof render> | undefined;
    const [first, ...rest] = steps;
    await runStep(() => {
        controls = render(tree(first));
    });

    const rerenderStep = (step: RenderStep) => controls?.rerender(tree(step));
    for (const step of rest) {
        await runStep(() => rerenderStep(step));
    }
    await runStep(() => controls?.unmount());

    return {commits, errors};
}

/** The messages the hook reported instead of throwing, which is where an error of a release it ran itself ends up. */
function reportedMessages(reported: jest.SpiedFunction<typeof console.error>) {
    return reported.mock.calls.map((call) => String(call.at(0)));
}

describe('useScreenActivityEffect and an effect that throws', () => {
    let reported: jest.SpiedFunction<typeof console.error>;

    beforeEach(() => {
        resetLog();
        reported = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        reported.mockRestore();
    });

    describe('a cleanup that throws', () => {
        it('matches useEffect when a visible dependency change runs a cleanup that throws', async () => {
            // Given a setup whose cleanup throws, and a dependency change while the screen is visible
            const steps = [visible(<ThrowingCleanup value="a" />), visible(<ThrowingCleanup value="b" />)];

            // When the change runs on a live screen and on a screen wrapped in an <Activity>
            const live = await runCatching(useEffect, LiveScreen, steps);
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, steps);

            // Then the error reaches the boundary through React in both, because a visible cleanup is a passive cleanup
            expect(live.errors).toEqual(['Error: cleanup of throwing:a threw']);
            expect(activity.errors).toEqual(live.errors);
            expect(activity.commits).toEqual(live.commits);
        });

        it('reports a cleanup that throws on the release of a component removed while hidden and leaves the rest of the screen alone', async () => {
            // Given a throwing cleanup whose component goes away behind the cover, next to a component that stays
            const steps = [
                visible(<ThrowingScreenContent />),
                hidden(<ThrowingScreenContent />),
                hidden(<ThrowingScreenContent hasThrowing={false} />),
                visible(<ThrowingScreenContent hasThrowing={false} />),
            ];

            // When the component is removed and the screen is revealed afterwards
            const live = await runCatching(useEffect, LiveScreen, steps);
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, steps);

            // Then a destroy that throws through React takes the tree down with it, survivor included
            expect(live.commits).toEqual([
                ['setup:throwing:a', 'setup:s:a', 'setup:survivor:a'],
                [],
                ['cleanup:throwing:a', 'cleanup:s:a', 'cleanup:survivor:a'],
                ['setup:survivor:a'],
                ['cleanup:survivor:a'],
            ]);
            expect(live.errors).toEqual(['Error: cleanup of throwing:a threw']);

            // And the hook releases the removed components once the commit is over, reports the error, and the survivor
            // is never touched, because no commit is running for the error to take down
            expect(activity.commits).toEqual([['setup:throwing:a', 'setup:s:a', 'setup:survivor:a'], [], ['cleanup:throwing:a', 'cleanup:s:a'], [], ['cleanup:survivor:a']]);
            expect(activity.errors).toEqual([]);
            expect(reportedMessages(reported).filter((message) => message.includes('cleanup of throwing:a threw'))).toHaveLength(1);
        });

        it('reports a cleanup that throws on the reveal of a dependency change and still runs the setup that follows', async () => {
            // Given a setup whose cleanup throws next to an ordinary one, and a dependency change deferred until the reveal
            const content = (value: string) => (
                <>
                    <ThrowingCleanup value={value} />
                    <Subject value={value} />
                    <Survivor />
                </>
            );
            const liveSteps = [visible(content('a')), visible(content('b'))];
            const activitySteps = [visible(content('a')), hidden(content('a')), hidden(content('b')), visible(content('b'))];

            // When the same change runs on a live screen and on a screen whose previous setup survived the cover
            const live = await runCatching(useEffect, LiveScreen, liveSteps);
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, activitySteps);

            // Then plain useEffect runs the next setup before React takes the failed tree down
            expect(live.commits.flat()).toEqual([
                'setup:throwing:a',
                'setup:s:a',
                'setup:survivor:a',
                'cleanup:throwing:a',
                'cleanup:s:a',
                'setup:throwing:b',
                'setup:s:b',
                'cleanup:throwing:b',
                'cleanup:s:b',
                'cleanup:survivor:a',
            ]);
            expect(live.errors).toEqual(['Error: cleanup of throwing:a threw']);

            // And the body of the reveal reports the error of the release it ran and still runs its own setup, so the
            // screen stays up with every call site live for the new value
            expect(activity.commits).toEqual([
                ['setup:throwing:a', 'setup:s:a', 'setup:survivor:a'],
                [],
                [],
                ['cleanup:throwing:a', 'setup:throwing:b', 'cleanup:s:a', 'setup:s:b'],
                ['cleanup:throwing:b', 'cleanup:s:b', 'cleanup:survivor:a'],
            ]);
            expect(activity.errors).toEqual([]);
            expect(reportedMessages(reported).filter((message) => message.includes('cleanup of throwing:a threw'))).toHaveLength(1);
        });

        it('reports a hidden removal that throws before setting up its replacement', async () => {
            // Given a throwing cleanup removed behind the cover in the commit that reveals its replacement
            const steps = [
                visible(<ThrowingCleanup key="old" />),
                hidden(<ThrowingCleanup key="old" />),
                visible(
                    <Subject
                        key="new"
                        value="new"
                    />,
                ),
            ];

            // When the screen is revealed with the replacement
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, steps);

            // Then the body of the replacement reports the failed release before it runs its own setup
            expect(activity.commits).toEqual([['setup:throwing:a'], [], ['cleanup:throwing:a', 'setup:s:new'], ['cleanup:s:new']]);
            expect(activity.errors).toEqual([]);
            expect(reportedMessages(reported).filter((message) => message.includes('cleanup of throwing:a threw'))).toHaveLength(1);
        });
    });

    describe('two cleanups that throw at the teardown', () => {
        const content = (
            <>
                <ThrowingCleanup />
                <ThrowingCleanup name="second" />
                <Survivor />
            </>
        );

        it('fails exactly as the live screen does when the screen leaves the stack while visible', async () => {
            // Given a screen holding two cleanups that both throw when it leaves the stack
            const steps = [visible(content)];

            // When the screen leaves the navigation stack
            const live = await runCatching(useEffect, LiveScreen, steps);
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, steps);

            // Then every cleanup ran at its own place and React answers for the two failing destroys as it does on the
            // live screen, because a visible screen releases from its passive cleanups
            expect(activity.commits).toEqual([
                ['setup:throwing:a', 'setup:second:a', 'setup:survivor:a'],
                ['cleanup:throwing:a', 'cleanup:second:a', 'cleanup:survivor:a'],
            ]);
            expect(activity).toEqual(live);
        });

        it('reports every error when the screen leaves the stack while covered', async () => {
            // Given a covered screen holding two cleanups that both throw when it leaves the stack
            // When the screen leaves the navigation stack without a reveal
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, [visible(content), hidden(content)]);

            // Then every cleanup the cover skipped ran once the commit was over, and each error is reported on its own,
            // because each release runs in a task of its own and none can stop the others
            expect(activity.commits).toEqual([['setup:throwing:a', 'setup:second:a', 'setup:survivor:a'], [], ['cleanup:throwing:a', 'cleanup:second:a', 'cleanup:survivor:a']]);
            expect(activity.errors).toEqual([]);
            const messages = reportedMessages(reported);
            expect(messages.filter((message) => message.includes('cleanup of throwing:a threw'))).toHaveLength(1);
            expect(messages.filter((message) => message.includes('cleanup of second:a threw'))).toHaveLength(1);
        });
    });

    describe('a cleanup that schedules an update', () => {
        it('lets the release of a component removed while hidden set state, with no warning from React', async () => {
            // Given a cleanup that writes to a store another component reads, on a component removed behind the cover
            storeValue = 0;
            const tree = (isHidden: boolean, hasWriter: boolean) => (
                <>
                    <Reader />
                    <ActivityScreen isHidden={isHidden}>{hasWriter ? <Writer /> : null}</ActivityScreen>
                </>
            );
            const {rerender, unmount} = render(tree(false, true));
            rerender(tree(true, true));

            // When the component goes away behind the cover and the release runs once the commit is over
            rerender(tree(true, false));
            await settle();

            // Then the store got the value and React warned about nothing, because the release ran outside the
            // insertion cleanup that reported the removal, which must not schedule updates
            expect(storeValue).toBe(1);
            expect(reportedMessages(reported)).toEqual([]);
            unmount();
        });
    });

    describe('a setup that throws', () => {
        it('leaves nothing behind for the call site whose setup failed', async () => {
            // Given a screen whose first effect throws while it is acquiring what it needs
            const steps = [
                visible(
                    <>
                        <ThrowingSetup />
                        <Survivor />
                    </>,
                ),
            ];

            // When the screen mounts and then leaves the navigation stack
            const live = await runCatching(useEffect, LiveScreen, steps);
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, steps);

            // Then the failed setup left no cleanup behind, and the rest of the screen is set up and released as usual
            expect(live.commits).toEqual([['setup:throwingSetup:a', 'setup:survivor:a', 'cleanup:survivor:a'], []]);
            expect(live.errors).toEqual(['Error: setup of throwingSetup:a threw']);

            // And the hook is the same, because an entry only holds a cleanup once its setup returned one
            expect(activity.commits).toEqual(live.commits);
            expect(activity.errors).toEqual(live.errors);
        });

        it('runs the other setups of the reveal when one setup throws', async () => {
            // Given a setup that throws for the value a dependency change moved to behind the cover
            const content = (value: string) => (
                <>
                    <ThrowingSetup
                        value={value}
                        throwsFor="b"
                    />
                    <Subject value={value} />
                </>
            );
            const liveSteps = [visible(content('a')), visible(content('b'))];
            const activitySteps = [visible(content('a')), hidden(content('a')), hidden(content('b')), visible(content('b'))];

            // When the same change runs on a live screen and lands on the reveal of a covered one
            const live = await runCatching(useEffect, LiveScreen, liveSteps);
            const activity = await runCatching(useScreenActivityEffect, ActivityScreen, activitySteps);

            // Then the reveal runs the setup that fails and still runs the other call site, because React runs every
            // passive effect of a commit before it answers for the one that threw, and the error then takes the screen
            // down exactly as on the live screen
            expect(live.commits.flat()).toEqual(['setup:throwingSetup:a', 'setup:s:a', 'cleanup:throwingSetup:a', 'cleanup:s:a', 'setup:throwingSetup:b', 'setup:s:b', 'cleanup:s:b']);
            expect(activity.commits.flat()).toEqual(['setup:throwingSetup:a', 'setup:s:a', 'cleanup:throwingSetup:a', 'setup:throwingSetup:b', 'cleanup:s:a', 'setup:s:b', 'cleanup:s:b']);
            expect(activity.errors).toEqual(live.errors);
        });
    });
});
