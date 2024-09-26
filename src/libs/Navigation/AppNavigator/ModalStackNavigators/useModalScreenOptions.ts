import type {StackCardInterpolationProps} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import createModalCardStyleInterpolator from '@navigation/AppNavigator/createModalCardStyleInterpolator';
import type {ThemeStyles} from '@src/styles';

type GetModalStackScreenOptions = (styles: ThemeStyles) => PlatformStackNavigationOptions;

function useModalScreenOptions(getScreenOptions?: GetModalStackScreenOptions) {
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    let cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

    if (isSafari()) {
        const customInterpolator = createModalCardStyleInterpolator(styleUtils);
        cardStyleInterpolator = (props: StackCardInterpolationProps) => customInterpolator(shouldUseNarrowLayout, false, false, props);
    }

    const defaultSubRouteOptions = useMemo(
        (): PlatformStackNavigationOptions => ({
            ...hideKeyboardOnSwipe,
            headerShown: false,
            web: {
                cardStyle: styles.navigationScreenCardStyle,
                cardStyleInterpolator,
            },
        }),
        [cardStyleInterpolator, styles.navigationScreenCardStyle],
    );

    return getScreenOptions?.(styles) ?? defaultSubRouteOptions;
}

export default useModalScreenOptions;
export type {GetModalStackScreenOptions};
