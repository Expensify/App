import {useRoute} from '@react-navigation/native';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import usePermissions from '@hooks/usePermissions';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import WorkspaceDuplicateSelectFeaturesForm from './WorkspaceDuplicateSelectFeaturesForm';

function WorkspaceDuplicateSelectFeaturesPage() {
    const route = useRoute<PlatformStackRouteProp<WorkspaceDuplicateNavigatorParamList, typeof SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES>>();
    const policyID = route?.params?.policyID;
    const {isBetaEnabled} = usePermissions();
    const isDuplicatedWorkspaceEnabled = isBetaEnabled(CONST.BETAS.DUPLICATE_WORKSPACE);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            shouldBeBlocked={!isDuplicatedWorkspaceEnabled}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID={WorkspaceDuplicateSelectFeaturesPage.displayName}
            >
                <WorkspaceDuplicateSelectFeaturesForm policyID={policyID} />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceDuplicateSelectFeaturesPage.displayName = 'WorkspaceDuplicateSelectFeaturesPage';

export default WorkspaceDuplicateSelectFeaturesPage;
