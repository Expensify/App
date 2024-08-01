import type {StackNavigationOptions} from '@react-navigation/stack';

const defaultScreenOptions: StackNavigationOptions = {
    cardStyle: {
        overflow: 'visible',
        flex: 1,
    },
    headerShown: false,
    animationTypeForReplace: 'push',
};

export default defaultScreenOptions;
