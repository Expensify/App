import type {StackCardInterpolationProps, StackNavigationOptions} from '@react-navigation/stack';
import {useMemo} from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import createModalCardStyleInterpolator from '@navigation/AppNavigator/createModalCardStyleInterpolator';
import type {ThemeStyles} from '@src/styles';

function useModalScreenOptions(getScreenOptions?: (styles: ThemeStyles) => StackNavigationOptions) {
    const styles = useThemeStyles();
    const styleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();

    const customInterpolator = createModalCardStyleInterpolator(styleUtils);

    const defaultSubRouteOptions = useMemo(
        (): StackNavigationOptions => ({
            cardStyle: styles.navigationScreenCardStyle,
            headerShown: false,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => customInterpolator(isSmallScreenWidth, false, false, props),
        }),
        [styles, customInterpolator, isSmallScreenWidth],
    );

    return getScreenOptions?.(styles) ?? defaultSubRouteOptions;
}

export default useModalScreenOptions;
