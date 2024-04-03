import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import createCustomFullScreenNavigator from '@libs/Navigation/AppNavigator/createCustomFullScreenNavigator';
import getRootNavigatorScreenOptions from '@libs/Navigation/AppNavigator/getRootNavigatorScreenOptions';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import SCREENS from '@src/SCREENS';

const loadWorkspaceInitialPage = () => require('../../../../pages/workspace/WorkspaceInitialPage').default as React.ComponentType;

const RootStack = createCustomFullScreenNavigator();

function FullScreenNavigator() {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth, styles, StyleUtils);

    return (
        <FocusTrapForScreens>
            <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
                <RootStack.Navigator>
                    <RootStack.Screen
                        name={SCREENS.WORKSPACE.INITIAL}
                        options={screenOptions.homeScreen}
                        getComponent={loadWorkspaceInitialPage}
                    />
                    <RootStack.Screen
                        name={SCREENS.WORKSPACES_CENTRAL_PANE}
                        options={screenOptions.centralPaneNavigator}
                        component={ModalStackNavigators.WorkspaceSettingsModalStackNavigator}
                    />
                </RootStack.Navigator>
            </View>
        </FocusTrapForScreens>
    );
}

FullScreenNavigator.displayName = 'FullScreenNavigator';

export default FullScreenNavigator;
