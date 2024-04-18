import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import slideFromLeftAnimation from './animationOptions/web/slideFromLeft';
import slideFromRightAnimation from './animationOptions/web/slideFromRight';
import withAnimation from './animationOptions/withAnimation';
import getCommonNavigationOptions from './utils';

const withWebOptions = (screenOptions?: PlatformStackNavigationOptions): StackNavigationOptions => {
    if (screenOptions === undefined) {
        return {};
    }

    return {
        ...withAnimation<StackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, {}),
        ...getCommonNavigationOptions(screenOptions),
    };
};

export default withWebOptions;
