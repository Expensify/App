import {act, render} from '@testing-library/react-native';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {scheduleOnRN} from 'react-native-worklets';

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock'),
    scheduleOnRN: jest.fn(),
}));

type HarnessParamList = {
    A: undefined;
    B: undefined;
};

const Stack = createPlatformStackNavigator<HarnessParamList>();
const navigationRef = createNavigationContainerRef<HarnessParamList>();

function Harness({shouldHighlight}: {shouldHighlight: boolean}) {
    useAnimatedHighlightStyle({shouldHighlight});
    return null;
}

function EmptyScreen() {
    return null;
}

function renderHarness(shouldHighlight: boolean) {
    const buildTree = (highlight: boolean) => (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
                <Stack.Screen name="A">{() => <Harness shouldHighlight={highlight} />}</Stack.Screen>
                <Stack.Screen
                    name="B"
                    component={EmptyScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
    const utils = render(buildTree(shouldHighlight));
    return {
        ...utils,
        setShouldHighlight: (highlight: boolean) => utils.rerender(buildTree(highlight)),
    };
}

const playCount = () => jest.mocked(scheduleOnRN).mock.calls.length;

describe('useAnimatedHighlightStyle', () => {
    beforeEach(() => {
        jest.mocked(scheduleOnRN).mockClear();
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayout: true});
    });

    it('plays immediately when the screen is focused', () => {
        renderHarness(true);
        expect(playCount()).toBe(1);
    });

    it('defers the play on a covered narrow screen until it regains focus, then plays exactly once across later refocuses', () => {
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        expect(playCount()).toBe(0);

        act(() => {
            navigationRef.goBack();
        });
        expect(playCount()).toBe(1);

        act(() => {
            navigationRef.navigate('B');
        });
        act(() => {
            navigationRef.goBack();
        });
        expect(playCount()).toBe(1);
    });

    it('plays in the background on a wide pane even while unfocused', () => {
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayout: false});
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        expect(playCount()).toBe(1);

        act(() => {
            navigationRef.goBack();
        });
        expect(playCount()).toBe(1);
    });

    it('does not play when the highlight is cleared before the screen regains focus', () => {
        const {setShouldHighlight} = renderHarness(false);
        act(() => {
            navigationRef.navigate('B');
        });
        setShouldHighlight(true);
        setShouldHighlight(false);

        act(() => {
            navigationRef.goBack();
        });
        expect(playCount()).toBe(0);
    });

    it('does not replay while the highlight stays on, but plays again after it turns off and back on', () => {
        const {setShouldHighlight} = renderHarness(true);
        expect(playCount()).toBe(1);

        setShouldHighlight(true);
        expect(playCount()).toBe(1);

        setShouldHighlight(false);
        setShouldHighlight(true);
        expect(playCount()).toBe(2);
    });

    it('waits for the screen transition to end before playing', () => {
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: false, shouldUseNarrowLayout: true});
        const {setShouldHighlight} = renderHarness(true);
        expect(playCount()).toBe(0);

        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true, shouldUseNarrowLayout: true});
        setShouldHighlight(true);
        expect(playCount()).toBe(1);
    });
});
