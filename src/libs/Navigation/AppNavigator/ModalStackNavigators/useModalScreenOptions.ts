import {useMemo} from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/createPlatformStackNavigator/types';
import type {ThemeStyles} from '@src/styles';
import subRouteOptions from './modalStackNavigatorOptions';

function useModalScreenOptions(getScreenOptions?: (styles: ThemeStyles) => PlatformStackNavigationOptions) {
    const styles = useThemeStyles();

    const defaultSubRouteOptions = useMemo(
        (): PlatformStackNavigationOptions => ({
            ...subRouteOptions,
            ...hideKeyboardOnSwipe,
            cardStyle: styles.navigationScreenCardStyle,
        }),
        [styles],
    );

    return getScreenOptions?.(styles) ?? defaultSubRouteOptions;
}

export default useModalScreenOptions;
