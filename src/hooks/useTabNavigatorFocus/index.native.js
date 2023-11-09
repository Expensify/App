import {useTabAnimation} from '@react-navigation/material-top-tabs';
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import CONST from '@src/CONST';

/**
 * Custom React hook to determine the focus status of a specific tab in a Material Top Tab Navigator, with additional
 * conditions based on a selected tab state. It evaluates whether the specified tab is focused by combining the tab's
 * animation position and the screen's focus status within a React Navigation environment.
 *
 * The hook is primarily intended for use with Material Top Tabs provided by '@react-navigation/material-top-tabs'.
 * It utilizes the `useTabAnimation` hook from this package to track the animated position of the tabs and the
 * `useIsFocused` hook from '@react-navigation/native' to determine if the current screen is focused. Additionally,
 * it uses a `selectedTab` parameter to apply custom logic based on the currently selected tab.
 *
 * Note: This hook employs a conditional invocation of the `useTabAnimation` hook, which is generally against React's
 * rules of hooks. This pattern is used here to handle scenarios where the hook might not be employed within a
 * Material Top Tabs Navigator context. Ensure this hook is only used in appropriate scenarios to avoid potential issues.
 *
 * @param {Object} params - The parameters object.
 * @param {number} params.tabIndex - The index of the tab for which focus status is being determined.
 * @param {string} params.selectedTab - The tab identifier passed by <TopTab.Screen /> to the component. Used only on native platform
 *
 * @returns {boolean} Returns `true` if the specified tab is both animation-focused and screen-focused, otherwise `false`.
 *
 * @example
 * const isTabFocused = useTabNavigatorFocus({ tabIndex: 1, selectedTab: 'home' });
 */
function useTabNavigatorFocus({tabIndex, selectedTab}) {
    let tabPositionAnimation = null;
    try {
        // Retrieve the animation value from the tab navigator, which ranges from 0 to the total number of pages displayed.
        // Even a minimal scroll towards the camera page (e.g., a value of 0.001 at start) should activate the camera for immediate responsiveness.
        // STOP!!!!!!! This is not a pattern to be followed! We are conditionally rendering this hook becase when used in the edit flow we'll never be inside a tab navigator.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        tabPositionAnimation = useTabAnimation();
    } catch (error) {
        tabPositionAnimation = null;
    }
    const isPageFocused = useIsFocused();
    // set to true if the hook is not used within the MaterialTopTabs context
    // the hook will then return true if the screen is focused
    const [isTabFocused, setIsTabFocused] = useState(!tabPositionAnimation);

    // Retrieve the animation value from the tab navigator, which ranges from 0 to the total number of pages displayed.
    // Even a minimal scroll towards the camera page (e.g., a value of 0.001 at start) should activate the camera for immediate responsiveness.

    // STOP!!!!!!! This is not a pattern to be followed! We are conditionally rendering this hook becase when used in the edit flow we'll never be inside a tab navigator.
    // eslint-disable-next-line react-hooks/rules-of-hooks

    useEffect(() => {
        if (!tabPositionAnimation) {
            return;
        }

        const listenerId = tabPositionAnimation.addListener(({value}) => {
            if (selectedTab !== CONST.TAB.SCAN) {
                return;
            }
            // Activate camera as soon the index is animating towards the `cameraTabIndex`
            setIsTabFocused(value > tabIndex - 1 && value < tabIndex + 1);
        });

        return () => {
            if (!tabPositionAnimation) {
                return;
            }
            tabPositionAnimation.removeListener(listenerId);
        };
    }, [tabIndex, tabPositionAnimation, selectedTab]);

    return isTabFocused && isPageFocused;
}

export default useTabNavigatorFocus;
