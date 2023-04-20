/* eslint-disable react/jsx-props-no-spreading */
import React, {useEffect, useMemo} from 'react';
import {
    useSharedValue, interpolateColor, useDerivedValue, withSpring,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import ThemeContext from './ThemeContext';
import useIsLightMode from './useIsLightMode';
import defaultColors from './default';

const useAnimatedThemeColor = (animation, lightColor, darkColor) => useDerivedValue(() => interpolateColor(animation.value, [0, 1], [lightColor, darkColor]), [lightColor, darkColor]);

const propTypes = {
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props) {
    const lightMode = useIsLightMode();
    const themeAnimation = useSharedValue(0);

    // Going to import the light theme here too
    const {appBG: appBGDark, text: textDark, ...restOfDarkTheme} = defaultColors;

    const appBG = useAnimatedThemeColor(themeAnimation, '#F9F4F0', appBGDark);
    const text = useAnimatedThemeColor(themeAnimation, '#001F40', textDark);

    const theme = useMemo(
        () => ({
            appBG,
            text,

            // Once every color is set in light theme, we can stop spreading the dark theme here
            ...restOfDarkTheme,
        }),
        [appBG, restOfDarkTheme, text],
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
