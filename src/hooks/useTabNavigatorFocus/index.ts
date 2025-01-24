import {useTabAnimation} from '@react-navigation/material-top-tabs';
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import type {Animated} from 'react-native';
import DomUtils from '@libs/DomUtils';

type UseTabNavigatorFocusParams = {
    tabIndex: number;
};

type PositionAnimationListenerCallback = {
    value: number;
};

/**
 * Custom React hook to determine the focus status of a tab in a Material Top Tab Navigator.
 * It evaluates whether the current tab is focused based on the tab's animation position and
 * the screen's focus status within a React Navigation environment.
 *
 * This hook is designed for use with the Material Top Tabs provided by '@react-navigation/material-top-tabs'.
 * It leverages the `useTabAnimation` hook from the same package to track the animated position of tabs
 * and the `useIsFocused` hook from '@react-navigation/native' to ascertain if the current screen is in focus.
 *
 * Note: This hook contains a conditional invocation of another hook (`useTabAnimation`),
 * which is typically an anti-pattern in React. This is done to account for scenarios where the hook
 * might not be used within a Material Top Tabs Navigator context. Proper usage should ensure that
 * this hook is only used where appropriate.
 *
 * @param params - The parameters object.
 * @param params.tabIndex - The index of the tab for which focus status is being determined.
 * @returns Returns `true` if the tab is both animation-focused and screen-focused, otherwise `false`.
 *
 * @example
 * const isTabFocused = useTabNavigatorFocus({ tabIndex: 1 });
 */
function useTabNavigatorFocus({tabIndex}: UseTabNavigatorFocusParams): boolean {
    let tabPositionAnimation: Animated.AnimatedInterpolation<number> | null = null;

    try {
        // Retrieve the animation value from the tab navigator, which ranges from 0 to the total number of pages displayed.
        // Even a minimal scroll towards the camera page (e.g., a value of 0.001 at start) should activate the camera for immediate responsiveness.
        // STOP!!!!!!! This is not a pattern to be followed! We are conditionally rendering this hook becase when used in the edit flow we'll never be inside a tab navigator.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/rules-of-hooks
        tabPositionAnimation = useTabAnimation();
    } catch (error) {
        tabPositionAnimation = null;
    }
    const isPageFocused = useIsFocused();
    // set to true if the hook is not used within the MaterialTopTabs context
    // the hook will then return true if the screen is focused
    const [isTabFocused, setIsTabFocused] = useState(!tabPositionAnimation);

    useEffect(() => {
        if (!tabPositionAnimation) {
            return;
        }
        const listenerId = tabPositionAnimation.addListener(({value}: PositionAnimationListenerCallback) => {
            // Activate camera as soon the index is animating towards the `tabIndex`
            DomUtils.requestAnimationFrame(() => {
                setIsTabFocused(value > tabIndex - 1 && value < tabIndex + 1);
            });
        });

        // We need to get the position animation value on component initialization to determine
        // if the tab is focused or not. Since it's an Animated.Value the only synchronous way
        // to retrieve the value is to use a private method.
        // eslint-disable-next-line no-underscore-dangle
        const initialTabPositionValue = tabPositionAnimation.__getValue();

        if (typeof initialTabPositionValue === 'number') {
            DomUtils.requestAnimationFrame(() => {
                setIsTabFocused(initialTabPositionValue > tabIndex - 1 && initialTabPositionValue < tabIndex + 1);
            });
        }

        return () => {
            if (!tabPositionAnimation) {
                return;
            }
            tabPositionAnimation.removeListener(listenerId);
        };
    }, [tabIndex, tabPositionAnimation]);

    return isTabFocused && isPageFocused;
}

export default useTabNavigatorFocus;
