/* eslint-disable react/jsx-props-no-spreading */
import React, {useEffect, useMemo} from 'react';
import {
    useSharedValue, interpolateColor, useDerivedValue, withSpring,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import ThemeContext from './ThemeContext';
import useIsLightMode from './useIsLightMode';

// Going to eventually import the light theme here too
import darkTheme from './default';

// Temporarily add a light theme here
const lightTheme = {
    appBG: '#F9F4F0',
    text: '#001F40',
};

const useAnimatedThemeColor = (animation, lightColor, darkColor) => useDerivedValue(() => interpolateColor(animation.value, [0, 1], [lightColor, darkColor]), [lightColor, darkColor]);

const propTypes = {
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props) {
    const lightMode = useIsLightMode();
    const themeAnimation = useSharedValue(0);

    const appBG = useAnimatedThemeColor(themeAnimation, lightTheme.appBG, darkTheme.appBG);
    const text = useAnimatedThemeColor(themeAnimation, lightTheme.text, darkTheme.text);

    const theme = useMemo(
        () => ({
            // Once every color is defined in light theme, we can stop spreading the dark theme here
            ...darkTheme,
            appBG,
            text,
        }),
        [appBG, text],
    );

    // Setting the correct theme initially
    useEffect(() => {
        if (lightMode) {
            themeAnimation.value = 0;
        } else { themeAnimation.value = 1; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animating the color values based on the current theme
    useEffect(() => {
        if (lightMode && themeAnimation.value === 1) {
            themeAnimation.value = withSpring(0);
        } else if (!lightMode && themeAnimation.value === 0) { themeAnimation.value = withSpring(1); }
    }, [lightMode, themeAnimation]);

    return (
        <ThemeContext.Provider value={theme}>
            {props.children}
        </ThemeContext.Provider>
    );
}
ThemeProvider.propTypes = propTypes;
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
