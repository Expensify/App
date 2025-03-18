import React from 'react';
import {View} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useCustomScreenOptions from '@libs/Navigation/AppNavigator/useCustomScreenOptions';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ConsoleNavigatorParamList, PublicScreensParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import Overlay from './Overlay';

type PublicRightModalNavigatorComponentProps = PlatformStackScreenProps<PublicScreensParamList, typeof NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR>;

const Stack = createPlatformStackNavigator<ConsoleNavigatorParamList>();

function PublicRightModalNavigatorComponent({navigation}: PublicRightModalNavigatorComponentProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const screenOptions = useCustomScreenOptions();

    return (
        <NoDropZone>
            {!shouldUseNarrowLayout && <Overlay onPress={navigation.goBack} />}
            <View style={styles.RHPNavigatorContainer(shouldUseNarrowLayout)}>
                <Stack.Navigator
                    screenOptions={screenOptions}
                    id={NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR}
                >
                    <Stack.Screen
                        name={SCREENS.PUBLIC_CONSOLE_DEBUG}
                        component={ModalStackNavigators.ConsoleModalStackNavigator}
                    />
                </Stack.Navigator>
            </View>
        </NoDropZone>
    );
}

export default PublicRightModalNavigatorComponent;
