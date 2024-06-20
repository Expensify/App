import type {StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ThemeStyles} from '@src/styles';

function useModalScreenOptions(getScreenOptions?: (styles: ThemeStyles) => StackNavigationOptions) {
    const styles = useThemeStyles();

    const defaultSubRouteOptions = useMemo(
        (): StackNavigationOptions => ({
            cardStyle: styles.navigationScreenCardStyle,
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }),
        [styles],
    );

    return getScreenOptions?.(styles) ?? defaultSubRouteOptions;
}

export default useModalScreenOptions;
