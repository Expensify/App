/* eslint-disable react/jsx-props-no-spreading */
import React, {useEffect, useMemo} from 'react';
import {
    useSharedValue, interpolateColor, useDerivedValue, withSpring,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import ThemeContext from './ThemeContext';
import useIsLightMode from './useIsLightMode';
import defaultColors from './default';

const propTypes = {
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props) {
    const lightMode = useIsLightMode();
    const themeAnimation = useSharedValue(0);

    const {appBG: appBGDark, ...restOfTheme} = defaultColors;

    const appBG = useDerivedValue(() => interpolateColor(themeAnimation.value, [0, 1], ['#FFFFFF', appBGDark]));

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
