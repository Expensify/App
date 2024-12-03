import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';

function getOnboardingModalScreenOptions(isSmallScreenWidth: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType) {
    return {
        ...getRootNavigatorScreenOptions(isSmallScreenWidth, styles, StyleUtils).fullScreen,
        gestureEnabled: false,
    };
}

export default getOnboardingModalScreenOptions;
