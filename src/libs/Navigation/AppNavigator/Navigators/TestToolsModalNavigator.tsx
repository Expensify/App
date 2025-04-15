import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import TestToolsModalPage from '@components/TestToolsModalPage';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {TestToolsModalModalNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

const Stack = createPlatformStackNavigator<TestToolsModalModalNavigatorParamList>();

function TestToolsModalNavigator() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <NoDropZone>
            <Overlay />
            <View style={styles.TestToolsNavigatorOuterView(isSmallScreenWidth)}>
                <View style={styles.TestToolsNavigatorInnerView(isSmallScreenWidth)}>
                    <Stack.Navigator screenOptions={{headerShown: false}}>
                        <Stack.Screen
                            name={SCREENS.TEST_TOOLS_MODAL.ROOT}
                            component={TestToolsModalPage}
                        />
                    </Stack.Navigator>
                </View>
            </View>
        </NoDropZone>
    );
}

TestToolsModalNavigator.displayName = 'TestToolsModalNavigator';

export default TestToolsModalNavigator;
