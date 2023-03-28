/* eslint-disable react/jsx-props-no-spreading */
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {
    useSharedValue, interpolateColor, useDerivedValue, withSpring,
} from 'react-native-reanimated';
import ThemeContext from './ThemeContext';
import useIsLightMode from './useIsLightMode';
import defaultColors from './default';

function ThemeProvider(props) {
    const lightMode = useIsLightMode();
    const themeAnimation = useSharedValue(0);

    const {appBG: appBGDark, ...restOfTheme} = defaultColors;

    const appBG = useDerivedValue(() => interpolateColor(themeAnimation, [0, 1], ['#ffffff', appBGDark]));

    const theme = useMemo(
        () => ({
            appBG,
            ...restOfTheme,
        }),
        [appBG, restOfTheme],
    );

    // Setting the correct theme initially
    useEffect(() => {
        if (lightMode) {
            themeAnimation.value = 0;
        } else { themeAnimation.value = 0; }
    }, []);

    // Animating the color values based on the current theme
    useEffect(() => {
        if (lightMode && themeAnimation.value === 1) {
            themeAnimation.value = withSpring(0);
        } else if (themeAnimation.value === 0) { themeAnimation.value = 0; }
    }, [lightMode]);

    return (
        <ThemeContext.Provider value={theme}>
            <View {...props} />
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
