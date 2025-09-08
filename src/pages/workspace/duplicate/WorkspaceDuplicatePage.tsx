import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import usePermissions from '@hooks/usePermissions';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearDuplicateWorkspace} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceDuplicateForm from './WorkspaceDuplicateForm';

function WorkspaceDuplicatePage() {
    const route = useRoute<PlatformStackRouteProp<WorkspaceDuplicateNavigatorParamList, typeof SCREENS.WORKSPACE_DUPLICATE.ROOT>>();
    const policyID = route?.params?.policyID;
    const {isBetaEnabled} = usePermissions();
    const isDuplicatedWorkspaceEnabled = isBetaEnabled(CONST.BETAS.DUPLICATE_WORKSPACE);

    useEffect(clearDuplicateWorkspace, []);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            shouldBeBlocked={!isDuplicatedWorkspaceEnabled}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={WorkspaceDuplicatePage.displayName}
            >
                <WorkspaceDuplicateForm policyID={policyID} />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceDuplicatePage.displayName = 'WorkspaceDuplicatePage';

export default WorkspaceDuplicatePage;
