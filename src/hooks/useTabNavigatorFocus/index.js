import {useTabAnimation} from '@react-navigation/material-top-tabs';
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';

function useTabNavigatorFocus({tabIndex}) {
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

    useEffect(() => {
        if (!tabPositionAnimation) {
            return;
        }
        const index = Number(tabIndex);

        const listenerId = tabPositionAnimation.addListener(({value}) => {
            // Activate camera as soon the index is animating towards the `tabIndex`
            requestAnimationFrame(() => {
                setIsTabFocused(value > index - 1 && value < index + 1);
            });
        });

        // We need to get the position animation value on component initialization to determine
        // if the tab is focused or not. Since it's an Animated.Value the only synchronous way
        // to retrieve the value is to use a private method.
        // eslint-disable-next-line no-underscore-dangle
        const initialTabPositionValue = tabPositionAnimation.__getValue();

        if (typeof initialTabPositionValue === 'number') {
            requestAnimationFrame(() => {
                setIsTabFocused(initialTabPositionValue > index - 1 && initialTabPositionValue < index + 1);
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
