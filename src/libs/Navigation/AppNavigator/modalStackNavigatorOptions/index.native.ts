import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import styles from '../../../../styles/styles';

const defaultSubRouteOptions: NativeStackNavigationOptions = {
    contentStyle: styles.navigationScreenCardStyle,
    headerShown: false,
    animation: 'slide_from_right',
};

export default defaultSubRouteOptions;
