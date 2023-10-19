import {StackNavigationOptions} from '@react-navigation/stack';
import getNavigationModalCardStyle from '../../../../styles/getNavigationModalCardStyles';
import modalCardStyleInterpolator from '../modalCardStyleInterpolator';

const rightModalNavigatorOptions = (isSmallScreenWidth: boolean): StackNavigationOptions => ({
    cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),
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
