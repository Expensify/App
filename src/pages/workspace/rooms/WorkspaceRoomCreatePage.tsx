import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';
import type SCREENS from '@src/SCREENS';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    return <WorkspaceNewRoomPage policyID={route.params.policyID} />;
}

export default WorkspaceRoomCreatePage;
