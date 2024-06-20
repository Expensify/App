import type {StackScreenProps} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import type {AuthScreensParamList, LeftModalNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type LeftModalNavigatorProps = StackScreenProps<AuthScreensParamList, typeof NAVIGATORS.LEFT_MODAL_NAVIGATOR>;

const loadChatFinder = () => require('../../../../pages/ChatFinderPage').default as React.ComponentType;
const loadWorkspaceSwitcherPage = () => require('../../../../pages/WorkspaceSwitcherPage').default as React.ComponentType;

const Stack = createStackNavigator<LeftModalNavigatorParamList>();

function LeftModalNavigator({navigation}: LeftModalNavigatorProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = useMemo(() => ModalNavigatorScreenOptions(styles, 'horizontal-inverted'), [styles]);

    return (
        <NoDropZone>
            {!isSmallScreenWidth && (
                <Overlay
                    isModalOnTheLeft
                    onPress={navigation.goBack}
                />
            )}
            <View style={styles.LHPNavigatorContainer(isSmallScreenWidth)}>
                <Stack.Navigator
                    screenOptions={screenOptions}
                    id={NAVIGATORS.LEFT_MODAL_NAVIGATOR}
                >
                    <Stack.Screen
                        name={SCREENS.LEFT_MODAL.CHAT_FINDER}
                        getComponent={loadChatFinder}
                    />
                    <Stack.Screen
                        name={SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER}
                        getComponent={loadWorkspaceSwitcherPage}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

LeftModalNavigator.displayName = 'LeftModalNavigator';

export default LeftModalNavigator;
