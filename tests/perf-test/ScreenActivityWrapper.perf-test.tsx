import {act, fireEvent, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';

import {NavigationContainer, useNavigation} from '@react-navigation/native';
import React, {useSyncExternalStore} from 'react';
import {View} from 'react-native';
import {measureRenders} from 'reassure';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The wrapper logs every mode change, and a real Logger flushes those lines to the server between the measurement
// runs, which both slows the run down and leaks a pending request into the next test.
jest.mock('@libs/Log', () => ({
    info: jest.fn(),
}));

/**
 * Compares a navigator that deprioritizes its covered screens with React <Activity> against the same navigator
 * without it, which is how the app behaves today on the screens that are not wrapped at all. Both variants run
 * the same scenarios, so their numbers can be read side by side in a single Reassure report. Deprioritizing has
 * to win in every scenario, including the ones where it only adds the wrapper and never hides anything.
 */
const SCREEN_NAMES = ['First', 'Second', 'Third'];
const ROWS_PER_SCREEN = 50;

const externalStore = {
    value: 0,
    listeners: new Set<() => void>(),
    subscribe: (listener: () => void) => {
        externalStore.listeners.add(listener);
        return () => externalStore.listeners.delete(listener);
    },
    getSnapshot: () => externalStore.value,
    emit: () => {
        externalStore.value += 1;
        for (const listener of externalStore.listeners) {
            listener();
        }
    },
    reset: () => {
        externalStore.value = 0;
        externalStore.listeners.clear();
    },
};

const ROW_INDEXES = Array.from({length: ROWS_PER_SCREEN}, (_value, index) => index);

function ScreenContent({name}: {name: string}) {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const storeValue = useSyncExternalStore(externalStore.subscribe, externalStore.getSnapshot, externalStore.getSnapshot);
    const nextScreen = SCREEN_NAMES.at(SCREEN_NAMES.indexOf(name) + 1);

    return (
        <View>
            {ROW_INDEXES.map((index) => (
                <Text key={index}>{`${name} row ${index} at ${storeValue}`}</Text>
            ))}
            {!!nextScreen && (
                <Text
                    testID={`open-${nextScreen}`}
                    onPress={() => navigation.navigate(nextScreen)}
                >
                    {`open ${nextScreen}`}
                </Text>
            )}
            <Text
                testID={`back-from-${name}`}
                onPress={() => navigation.goBack()}
            >
                back
            </Text>
        </View>
    );
}

const ActivityStack = createPlatformStackNavigator<ParamListBase>();
const PlainStack = createPlatformStackNavigator<ParamListBase>();

function ActivityNavigator() {
    return (
        <NavigationContainer>
            <ActivityStack.Navigator screenOptions={{nonTopScreenBehavior: 'activity'}}>
                {SCREEN_NAMES.map((name) => (
                    <ActivityStack.Screen
                        key={name}
                        name={name}
                    >
                        {() => <ScreenContent name={name} />}
                    </ActivityStack.Screen>
                ))}
            </ActivityStack.Navigator>
        </NavigationContainer>
    );
}

function PlainNavigator() {
    return (
        <NavigationContainer>
            <PlainStack.Navigator>
                {SCREEN_NAMES.map((name) => (
                    <PlainStack.Screen
                        key={name}
                        name={name}
                    >
                        {() => <ScreenContent name={name} />}
                    </PlainStack.Screen>
                ))}
            </PlainStack.Navigator>
        </NavigationContainer>
    );
}

/** Lets the first render pass finish, which is when the covered screens get deprioritized. */
async function settleCoveredScreens() {
    await act(async () => {
        await new Promise((resolve) => {
            setTimeout(resolve, 600);
        });
    });
}

async function coverTwoScreens() {
    fireEvent.press(await screen.findByTestId('open-Second'));
    fireEvent.press(await screen.findByTestId('open-Third'));
    await settleCoveredScreens();
}

async function updateCoveredScreens() {
    await coverTwoScreens();
    for (let update = 0; update < 5; update++) {
        act(() => {
            externalStore.emit();
        });
    }
}

async function coverAndRevealScreens() {
    await coverTwoScreens();
    fireEvent.press(await screen.findByTestId('back-from-Third'));
    await settleCoveredScreens();
}

beforeEach(() => {
    externalStore.reset();
});

test('[ScreenActivityWrapper] mount a stack of screens - activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<ActivityNavigator />);
});

test('[ScreenActivityWrapper] mount a stack of screens - without activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<PlainNavigator />);
});

test('[ScreenActivityWrapper] cover two screens - activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<ActivityNavigator />, {scenario: coverTwoScreens});
});

test('[ScreenActivityWrapper] cover two screens - without activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<PlainNavigator />, {scenario: coverTwoScreens});
});

test('[ScreenActivityWrapper] update a store the covered screens subscribe to - activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<ActivityNavigator />, {scenario: updateCoveredScreens});
});

test('[ScreenActivityWrapper] update a store the covered screens subscribe to - without activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<PlainNavigator />, {scenario: updateCoveredScreens});
});

test('[ScreenActivityWrapper] cover a screen and reveal it again - activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<ActivityNavigator />, {scenario: coverAndRevealScreens});
});

test('[ScreenActivityWrapper] cover a screen and reveal it again - without activity', async () => {
    await waitForBatchedUpdates();
    await measureRenders(<PlainNavigator />, {scenario: coverAndRevealScreens});
});
