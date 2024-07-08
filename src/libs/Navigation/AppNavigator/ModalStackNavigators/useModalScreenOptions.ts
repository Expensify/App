import type {StackCardInterpolationProps, StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isSafari} from '@libs/Browser';
import createModalCardStyleInterpolator from '@navigation/AppNavigator/createModalCardStyleInterpolator';
import type {ThemeStyles} from '@src/styles';

function useModalScreenOptions(getScreenOptions?: (styles: ThemeStyles) => StackNavigationOptions) {
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();

    let cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

    if (isSafari()) {
        const customInterpolator = createModalCardStyleInterpolator(styleUtils);
        cardStyleInterpolator = (props: StackCardInterpolationProps) => customInterpolator(isSmallScreenWidth, false, false, props);
    }

    const defaultSubRouteOptions = useMemo(
        (): StackNavigationOptions => ({
            cardStyle: styles.navigationScreenCardStyle,
            headerShown: false,
            cardStyleInterpolator,
        }),
        [styles, cardStyleInterpolator],
    );

    return getScreenOptions?.(styles) ?? defaultSubRouteOptions;
}

export default useModalScreenOptions;
