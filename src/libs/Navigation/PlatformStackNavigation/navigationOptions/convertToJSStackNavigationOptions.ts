import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import type {ParamListBase, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';

import Animations from './animation';

// Animation names here belong to the JS renderer. Native-stack mappings such as iOS's simple_push do not apply.
function getJSStackOptions({animation, web, native, ...common}: PlatformStackNavigationOptions): StackNavigationOptions {
    let animationOptions: StackNavigationOptions = {};
    if (animation !== undefined) {
        animationOptions = {animation};
        if (animation === Animations.NONE) {
            animationOptions.gestureEnabled = false;
        } else if (animation === Animations.SLIDE_FROM_BOTTOM) {
            animationOptions.gestureDirection = 'vertical';
        } else if (animation === Animations.SLIDE_FROM_LEFT) {
            animationOptions.gestureDirection = 'horizontal-inverted';
        } else if (animation === Animations.SLIDE_FROM_RIGHT) {
            animationOptions.gestureDirection = 'horizontal';
        }
    }
    return {...animationOptions, ...common, ...web};
}

function convertToJSStackNavigationOptions(screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined): ScreenOptionsOrCallback<StackNavigationOptions> | undefined {
    if (!screenOptions) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        return (props: PlatformStackScreenProps<ParamListBase, string>) => {
            const routeBasedScreenOptions = screenOptions(props);
            return getJSStackOptions(routeBasedScreenOptions);
        };
    }

    return getJSStackOptions(screenOptions);
}

export default convertToJSStackNavigationOptions;
