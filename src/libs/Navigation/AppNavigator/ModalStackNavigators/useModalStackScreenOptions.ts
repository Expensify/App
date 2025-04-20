import type {StackCardInterpolationProps} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import useModalCardStyleInterpolator from '@navigation/AppNavigator/useModalCardStyleInterpolator';
import type {ThemeStyles} from '@src/styles';

type GetModalStackScreenOptions = (styles: ThemeStyles) => PlatformStackNavigationOptions;

function useModalStackScreenOptions(getScreenOptions?: GetModalStackScreenOptions) {
    const styles = useThemeStyles();
    const customInterpolator = useModalCardStyleInterpolator();

    let cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

    if (isSafari()) {
        cardStyleInterpolator = (props: StackCardInterpolationProps) => customInterpolator({props});
    }

    const defaultSubRouteOptions = useMemo(
        (): PlatformStackNavigationOptions => ({
            ...hideKeyboardOnSwipe,
            headerShown: false,
            animationTypeForReplace: 'pop',
            native: {
                contentStyle: styles.navigationScreenCardStyle,
            },
            web: {
                cardStyle: styles.navigationScreenCardStyle,
                cardStyleInterpolator,
            },
        }),
        [cardStyleInterpolator, styles.navigationScreenCardStyle],
    );

    if (!getScreenOptions) {
        return defaultSubRouteOptions;
    }

    return {...defaultSubRouteOptions, ...getScreenOptions(styles)};
}

export default useModalStackScreenOptions;
export type {GetModalStackScreenOptions};
