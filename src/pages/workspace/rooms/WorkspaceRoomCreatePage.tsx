import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceNewRoomPage from '@pages/workspace/WorkspaceNewRoomPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type WorkspaceRoomCreatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ROOM_CREATE>;

function WorkspaceRoomCreatePage({route}: WorkspaceRoomCreatePageProps) {
    const policy = usePolicy(route.params.policyID);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            shouldBeBlocked={!canMemberWrite(policy, session?.email ?? '', CONST.POLICY.POLICY_FEATURE.ROOMS)}
        >
            <WorkspaceNewRoomPage policyID={route.params.policyID} />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceRoomCreatePage;
