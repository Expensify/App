import {useTabBarBlurTargetActions} from '@components/Navigation/NavigationTabBar/TabBarBlur/TabBarBlurTargetContext';

import useThemeStyles from '@hooks/useThemeStyles';

import type {View} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {BlurTargetView} from 'expo-blur';
import React, {useEffect, useRef} from 'react';

import type TabBarBlurTargetProps from './types';

/**
 * Wraps a tab scene in the view the floating tab bar's blur samples from. The blur has to point at a sibling of
 * itself, not a parent, so the scene is the target and the bar stays outside it.
 */
function TabBarBlurTarget({children}: TabBarBlurTargetProps) {
    const styles = useThemeStyles();
    const targetRef = useRef<View>(null);
    const isFocused = useIsFocused();
    const {setBlurTarget} = useTabBarBlurTargetActions();

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        setBlurTarget(targetRef);
    }, [isFocused, setBlurTarget]);

    return (
        <BlurTargetView
            ref={targetRef}
            style={styles.flex1}
            collapsable={false}
        >
            {children}
        </BlurTargetView>
    );
}

export default TabBarBlurTarget;
