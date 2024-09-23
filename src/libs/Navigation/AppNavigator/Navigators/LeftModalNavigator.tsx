import React, {useMemo} from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ModalNavigatorScreenOptions from '@libs/Navigation/AppNavigator/ModalNavigatorScreenOptions';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, LeftModalNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import Overlay from './Overlay';

type LeftModalNavigatorProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.LEFT_MODAL_NAVIGATOR>;

const loadChatFinder = () => require<ReactComponentModule>('../../../../pages/ChatFinderPage').default;
const loadWorkspaceSwitcherPage = () => require<ReactComponentModule>('../../../../pages/WorkspaceSwitcherPage').default;

const Stack = createPlatformStackNavigator<LeftModalNavigatorParamList>();

function LeftModalNavigator({navigation}: LeftModalNavigatorProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const screenOptions = useMemo(() => ModalNavigatorScreenOptions(styles, 'horizontal-inverted'), [styles]);

    return (
        <NoDropZone>
            {!shouldUseNarrowLayout && (
                <Overlay
                    isModalOnTheLeft
                    onPress={navigation.goBack}
                />
            )}
            <View style={styles.LHPNavigatorContainer(shouldUseNarrowLayout)}>
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
