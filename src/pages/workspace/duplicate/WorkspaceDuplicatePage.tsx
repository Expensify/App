import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
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

    useEffect(clearDuplicateWorkspace, []);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="WorkspaceDuplicatePage"
            >
                <WorkspaceDuplicateForm policyID={policyID} />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceDuplicatePage;
