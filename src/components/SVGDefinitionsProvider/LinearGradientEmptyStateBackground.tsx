import React from 'react';

type LinearGradientEmptyStateBackgroundProps = {
    isDarkTheme?: boolean;
};

/**
 * Global definitions for @assets/images/themeDependent/empty-state_background-fade
 */
function LinearGradientEmptyStateBackground({isDarkTheme}: LinearGradientEmptyStateBackgroundProps) {
    const stopColor1 = isDarkTheme ? '#1a3d32' : '#e6e1da';
    const stopColor2 = isDarkTheme ? '#061b09' : '#fcfbf9';
    return (
        <linearGradient
            id={`empty-state_background-fade-${isDarkTheme ? 'dark' : 'light'}_svg__a`}
            x1="1947"
            y1="1044.5"
            x2="1947"
            y2=".89"
            gradientTransform="translate(0 1044.5) scale(1 -1)"
            gradientUnits="userSpaceOnUse"
        >
            <stop
                offset="0"
                stopColor={stopColor1}
            />
            <stop
                offset="1"
                stopColor={stopColor2}
            />
        </linearGradient>
    );
}

export default LinearGradientEmptyStateBackground;
