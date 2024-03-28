import type {StackNavigationOptions} from '@react-navigation/stack';
// eslint-disable-next-line no-restricted-imports
import getNavigationModalCardStyle from '@styles/utils/getNavigationModalCardStyles';

const rightModalNavigatorOptions = (isSmallScreenWidth: boolean): StackNavigationOptions => ({
    presentation: 'transparentModal',

    // We want pop in RHP since there are some flows that would work weird otherwise
    animationTypeForReplace: 'pop',
    cardStyle: {
        ...getNavigationModalCardStyle(),

        // This is necessary to cover translated sidebar with overlay.
        width: isSmallScreenWidth ? '100%' : '200%',
        // Excess space should be on the left so we need to position from right.
        right: 0,
    },
});

export default rightModalNavigatorOptions;
