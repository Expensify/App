import {CardStyleInterpolators, StackNavigationOptions} from '@react-navigation/stack';
import styles from '@styles/styles';

/**
 * RHP stack navigator screen options generator function
 * @param themeStyles - The styles object
 * @returns The screen options object
 */
const RHPScreenOptions = (themeStyles: typeof styles): StackNavigationOptions => ({
    headerShown: false,
    animationEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: themeStyles.navigationScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
});

export default RHPScreenOptions;
