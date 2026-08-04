import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    return (
        <AccessOrNotFoundWrapper policyID={route.params.policyID}>
            <WorkspaceNewRoomPage policyID={route.params.policyID} />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceRoomCreatePage;
