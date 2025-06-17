import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import type {ThemeStyles} from '@src/styles';

type GetModalStackScreenOptions = (styles: ThemeStyles) => PlatformStackNavigationOptions;

function useModalStackScreenOptions(getScreenOptions?: GetModalStackScreenOptions) {
    const styles = useThemeStyles();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

    const defaultSubRouteOptions = useMemo(
        (): PlatformStackNavigationOptions => ({
            ...hideKeyboardOnSwipe,
            headerShown: false,
            animationTypeForReplace: 'pop',
            native: {
                contentStyle: styles.navigationScreenCardStyle,
            },
            web: {
                cardStyle: {
                    ...styles.navigationScreenCardStyle,
                    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
                },
                cardStyleInterpolator,
            },
        }),
        [cardStyleInterpolator, isSmallScreenWidth, styles.navigationScreenCardStyle],
    );

    if (!getScreenOptions) {
        return defaultSubRouteOptions;
    }

    return {...defaultSubRouteOptions, ...getScreenOptions(styles)};
}

export default useModalStackScreenOptions;
export type {GetModalStackScreenOptions};
