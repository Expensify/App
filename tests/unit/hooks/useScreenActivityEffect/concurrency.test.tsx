import {act, render} from '@testing-library/react-native';

import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ComponentType, ReactNode} from 'react';

import React, {startTransition, Suspense, use, useEffect} from 'react';

import type {AnyEffectHook, RenderStep, ScreenProps} from '../../../utils/ScreenActivityEffectTestUtils';

import {ActivityScreen, AnyEffectHookProvider, drainLog, hidden, LiveScreen, log, resetLog, Subject, track, useAnyEffect, visible} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * Every other suite here flushes each commit before the next one. These tests are the ones where a commit does not
 * finish when it starts: a subtree of the screen that suspends, and a cover or a reveal that lands in a transition.
 * A reveal does not run the body of a component that suspends again, exactly as it runs none for a component that went
 * away, and <Suspense> is how a real screen gets there.
 */

type Resource = {promise: Promise<void>; resolve: () => void};

/** A promise the test resolves by hand, which is what makes a component of the screen suspend on demand. */
function createResource(): Resource {
    let resolve = () => {};
    const promise = new Promise<void>((resolvePromise) => {
        resolve = () => resolvePromise();
    });
    return {promise, resolve};
}

/** The fallback of the Suspense, whose own effect is the evidence in the log that the subtree really suspended. */
function FallbackMarker() {
    useEffect(() => {
        log('fallback');
        return () => log('resumed');
    }, []);
    return null;
}

/** A component that suspends for as long as the resource it was given is pending, with no effect of its own. */
function Suspender({pending}: {pending?: Resource}) {
    if (pending) {
        use(pending.promise);
    }
    return null;
}

/** An effect whose own component suspends for as long as the resource it was given is pending. */
function SuspendingSubject({pending, value = 'a'}: {pending?: Resource; value?: string}) {
    if (pending) {
        use(pending.promise);
    }
    useAnyEffect(track(`s:${value}`), [value]);
    return null;
}

/** An effect next to the Suspense, which is the part of the screen a reveal runs while the other part suspends. */
function Sibling() {
    useAnyEffect(track('sibling:a'), []);
    return null;
}

/** One rendered state of the screen, or a change outside the tree, such as a resource resolving. */
type Commit = RenderStep | (() => void);

/**
 * Puts the screen through the commits given and pops it at the end. Every step is flushed before the next, because a
 * commit that suspends finishes in a later task than the call that started it, and so does the mount.
 */
async function runCommits(hook: AnyEffectHook, Screen: ComponentType<ScreenProps>, steps: readonly Commit[]): Promise<string[][]> {
    resetLog();
    const tree = (step: RenderStep) => (
        <AnyEffectHookProvider hook={hook}>
            <Screen isHidden={step.isHidden}>{step.children}</Screen>
        </AnyEffectHookProvider>
    );
    const [first, ...rest] = steps;
    if (first === undefined || typeof first === 'function') {
        throw new Error('The first step has to render the screen.');
    }

    const {rerender, unmount} = render(tree(first));
    const commits: string[][] = [];
    const step = async (mutate?: () => void) => {
        await act(async () => {
            mutate?.();
        });
        commits.push(drainLog());
    };

    await step();
    for (const next of rest) {
        await step(() => (typeof next === 'function' ? next() : rerender(tree(next))));
    }
    await step(() => unmount());

    return commits;
}

/**
 * Covers the screen, makes the resource of the component below it go pending behind the cover, reveals the screen onto
 * the fallback and resolves the resource, which is the path of a screen that suspends again on its reveal.
 */
function suspendOnReveal(content: (pending?: Resource) => ReactNode): Commit[] {
    const resource = createResource();
    return [visible(content()), hidden(content()), hidden(content(resource)), visible(content(resource)), () => resource.resolve()];
}

describe('useScreenActivityEffect in a commit that does not finish at once', () => {
    beforeEach(() => {
        resetLog();
    });

    it('keeps the setup live when the cover and the reveal land in a transition', async () => {
        // Given a screen covered and revealed at the priority navigation gives its own updates
        const tree = (isScreenHidden: boolean) => (
            <AnyEffectHookProvider hook={useScreenActivityEffect}>
                <ActivityScreen isHidden={isScreenHidden}>
                    <Subject value="a" />
                </ActivityScreen>
            </AnyEffectHookProvider>
        );

        const {rerender, unmount} = render(tree(false));
        const commits: string[][] = [];
        const step = async (mutate?: () => void) => {
            await act(async () => {
                startTransition(() => mutate?.());
            });
            commits.push(drainLog());
        };

        // When each of those commits is a transition rather than a synchronous update
        await step();
        await step(() => rerender(tree(true)));
        await step(() => rerender(tree(false)));
        await step(() => unmount());

        // Then the hook answers exactly as it does for a synchronous cover and reveal
        expect(commits).toEqual([['setup:s:a'], [], [], ['cleanup:s:a']]);
    });

    it('keeps the setup of a component that suspends again on the reveal', async () => {
        // Given a component whose resource goes pending behind the cover, so the reveal renders the fallback for it
        const content = (pending?: Resource) => (
            <Suspense fallback={<FallbackMarker />}>
                <SuspendingSubject pending={pending} />
            </Suspense>
        );

        // When the screen is revealed onto the fallback and the resource resolves afterwards
        const live = await runCommits(useEffect, LiveScreen, suspendOnReveal(content));
        const activity = await runCommits(useScreenActivityEffect, ActivityScreen, suspendOnReveal(content));

        // Then the live screen keeps the setup through the suspension, and the fallback shows that it really suspended
        expect(live).toEqual([['setup:s:a'], [], ['fallback'], [], ['resumed'], ['cleanup:s:a']]);

        // And the covered screen keeps it too, because a component that suspends ran no insertion cleanup, so it owes
        // no release
        expect(activity).toEqual([['setup:s:a'], [], [], ['fallback'], ['resumed'], ['cleanup:s:a']]);
        expect(activity.flat()).toEqual(live.flat());
    });

    it('keeps the setup of a suspended component when another part of the screen ran on the reveal', async () => {
        // Given the same suspension next to a component that is not suspended and runs its own effect on the reveal
        const content = (pending?: Resource) => (
            <>
                <Suspense fallback={<FallbackMarker />}>
                    <SuspendingSubject pending={pending} />
                </Suspense>
                <Sibling />
            </>
        );

        // When the screen is revealed while one of its two parts is suspended
        const live = await runCommits(useEffect, LiveScreen, suspendOnReveal(content));
        const activity = await runCommits(useScreenActivityEffect, ActivityScreen, suspendOnReveal(content));

        expect(live).toEqual([['setup:s:a', 'setup:sibling:a'], [], ['fallback'], [], ['resumed'], ['cleanup:s:a', 'cleanup:sibling:a']]);

        // Then the effect of the suspended part stays live, because the sibling running says nothing about it and only a
        // removal, which React reports through the insertion cleanup, makes the hook release a component whose body
        // did not run
        expect(activity).toEqual([['setup:s:a', 'setup:sibling:a'], [], [], ['fallback'], ['resumed'], ['cleanup:s:a', 'cleanup:sibling:a']]);
        expect(activity.flat()).toEqual(live.flat());

        // And the teardown releases the two in tree order, exactly as the live screen does
        expect(activity.at(-1)).toEqual(live.at(-1));
    });
    it('waits for the resume to release a component removed while its boundary shows the fallback', async () => {
        // Given a visible screen whose boundary shows the fallback because a sibling of the kept component suspended
        const content = (pending?: Resource, hasSubject = true) => (
            <Suspense fallback={<FallbackMarker />}>
                <Suspender pending={pending} />
                {hasSubject ? <Subject value="a" /> : null}
            </Suspense>
        );
        const steps = (): Commit[] => {
            const resource = createResource();
            return [visible(content()), visible(content(resource)), visible(content(resource, false)), () => resource.resolve()];
        };

        // When the kept component is removed while the boundary is suspended
        const live = await runCommits(useEffect, LiveScreen, steps());
        const activity = await runCommits(useScreenActivityEffect, ActivityScreen, steps());

        // Then React commits the removal with the resume, and the release lands there on both screens
        expect(live).toEqual([['setup:s:a'], ['fallback'], [], ['resumed', 'cleanup:s:a'], []]);
        expect(activity).toEqual(live);
    });

    it('releases a component removed behind the cover inside a suspended boundary when the boundary resumes', async () => {
        // Given a boundary that shows its fallback, then the cover, the removal and the reveal, all before the resume
        const content = (pending?: Resource, hasSubject = true) => (
            <Suspense fallback={<FallbackMarker />}>
                <Suspender pending={pending} />
                {hasSubject ? <Subject value="a" /> : null}
            </Suspense>
        );
        const steps = (): Commit[] => {
            const resource = createResource();
            return [visible(content()), visible(content(resource)), hidden(content(resource)), hidden(content(resource, false)), visible(content(resource, false)), () => resource.resolve()];
        };

        const live = await runCommits(useEffect, LiveScreen, steps());
        const activity = await runCommits(useScreenActivityEffect, ActivityScreen, steps());

        // Then the live screen releases the component with the resume, after the fallback left
        expect(live).toEqual([['setup:s:a'], ['fallback'], [], [], [], ['resumed', 'cleanup:s:a'], []]);

        // And the covered screen releases it in the same commit, from the microtask of the removal, which runs before the
        // passive cleanup of the fallback because the resume is not a synchronous commit
        expect(activity).toEqual([['setup:s:a'], ['fallback'], ['resumed'], [], ['fallback'], ['cleanup:s:a', 'resumed'], []]);
        expect(activity.flat().filter((call) => call.endsWith(':s:a'))).toEqual(live.flat().filter((call) => call.endsWith(':s:a')));
    });

    it('applies a dependency change made behind the cover when the component resumes from a suspended reveal', async () => {
        // Given a kept component whose dependency changes behind the cover and which suspends on the reveal
        const content = (value: string, pending?: Resource) => (
            <Suspense fallback={<FallbackMarker />}>
                <SuspendingSubject
                    pending={pending}
                    value={value}
                />
            </Suspense>
        );
        const steps = (): Commit[] => {
            const resource = createResource();
            return [visible(content('a')), hidden(content('a')), hidden(content('b')), visible(content('b', resource)), () => resource.resolve()];
        };

        const live = await runCommits(useEffect, LiveScreen, steps());
        const activity = await runCommits(useScreenActivityEffect, ActivityScreen, steps());

        // Then the live screen swaps the setup at the change and keeps the new one through the suspension
        expect(live).toEqual([['setup:s:a'], [], ['cleanup:s:a', 'setup:s:b'], ['fallback'], ['resumed'], ['cleanup:s:b']]);

        // And the covered screen keeps the old setup live until the component resumes, because the body that swaps it
        // runs no earlier than that, and then swaps once
        expect(activity).toEqual([['setup:s:a'], [], [], ['fallback'], ['resumed', 'cleanup:s:a', 'setup:s:b'], ['cleanup:s:b']]);
        expect(activity.flat().filter((call) => call.includes(':s:'))).toEqual(live.flat().filter((call) => call.includes(':s:')));
    });
});
