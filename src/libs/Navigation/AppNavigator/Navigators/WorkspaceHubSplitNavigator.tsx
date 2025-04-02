import {useRoute} from '@react-navigation/native';
import React from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import type {WorkspaceHubSplitNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadWorkspaceHubInitialPage = () => require<ReactComponentModule>('../../../../pages/workspace/WorkspaceHubInitialPage').default;

type Screens = Partial<Record<keyof WorkspaceHubSplitNavigatorParamList, () => React.ComponentType>>;

const CENTRAL_PANE_WORKSPACE_HUB_SCREENS = {
    [SCREENS.WORKSPACE_HUB.WORKSPACES]: () => require<ReactComponentModule>('../../../../pages/workspace/WorkspacesListPage').default,
    [SCREENS.WORKSPACE_HUB.SUBSCRIPTION.ROOT]: () => require<ReactComponentModule>('../../../../pages/settings/Subscription/SubscriptionSettingsPage').default,
} satisfies Screens;

const Split = createSplitNavigator<WorkspaceHubSplitNavigatorParamList>();

function WorkspaceHubSplitNavigator() {
    const route = useRoute();
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    return (
        <FocusTrapForScreens>
            <Split.Navigator
                persistentScreens={[SCREENS.WORKSPACE_HUB.ROOT]}
                sidebarScreen={SCREENS.WORKSPACE_HUB.ROOT}
                defaultCentralScreen={SCREENS.WORKSPACE_HUB.WORKSPACES}
                parentRoute={route}
                screenOptions={splitNavigatorScreenOptions.centralScreen}
            >
                <Split.Screen
                    name={SCREENS.WORKSPACE_HUB.ROOT}
                    getComponent={loadWorkspaceHubInitialPage}
                    options={splitNavigatorScreenOptions.sidebarScreen}
                />
                {Object.entries(CENTRAL_PANE_WORKSPACE_HUB_SCREENS).map(([screenName, componentGetter]) => {
                    return (
                        <Split.Screen
                            key={screenName}
                            name={screenName as keyof Screens}
                            getComponent={componentGetter}
                        />
                    );
                })}
            </Split.Navigator>
        </FocusTrapForScreens>
    );
}

WorkspaceHubSplitNavigator.displayName = 'WorkspaceHubSplitNavigator';

export {CENTRAL_PANE_WORKSPACE_HUB_SCREENS};
export default WorkspaceHubSplitNavigator;
