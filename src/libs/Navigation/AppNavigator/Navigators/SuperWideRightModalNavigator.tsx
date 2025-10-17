import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, SuperWideRightModalNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import {NarrowPaneContextProvider} from './NarrowPaneContext';
import Overlay from './Overlay';

const loadSearchMoneyReportPage = () => require<ReactComponentModule>('@pages/Search/SearchMoneyRequestReportPage').default;

type SuperWideRightModalNavigatorProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.SUPER_WIDE_RIGHT_MODAL_NAVIGATOR>;

const Stack = createPlatformStackNavigator<SuperWideRightModalNavigatorParamList, string>();

function SuperWideRightModalNavigator({navigation}: SuperWideRightModalNavigatorProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isExecutingRef = useRef<boolean>(false);
    const screenOptions = useRHPScreenOptions();
    const {windowWidth} = useWindowDimensions();

    const handleOverlayPress = useCallback(() => {
        if (isExecutingRef.current) {
            return;
        }
        isExecutingRef.current = true;
        navigation.goBack();
        setTimeout(() => {
            isExecutingRef.current = false;
        }, CONST.ANIMATED_TRANSITION);
    }, [navigation]);

    return (
        <NarrowPaneContextProvider>
            <NoDropZone>
                {!shouldUseNarrowLayout && <Overlay onPress={handleOverlayPress} />}
                {/* This one is to limit the outer Animated.View and allow the background to be pressable */}
                {/* Without it, the transparent half of the narrow format RHP card would cover the pressable part of the overlay */}
                <View style={[styles.pAbsolute, styles.r0, styles.h100, styles.superWideRHPNavigatorContainerWidth(shouldUseNarrowLayout, windowWidth)]}>
                    <Stack.Navigator
                        screenOptions={screenOptions}
                        id={NAVIGATORS.SUPER_WIDE_RIGHT_MODAL_NAVIGATOR}
                    >
                        <Stack.Screen
                            name={SCREENS.SEARCH.MONEY_REQUEST_REPORT}
                            getComponent={loadSearchMoneyReportPage}
                        />
                    </Stack.Navigator>
                </View>
            </NoDropZone>
        </NarrowPaneContextProvider>
    );
}

SuperWideRightModalNavigator.displayName = 'SuperWideRightModalNavigator';

export default SuperWideRightModalNavigator;
