import {CardStyleInterpolators} from '@react-navigation/stack';

/**
 * RHP stack navigator screen options generator function
 * @function
 * @param {Object} styles - The styles object
 * @returns {Object} - The screen options object
 */
const RHPScreenOptions = (styles) => ({
    headerShown: false,
    animationEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: styles.navigationScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
});

export default RHPScreenOptions;
