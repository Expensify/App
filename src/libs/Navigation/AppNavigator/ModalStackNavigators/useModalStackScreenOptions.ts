import type {ParamListBase} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import {useCallback, useContext} from 'react';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import type {PlatformStackNavigationOptions, PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';

function useModalStackScreenOptions() {
    const styles = useThemeStyles();

    // We have to use isSmallScreenWidth, otherwise the content of RHP 'jumps' on Safari - its width is set to size of screen and only after rerender it is set to the correct value
    // It works as intended on other browsers
    // https://github.com/Expensify/App/issues/63747
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {wideRHPRouteKeys} = useContext(WideRHPContext);
    const cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

    return useCallback<({route}: {route: PlatformStackRouteProp<ParamListBase, string>}) => PlatformStackNavigationOptions>(
        ({route}) => {
            let width;

            if (isSmallScreenWidth) {
                width = '100%';
            } else if (wideRHPRouteKeys.includes(route.key)) {
                // For the wide rhp screen
                width = variables.sideBarWidth + variables.receiptPanelRHPWidth;
            } else {
                width = variables.sideBarWidth;
            }

            return {
                ...hideKeyboardOnSwipe,
                headerShown: false,
                animationTypeForReplace: 'pop',
                native: {
                    contentStyle: styles.navigationScreenCardStyle,
                },
                web: {
                    cardStyle: {
                        ...styles.navigationScreenCardStyle,
                        width,
                        position: 'fixed',
                        right: 0,
                    },
                    cardStyleInterpolator,
                },
            };
        },
        [cardStyleInterpolator, isSmallScreenWidth, styles.navigationScreenCardStyle, wideRHPRouteKeys],
    );
}

export default useModalStackScreenOptions;
