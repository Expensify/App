import {CardStyleInterpolators} from '@react-navigation/stack';
import styles from '../../../styles/styles';

const RHPScreenOptions = {
    headerShown: false,
    animationEnabled: false,
    gestureDirection: 'horizontal',
    cardStyle: styles.navigationScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export default RHPScreenOptions;
