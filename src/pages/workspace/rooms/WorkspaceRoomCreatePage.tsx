import usePolicy from '@hooks/usePolicy';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isArchivedPolicy} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';

import type SCREENS from '@src/SCREENS';

import React from 'react';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    const policy = usePolicy(route.params.policyID);
    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            shouldBeBlocked={isArchivedPolicy(policy)}
        >
            <WorkspaceNewRoomPage policyID={route.params.policyID} />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceRoomCreatePage;
