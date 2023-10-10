import {StackNavigationOptions} from '@react-navigation/stack';

const defaultScreenOptions = {
    cardStyle: {
        overflow: 'visible',
        flex: 1,
    },
    headerShown: false,
    animationTypeForReplace: 'push',
} as StackNavigationOptions;

export default defaultScreenOptions;
