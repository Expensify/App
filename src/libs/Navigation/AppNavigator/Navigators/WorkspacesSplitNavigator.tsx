import React from 'react';
import {View} from 'react-native';
import FocusTrapForScreen from '@components/FocusTrap/FocusTrapForScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import {WorkspacesSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import ReactComponentModule from '@src/types/utils/ReactComponentModule';
import createSplitNavigator from '../createSplitNavigator';
import useSplitNavigatorScreenOptions from '../useSplitNavigatorScreenOptions';

const Split = createSplitNavigator<WorkspacesSplitNavigatorParamList>();

const loadWorkspacesInitialPage = () => require<ReactComponentModule>('../../../../pages/workspace/WorkspacesInitialPage').default;
const loadWorkspacesListPage = () => require<ReactComponentModule>('../../../../pages/workspace/WorkspacesListPage').default;
const loadDomainsListPage = () => require<ReactComponentModule>('../../../../pages/domain/DomainsListPage').default;

type WorkspacesSplitNavigatorProps = {};

export default function WorkspacesSplitNavigator({}: WorkspacesSplitNavigatorProps) {
    const styles = useThemeStyles();
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    return (
        <FocusTrapForScreen>
            <View style={styles.flex1}>
                <Split.Navigator
                    persistentScreens={[SCREENS.WORKSPACES_INITIAL]}
                    sidebarScreen={SCREENS.WORKSPACES_INITIAL}
                    defaultCentralScreen={SCREENS.WORKSPACES_LIST}
                    screenOptions={splitNavigatorScreenOptions.centralScreen}
                >
                    <Split.Screen
                        name={SCREENS.WORKSPACES_INITIAL}
                        getComponent={loadWorkspacesInitialPage}
                        options={splitNavigatorScreenOptions.sidebarScreen}
                    />
                    <Split.Screen
                        name={SCREENS.WORKSPACES_LIST}
                        getComponent={loadWorkspacesListPage}
                        options={splitNavigatorScreenOptions.centralScreen}
                    />
                    <Split.Screen
                        name={SCREENS.WORKSPACES_DOMAINS}
                        getComponent={loadDomainsListPage}
                        options={splitNavigatorScreenOptions.centralScreen}
                    />
                </Split.Navigator>
            </View>
        </FocusTrapForScreen>
    );
}
