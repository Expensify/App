import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';

function getOnboardingModalScreenOptions(isSmallScreenWidth: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType, shouldUseNarrowLayout: boolean) {
    return getRootNavigatorScreenOptions(isSmallScreenWidth, styles, StyleUtils).onboardingModalNavigator(shouldUseNarrowLayout);
}

export default getOnboardingModalScreenOptions;
