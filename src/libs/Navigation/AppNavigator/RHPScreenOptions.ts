import {CardStyleInterpolators, StackNavigationOptions} from '@react-navigation/stack';
import styles from '../../../styles/styles';

const RHPScreenOptions = {
    headerShown: false,
    animationEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: styles.navigationScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
} as StackNavigationOptions;

export default RHPScreenOptions;
