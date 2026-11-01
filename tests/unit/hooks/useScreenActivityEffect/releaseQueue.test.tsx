import {act, render} from '@testing-library/react-native';

import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ReactNode} from 'react';

import React, {Activity, Component, useEffect, useLayoutEffect, useState} from 'react';
import TestRenderer from 'react-test-renderer';

import type {AnyEffectHook, ScreenProps} from '../../../utils/ScreenActivityEffectTestUtils';

import {ActivityScreen, AnyEffectHookProvider, drainLog, LiveScreen, log, resetLog, settle, Subject} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * A component removed while hidden queues its release, and the queue is one for the whole app: the next body of the
 * hook drains it, on any root, and a release may itself commit more removals. These tests pin down the queue where a
 * commit meets it from the side: a reveal whose layout effect removes the replacement at once, a second root, a
 * release that synchronously commits another root, and an error boundary that swaps the content of a hidden screen.
 */

/** Removes its children from a layout effect, which is a sync update React flushes before the passive effects of the commit. */
function RemoveInLayout({children}: {children: ReactNode}) {
    const [hasChildren, setHasChildren] = useState(true);
    useLayoutEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the sync update of a layout effect is what the test is about
        setHasChildren(false);
    }, []);
    return hasChildren ? children : null;
}

/** An error boundary inside the screen, which renders nothing once a render below it throws. */
class Boundary extends Component<{children: ReactNode}, {hasFailed: boolean}> {
    constructor(props: {children: ReactNode}) {
        super(props);
        this.state = {hasFailed: false};
    }

    static getDerivedStateFromError() {
        return {hasFailed: true};
    }

    render() {
        return this.state.hasFailed ? null : this.props.children;
    }
}

function Thrower({shouldThrow}: {shouldThrow: boolean}) {
    if (shouldThrow) {
        throw new Error('render failed');
    }
    return null;
}

async function step(mutate?: () => void): Promise<string[]> {
    await act(async () => {
        mutate?.();
    });
    return drainLog();
}

describe('the release queue of useScreenActivityEffect', () => {
    beforeEach(() => {
        resetLog();
    });

    it('releases the hidden instance a reveal replaces once when a layout effect removes the replacement at once', async () => {
        // Given a kept component that the reveal commit replaces with a new instance under a parent that removes it from
        // a layout effect
        const tree = (isHidden: boolean, isReplaced: boolean) => (
            <AnyEffectHookProvider hook={useScreenActivityEffect}>
                <ActivityScreen isHidden={isHidden}>
                    {isReplaced ? (
                        <RemoveInLayout>
                            <Subject value="a" />
                        </RemoveInLayout>
                    ) : (
                        <Subject value="a" />
                    )}
                </ActivityScreen>
            </AnyEffectHookProvider>
        );
        const {rerender, unmount} = render(tree(false, false));
        const commits = [await step()];
        commits.push(await step(() => rerender(tree(true, false))));

        // When the reveal lands and the sync update of the layout effect removes the replacement before its passive effects ran
        commits.push(await step(() => rerender(tree(false, true))));
        commits.push(await step(() => unmount()));

        // Then the body of the replacement releases the hidden instance and sets up, and the sync removal releases that
        // setup through the passive cleanup, so every setup has exactly one release
        expect(commits).toEqual([['setup:s:a'], [], ['cleanup:s:a', 'setup:s:a', 'cleanup:s:a'], []]);
    });

    it('releases a hidden removal of one root from the next body of the hook on another root', async () => {
        // Given a covered screen with a kept component on one root and a live screen with another on a second root
        const one = (hasSubject: boolean, isHidden: boolean) => (
            <AnyEffectHookProvider hook={useScreenActivityEffect}>
                <ActivityScreen isHidden={isHidden}>
                    {hasSubject ? (
                        <Subject
                            name="one"
                            value="a"
                        />
                    ) : null}
                </ActivityScreen>
            </AnyEffectHookProvider>
        );
        const two = (value: string) => (
            <AnyEffectHookProvider hook={useScreenActivityEffect}>
                <LiveScreen isHidden={false}>
                    <Subject
                        name="two"
                        value={value}
                    />
                </LiveScreen>
            </AnyEffectHookProvider>
        );
        const rootOne = render(one(true, false));
        const rootTwo = render(two('a'));
        await settle();
        rootOne.rerender(one(true, true));
        await settle();
        drainLog();

        // When the hidden removal and a dependency change on the other root land in one synchronous batch
        // eslint-disable-next-line testing-library/no-unnecessary-act -- the act batches the two roots into one flush, which is the point
        act(() => {
            rootOne.rerender(one(false, true));
            rootTwo.rerender(two('b'));
        });
        const calls = drainLog();
        await settle();

        // Then the body on the second root releases the removal before its own setup, and the microtask finds nothing left
        expect(calls).toEqual(['cleanup:two:a', 'cleanup:one:a', 'setup:two:b']);
        expect(drainLog()).toEqual([]);

        rootOne.unmount();
        rootTwo.unmount();
        await settle();
    });

    it('releases both once when a release synchronously commits the removal of another hidden component', async () => {
        // Given a hidden kept component on a test renderer root, whose updates commit synchronously
        // The test renderer stays here because its update commits synchronously, which @testing-library/react-native cannot do.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        let secondRoot: TestRenderer.ReactTestRenderer | undefined;
        const second = (mode: 'visible' | 'hidden', hasSubject: boolean) => (
            <AnyEffectHookProvider hook={useScreenActivityEffect}>
                <Activity mode={mode}>
                    {hasSubject ? (
                        <Subject
                            name="second"
                            value="a"
                        />
                    ) : null}
                </Activity>
            </AnyEffectHookProvider>
        );
        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            secondRoot = TestRenderer.create(second('visible', true));
        });
        act(() => secondRoot?.update(second('hidden', true)));
        await settle();
        drainLog();

        // And a hidden kept component on the screen whose release removes the first one
        function First() {
            useScreenActivityEffect(() => {
                log('setup:first:a');
                return () => {
                    log('cleanup:first:a');
                    secondRoot?.update(second('hidden', false));
                    log('updated');
                };
            }, []);
            return null;
        }
        const tree = (isHidden: boolean, hasFirst: boolean) => <ActivityScreen isHidden={isHidden}>{hasFirst ? <First /> : null}</ActivityScreen>;
        const {rerender, unmount} = render(tree(false, true));
        await settle();
        rerender(tree(true, true));
        await settle();
        drainLog();

        // When the screen removes it behind the cover and the microtask runs its release
        rerender(tree(true, false));
        await settle();

        // Then the removal the release commits is released by the same drain, after the update returned, and only once
        expect(drainLog()).toEqual(['cleanup:first:a', 'updated', 'cleanup:second:a']);

        unmount();
        act(() => secondRoot?.unmount());
        await settle();
        expect(drainLog()).toEqual([]);
    });

    it('releases a kept component an error boundary swaps out while the screen is hidden', async () => {
        const reported = jest.spyOn(console, 'error').mockImplementation(() => {});
        const run = async (hook: AnyEffectHook, Screen: React.ComponentType<ScreenProps>) => {
            resetLog();
            const tree = (isHidden: boolean, shouldThrow: boolean) => (
                <AnyEffectHookProvider hook={hook}>
                    <Screen isHidden={isHidden}>
                        <Boundary>
                            <Thrower shouldThrow={shouldThrow} />
                            <Subject value="a" />
                        </Boundary>
                    </Screen>
                </AnyEffectHookProvider>
            );
            const {rerender, unmount} = render(tree(false, false));
            const commits = [await step()];
            commits.push(await step(() => rerender(tree(true, false))));
            commits.push(await step(() => rerender(tree(true, true))));
            commits.push(await step(() => rerender(tree(false, true))));
            commits.push(await step(() => unmount()));
            return commits;
        };

        // When a render behind the cover throws and the boundary inside the screen renders nothing instead
        const live = await run(useEffect, LiveScreen);
        const activity = await run(useScreenActivityEffect, ActivityScreen);
        reported.mockRestore();

        // Then the kept component the boundary removed is released in that commit, exactly as on the live screen
        expect(live).toEqual([['setup:s:a'], [], ['cleanup:s:a'], [], []]);
        expect(activity).toEqual(live);
    });
});
