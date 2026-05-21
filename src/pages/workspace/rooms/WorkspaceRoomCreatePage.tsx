import React from 'react';
import {setRoomIDToHighlightOnRoomsPage} from '@libs/actions/Policy/Room';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    const policyID = route.params.policyID;

    const handleAfterRoomCreated = (reportID: string) => {
        setRoomIDToHighlightOnRoomsPage(reportID);
        Navigation.navigate(ROUTES.WORKSPACE_ROOMS.getRoute(policyID));
    };

    return (
        <WorkspaceNewRoomPage
            policyID={policyID}
            onAfterRoomCreated={handleAfterRoomCreated}
        />
    );
}

export default WorkspaceRoomCreatePage;
