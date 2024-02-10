import type {StackScreenProps} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import type {AuthScreensParamList, LeftModalNavigatorParamList} from '@libs/Navigation/types';
import type NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type LeftModalNavigatorProps = StackScreenProps<AuthScreensParamList, typeof NAVIGATORS.LEFT_MODAL_NAVIGATOR>;

const Stack = createStackNavigator<LeftModalNavigatorParamList>();

function LeftModalNavigator({navigation}: LeftModalNavigatorProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const screenOptions = useMemo(() => ModalNavigatorScreenOptions(styles), [styles]);

    return (
        <NoDropZone>
            {!shouldUseNarrowLayout && (
                <Overlay
                    isModalOnTheLeft
                    onPress={navigation.goBack}
                />
            )}
            <View style={styles.LHPNavigatorContainer(shouldUseNarrowLayout)}>
                <Stack.Navigator screenOptions={screenOptions}>
                    <Stack.Screen
                        name={SCREENS.LEFT_MODAL.SEARCH}
                        component={ModalStackNavigators.SearchModalStackNavigator}
                    />
                    <Stack.Screen
                        name={SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER}
                        component={ModalStackNavigators.WorkspaceSwitcherModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

LeftModalNavigator.displayName = 'LeftModalNavigator';

export default LeftModalNavigator;
