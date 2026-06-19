import React from 'react';
import usePermissions from '@hooks/usePermissions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    const {isBetaEnabled} = usePermissions();
    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.WORKSPACE_ROOMS_PAGE)}
        >
            <WorkspaceNewRoomPage policyID={route.params.policyID} />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceRoomCreatePage;
