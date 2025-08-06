import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import {clearDuplicateWorkspace} from '@userActions/Policy/Policy';
import type SCREENS from '@src/SCREENS';
import WorkspaceDuplicateForm from './WorkspaceDuplicateForm';

function WorkspaceDuplicatePage() {
    const route = useRoute<PlatformStackRouteProp<WorkspaceDuplicateNavigatorParamList, typeof SCREENS.WORKSPACE_DUPLICATE.ROOT>>();
    const policyID = route?.params?.policyID;

    useEffect(clearDuplicateWorkspace, []);

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={WorkspaceDuplicatePage.displayName}
        >
            <WorkspaceDuplicateForm policyID={policyID} />
        </ScreenWrapper>
    );
}

WorkspaceDuplicatePage.displayName = 'WorkspaceDuplicatePage';

export default WorkspaceDuplicatePage;
