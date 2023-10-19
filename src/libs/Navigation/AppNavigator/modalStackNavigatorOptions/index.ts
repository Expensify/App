import {CardStyleInterpolators, StackNavigationOptions} from '@react-navigation/stack';
import styles from '../../../../styles/styles';

const defaultSubRouteOptions: StackNavigationOptions = {
    cardStyle: styles.navigationScreenCardStyle,
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

export default defaultSubRouteOptions;
