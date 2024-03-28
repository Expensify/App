import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

const rightModalNavigatorOptions = (): NativeStackNavigationOptions => ({
    presentation: 'card',
    animation: 'slide_from_right',
});

export default rightModalNavigatorOptions;
