import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {InitialState, ParamListBase} from '@react-navigation/native';

import {CommonActions, NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState, useSyncExternalStore} from 'react';
import {View} from 'react-native';

import type {WindowDimensionsChangeMock} from '../utils/mockWindowDimensionsChange';

import completeRevealTransition from '../utils/completeRevealTransition';
import {buildWindowSize, mockWindowDimensionsChange} from '../utils/mockWindowDimensionsChange';

type TestParamList = ParamListBase & {
    First: undefined;
    Second: undefined;
};

/**
 * Records the mount and unmount of every screen effect. A hidden <Activity> unmounts the effects of its subtree,
 * so this log is how the tests observe which screens are deprioritized.
 */
const effectLog: string[] = [];
const renderCounts: Record<string, number> = {};

/** Minimal external store, standing in for anything a screen subscribes to while it is mounted. */
const externalStore = {
    value: 0,
    listeners: new Set<() => void>(),
    subscribe: (listener: () => void) => {
        externalStore.listeners.add(listener);
        return () => externalStore.listeners.delete(listener);
    },
    getSnapshot: () => externalStore.value,
    emit: (value: number) => {
        externalStore.value = value;
        for (const listener of externalStore.listeners) {
            listener();
        }
    },
    reset: () => {
        externalStore.value = 0;
        externalStore.listeners.clear();
    },
};

function TrackedScreen({name}: {name: string}) {
    const [counter, setCounter] = useState(0);
    const storeValue = useSyncExternalStore(externalStore.subscribe, externalStore.getSnapshot, externalStore.getSnapshot);
    // Counting renders is the point of this component, and a render count is only observable during render.
    // eslint-disable-next-line react-hooks/immutability
    renderCounts[name] = (renderCounts[name] ?? 0) + 1;

    useEffect(() => {
        effectLog.push(`${name} mount`);
        return () => {
            effectLog.push(`${name} unmount`);
        };
    }, [name]);

    return (
        <View>
            <Text testID={`${name}-counter`}>{`counter-${counter}`}</Text>
            <Text testID={`${name}-store`}>{`store-${storeValue}`}</Text>
            <Text
                testID={`${name}-increment`}
                onPress={() => setCounter((previous) => previous + 1)}
            >
                increment
            </Text>
            <Text
                testID={`${name}-increment-later`}
                onPress={() => setTimeout(() => setCounter((previous) => previous + 1), 100)}
            >
                increment later
            </Text>
        </View>
    );
}

function FirstScreen() {
    return <TrackedScreen name="First" />;
}

function SecondScreen() {
    return <TrackedScreen name="Second" />;
}

const ActivityStack = createPlatformStackNavigator<TestParamList>();
const PlainStack = createPlatformStackNavigator<ParamListBase>();

function ActivityNavigator() {
    return (
        <ActivityStack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
            <ActivityStack.Screen
                name="First"
                component={FirstScreen}
            />
            <ActivityStack.Screen
                name="Second"
                component={SecondScreen}
            />
        </ActivityStack.Navigator>
    );
}

function OtherScreen() {
    return <Text testID="other">other</Text>;
}

/** Lets the first render pass of every mounted screen finish, which is when covered screens get deprioritized. */
function settleFirstRenderPass() {
    act(() => {
        jest.advanceTimersByTime(20);
    });
}

function renderActivityStack(initialState?: InitialState) {
    const result = render(
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
        >
            <ActivityNavigator />
        </NavigationContainer>,
    );
    settleFirstRenderPass();
    return result;
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

let windowDimensions: WindowDimensionsChangeMock;

describe('non-top screens with the activity behavior', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        effectLog.length = 0;
        externalStore.reset();
        for (const key of Object.keys(renderCounts)) {
            delete renderCounts[key];
        }
        windowDimensions = mockWindowDimensionsChange(buildWindowSize(400, 900));
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('mounts the effects of the initial screen', () => {
        renderActivityStack();

        expect(effectLog).toEqual(['First mount']);
    });

    it('unmounts the effects of a screen covered by the next one', () => {
        renderActivityStack();

        navigateTo('Second');

        expect(effectLog).toEqual(['First mount', 'First unmount', 'Second mount']);
    });

    it('keeps the effects of the top screen mounted', () => {
        renderActivityStack();

        navigateTo('Second');

        expect(effectLog).not.toContain('Second unmount');
    });

    it('mounts the effects of a covered screen again when it is revealed', async () => {
        renderActivityStack();
        navigateTo('Second');

        goBack();
        await completeRevealTransition();

        expect(effectLog.filter((entry) => entry === 'First mount')).toHaveLength(2);
    });

    it('preserves the state of a covered screen', () => {
        renderActivityStack();
        fireEvent.press(screen.getByTestId('First-increment'));
        fireEvent.press(screen.getByTestId('First-increment'));

        navigateTo('Second');
        goBack();

        expect(screen.getByTestId('First-counter').props.children).toBe('counter-2');
    });

    it('mounts the effects of a screen that is covered from its very first render', () => {
        // A deep link opens the stack with the first screen already covered by the second one.
        renderActivityStack({index: 1, routes: [{name: 'First'}, {name: 'Second'}]});

        expect(effectLog).toContain('First mount');
    });

    it('deprioritizes a screen that is covered from its very first render once the frame passes', () => {
        renderActivityStack({index: 1, routes: [{name: 'First'}, {name: 'Second'}]});

        expect(effectLog).toEqual(expect.arrayContaining(['First mount', 'First unmount']));
    });

    describe('work that was already in flight when the screen got covered', () => {
        it('still commits its state update, which is what a frozen screen could not do', () => {
            // This is the shape of the react-freeze regression: a modal that is still closing when the screen gets
            // covered has to finish its close chain, and a hidden Activity keeps processing updates.
            renderActivityStack();
            fireEvent.press(screen.getByTestId('First-increment-later'));

            navigateTo('Second');
            act(() => {
                jest.advanceTimersByTime(200);
            });
            goBack();

            expect(screen.getByTestId('First-counter').props.children).toBe('counter-1');
        });

        it('runs the cleanup of a covered screen exactly once when it is finally removed', () => {
            renderActivityStack();
            navigateTo('Second');
            const cleanupCountWhileCovered = effectLog.filter((entry) => entry === 'First unmount').length;

            act(() => {
                navigationRef.current?.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Second'}]}));
                jest.advanceTimersByTime(500);
            });

            expect(effectLog.filter((entry) => entry === 'First unmount')).toHaveLength(cleanupCountWhileCovered);
        });
    });

    describe('fast navigation', () => {
        it('leaves the screen mounted when it is covered and revealed within the same frame', () => {
            renderActivityStack();

            act(() => {
                navigationRef.current?.dispatch(CommonActions.navigate('Second'));
                navigationRef.current?.goBack();
                jest.advanceTimersByTime(500);
            });

            expect(effectLog).toEqual(['First mount']);
        });

        it('balances the effect mounts and cleanups over repeated round trips', async () => {
            renderActivityStack();

            for (let round = 0; round < 5; round++) {
                navigateTo('Second');
                goBack();
                // eslint-disable-next-line no-await-in-loop
                await completeRevealTransition();
            }

            const mounts = effectLog.filter((entry) => entry === 'First mount').length;
            const cleanups = effectLog.filter((entry) => entry === 'First unmount').length;
            expect(mounts - cleanups).toBe(1);
        });
    });

    describe('subscriptions of a covered screen', () => {
        it('stop re-rendering it while it is covered', () => {
            renderActivityStack();
            navigateTo('Second');
            const renderCountWhileCovered = renderCounts.First;

            act(() => {
                externalStore.emit(1);
            });

            expect(renderCounts.First).toBe(renderCountWhileCovered);
        });

        it('keep updating the top screen', () => {
            renderActivityStack();
            navigateTo('Second');

            act(() => {
                externalStore.emit(1);
            });

            expect(screen.getByTestId('Second-store').props.children).toBe('store-1');
        });

        it('catch up with the current value once the screen is revealed', async () => {
            renderActivityStack();
            navigateTo('Second');
            act(() => {
                externalStore.emit(7);
            });

            goBack();
            await completeRevealTransition();

            expect(screen.getByTestId('First-store').props.children).toBe('store-7');
        });
    });

    describe('when the whole navigator loses focus', () => {
        function renderNestedStacks() {
            const result = render(
                <NavigationContainer ref={navigationRef}>
                    <PlainStack.Navigator>
                        <PlainStack.Screen
                            name="ActivityNavigator"
                            component={ActivityNavigator}
                        />
                        <PlainStack.Screen
                            name="Other"
                            component={OtherScreen}
                        />
                    </PlainStack.Navigator>
                </NavigationContainer>,
            );
            settleFirstRenderPass();
            return result;
        }

        it('deprioritizes its screens', () => {
            renderNestedStacks();

            navigateTo('Other');

            expect(effectLog).toEqual(['First mount', 'First unmount']);
        });

        it('reveals them again when it regains focus', async () => {
            renderNestedStacks();
            navigateTo('Other');

            goBack();
            await completeRevealTransition();

            expect(effectLog).toEqual(['First mount', 'First unmount', 'First mount']);
        });

        it('preserves their state', () => {
            renderNestedStacks();
            fireEvent.press(screen.getByTestId('First-increment'));

            navigateTo('Other');
            goBack();

            expect(screen.getByTestId('First-counter').props.children).toBe('counter-1');
        });
    });

    describe('window size changes', () => {
        function emitWindowSize(width: number, height: number) {
            act(() => {
                windowDimensions.emit(buildWindowSize(width, height));
            });
        }

        it('reveal a covered screen so it lays itself out against the new size', () => {
            renderActivityStack();
            navigateTo('Second');

            emitWindowSize(1200, 900);

            expect(effectLog.at(-1)).toBe('First mount');
        });

        it('deprioritize the covered screen again once the change settles', () => {
            renderActivityStack();
            navigateTo('Second');
            emitWindowSize(1200, 900);

            act(() => {
                jest.advanceTimersByTime(250);
            });

            expect(effectLog.at(-1)).toBe('First unmount');
        });

        it('leave a covered screen deprioritized on a height only change', () => {
            renderActivityStack();
            navigateTo('Second');
            const effectCountWhileCovered = effectLog.length;

            emitWindowSize(400, 500);

            expect(effectLog).toHaveLength(effectCountWhileCovered);
        });
    });
});
