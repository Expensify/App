import {act, render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {InitialState, ParamListBase} from '@react-navigation/native';

import {CommonActions, NavigationContainer} from '@react-navigation/native';
import React, {Suspense, lazy, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Modal, View} from 'react-native';

import completeRevealTransition from '../utils/completeRevealTransition';

/**
 * These checks are written from the behavior a user has to get, not from the current implementation. They cover
 * the ways a deprioritized screen can end up rendering nothing, or rendering something stale, on a real device:
 * data that is loaded once, layout that is measured once, content that lives in a portal, and screens that are
 * covered twice over. Every one of them is a shape that exists in the app today.
 */
const lifecycleLog: string[] = [];

const ActivityStack = createPlatformStackNavigator<ParamListBase>();
const OuterStack = createPlatformStackNavigator<ParamListBase>();

function settleFirstRenderPass() {
    act(() => {
        jest.advanceTimersByTime(20);
    });
}

function navigateTo(screenName: string) {
    act(() => {
        navigationRef.current?.dispatch(CommonActions.navigate(screenName));
        jest.advanceTimersByTime(500);
    });
}

function goBack() {
    act(() => {
        navigationRef.current?.goBack();
        jest.advanceTimersByTime(500);
    });
}

function TopScreen() {
    return <Text testID="top-screen">top</Text>;
}

function renderStack(FirstScreen: React.ComponentType, initialState?: InitialState) {
    const result = render(
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
        >
            <ActivityStack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
                <ActivityStack.Screen
                    name="First"
                    component={FirstScreen}
                />
                <ActivityStack.Screen
                    name="Second"
                    component={TopScreen}
                />
            </ActivityStack.Navigator>
        </NavigationContainer>,
    );
    settleFirstRenderPass();
    return result;
}

function InnerNavigator() {
    return (
        <ActivityStack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
            <ActivityStack.Screen
                name="InnerFirst"
                component={InnerFirstScreen}
            />
            <ActivityStack.Screen
                name="InnerSecond"
                component={TopScreen}
            />
        </ActivityStack.Navigator>
    );
}

function InnerFirstScreen() {
    useEffect(() => {
        lifecycleLog.push('inner mount');
        return () => {
            lifecycleLog.push('inner unmount');
        };
    }, []);
    return <Text testID="inner-first">inner first</Text>;
}

describe('rendering risks of a deprioritized screen', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        lifecycleLog.length = 0;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('a screen that loads its data once', () => {
        /** The common shape: fetch on mount, keep the result in state, and never fetch twice. */
        function ScreenKeepingDataInState() {
            const [data, setData] = useState('');
            const hasLoadedRef = useRef(false);

            useEffect(() => {
                if (hasLoadedRef.current) {
                    return;
                }
                hasLoadedRef.current = true;
                lifecycleLog.push('load');
                setData('loaded content');
            }, []);

            return <Text testID="content">{data || 'empty'}</Text>;
        }

        it('loads its data even when it is covered right after mounting', () => {
            renderStack(ScreenKeepingDataInState);

            navigateTo('Second');

            expect(lifecycleLog).toEqual(['load']);
        });

        it('still shows its data after being covered and revealed', () => {
            renderStack(ScreenKeepingDataInState);

            navigateTo('Second');
            goBack();

            expect(screen.getByTestId('content').props.children).toBe('loaded content');
        });

        it('does not load its data again on every reveal', () => {
            renderStack(ScreenKeepingDataInState);

            navigateTo('Second');
            goBack();
            navigateTo('Second');
            goBack();

            expect(lifecycleLog.filter((entry) => entry === 'load')).toHaveLength(1);
        });
    });

    describe('a screen that drops its data in the effect cleanup', () => {
        /**
         * The dangerous shape: the cleanup clears what the screen renders, and the load is guarded so it never
         * runs again. Being covered runs that cleanup, so the screen comes back empty. Nothing in the wrapper can
         * repair this, which is why screens have to be audited for cleanups that encode application state before
         * they are deprioritized.
         */
        function ScreenClearingDataOnCleanup() {
            const [data, setData] = useState('');
            const hasLoadedRef = useRef(false);

            useEffect(() => {
                if (!hasLoadedRef.current) {
                    hasLoadedRef.current = true;
                    setData('loaded content');
                }
                return () => setData('');
            }, []);

            return <Text testID="content">{data || 'empty'}</Text>;
        }

        it('comes back empty after being covered, which is what a blank screen looks like', () => {
            renderStack(ScreenClearingDataOnCleanup);

            navigateTo('Second');
            goBack();

            expect(screen.getByTestId('content').props.children).toBe('empty');
        });
    });

    describe('a screen that measures itself', () => {
        function ScreenMeasuringItself() {
            useLayoutEffect(() => {
                lifecycleLog.push('measure');
                return () => {
                    lifecycleLog.push('drop measurement');
                };
            }, []);

            return <Text testID="measured">measured</Text>;
        }

        it('measures itself again every time it is revealed, so its layout is never stale', async () => {
            renderStack(ScreenMeasuringItself);

            navigateTo('Second');
            goBack();
            await completeRevealTransition();

            expect(lifecycleLog).toEqual(['measure', 'drop measurement', 'measure']);
        });
    });

    describe('a screen with a repeating timer', () => {
        // The ticks are logged instead of read from the rendered text, because the text of a covered screen is
        // not part of the rendered output any more, only its state is.
        function ScreenWithTimer() {
            const [ticks, setTicks] = useState(0);

            useEffect(() => {
                const intervalID = setInterval(() => {
                    lifecycleLog.push('tick');
                    setTicks((previous) => previous + 1);
                }, 100);
                return () => clearInterval(intervalID);
            }, []);

            return <Text testID="ticks">{`ticks-${ticks}`}</Text>;
        }

        it('stops ticking while it is covered, so it burns no time on a covered screen', () => {
            renderStack(ScreenWithTimer);
            act(() => {
                jest.advanceTimersByTime(300);
            });
            navigateTo('Second');
            const ticksWhenCovered = lifecycleLog.length;

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(lifecycleLog).toHaveLength(ticksWhenCovered);
        });

        it('starts ticking again when it is revealed', async () => {
            renderStack(ScreenWithTimer);
            navigateTo('Second');
            goBack();
            await completeRevealTransition();
            const ticksOnReveal = lifecycleLog.length;

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(lifecycleLog.length).toBeGreaterThan(ticksOnReveal);
        });

        it('carries every tick it counted into the state it comes back with', () => {
            renderStack(ScreenWithTimer);
            act(() => {
                jest.advanceTimersByTime(300);
            });

            navigateTo('Second');
            goBack();

            // Being covered must not reset the counter, so the state has to match every tick that ever fired.
            expect(screen.getByTestId('ticks').props.children).toBe(`ticks-${lifecycleLog.length}`);
        });
    });

    describe('a screen that suspends past the first render window', () => {
        /**
         * Deep linking can mount a covered lazy screen whose chunk resolves only after the one frame the wrapper
         * keeps it visible. The content then commits into a hidden Activity, which never mounts effects, so the
         * screen initializes itself (data, subscriptions, measurements) only when it is revealed. These checks
         * pin that behavior: a slow chunk defers the screen's initialization to its reveal instead of losing it.
         */
        let resolveChunk: () => void;
        let LazyScreen: React.ComponentType;

        beforeEach(() => {
            const chunkPromise = new Promise<void>((resolve) => {
                resolveChunk = resolve;
            });
            function LoadedContent() {
                useEffect(() => {
                    lifecycleLog.push('lazy mount');
                    return () => {
                        lifecycleLog.push('lazy unmount');
                    };
                }, []);
                return <Text testID="lazy-content">lazy</Text>;
            }
            const LazyContent = lazy(() => chunkPromise.then(() => ({default: LoadedContent})));
            LazyScreen = function SuspendingScreen() {
                return (
                    <Suspense fallback={<Text testID="lazy-fallback">loading</Text>}>
                        <LazyContent />
                    </Suspense>
                );
            };
        });

        const COVERED_FROM_THE_START: InitialState = {index: 1, routes: [{name: 'First'}, {name: 'Second'}]};

        async function resolveChunkNow() {
            await act(async () => {
                resolveChunk();
            });
        }

        it('does not mount the effects of content that resolves while the screen is hidden', async () => {
            renderStack(LazyScreen, COVERED_FROM_THE_START);

            await resolveChunkNow();

            expect(lifecycleLog).not.toContain('lazy mount');
        });

        it('mounts them once the screen is revealed', async () => {
            renderStack(LazyScreen, COVERED_FROM_THE_START);
            await resolveChunkNow();

            goBack();
            await completeRevealTransition();

            expect(lifecycleLog).toContain('lazy mount');
            expect(screen.getByTestId('lazy-content')).toBeTruthy();
        });
    });

    describe('a screen showing a modal', () => {
        function ScreenWithModal() {
            return (
                <View>
                    <Text testID="screen-body">body</Text>
                    <Modal visible>
                        <Text testID="modal-body">modal</Text>
                    </Modal>
                </View>
            );
        }

        it('stops painting the modal as soon as the screen is covered', () => {
            // A modal is rendered outside the screen subtree, so the wrapper that keeps the screen painted does
            // not cover it. On a device this means a modal that is still open when its screen gets covered
            // disappears at once instead of animating out, which is worth watching for on the screens that open
            // popovers right before navigating away.
            renderStack(ScreenWithModal);

            navigateTo('Second');

            expect(screen.queryByTestId('modal-body')).toBeNull();
        });

        it('shows the modal again when the screen is revealed', () => {
            renderStack(ScreenWithModal);
            navigateTo('Second');

            goBack();

            expect(screen.getByTestId('modal-body')).toBeTruthy();
        });
    });

    describe('a screen covered twice over', () => {
        function renderNestedStacks() {
            const result = render(
                <NavigationContainer ref={navigationRef}>
                    <OuterStack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
                        <OuterStack.Screen
                            name="InnerNavigator"
                            component={InnerNavigator}
                        />
                        <OuterStack.Screen
                            name="Other"
                            component={TopScreen}
                        />
                    </OuterStack.Navigator>
                </NavigationContainer>,
            );
            settleFirstRenderPass();
            return result;
        }

        it('stays deprioritized when only the outer cover is removed', () => {
            renderNestedStacks();
            navigateTo('InnerSecond');
            navigateTo('Other');
            const lifecycleWhenDoubleCovered = [...lifecycleLog];

            goBack();

            // The inner screen is still covered inside its own navigator, so revealing the navigator must not
            // wake it up again.
            expect(lifecycleLog).toEqual(lifecycleWhenDoubleCovered);
        });

        it('is revealed only once nothing covers it anymore', async () => {
            renderNestedStacks();
            navigateTo('InnerSecond');
            navigateTo('Other');

            goBack();
            await completeRevealTransition();
            goBack();
            await completeRevealTransition();

            expect(lifecycleLog.at(-1)).toBe('inner mount');
        });
    });
});
