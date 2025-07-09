import {useRoute} from '@react-navigation/native';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceDuplicateNavigatorParamList} from '@navigation/types';
import type SCREENS from '@src/SCREENS';
import WorkspaceDuplicateSelectFeaturesForm from './WorkspaceDuplicateSelectFeaturesForm';

function WorkspaceDuplicateSelectFeaturesPage() {
    const route = useRoute<PlatformStackRouteProp<WorkspaceDuplicateNavigatorParamList, typeof SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES>>();
    const policyID = route?.params?.policyID;

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={WorkspaceDuplicateSelectFeaturesPage.displayName}
        >
            <WorkspaceDuplicateSelectFeaturesForm policyID={policyID} />
        </ScreenWrapper>
    );
}

WorkspaceDuplicateSelectFeaturesPage.displayName = 'WorkspaceDuplicateSelectFeaturesPage';

export default WorkspaceDuplicateSelectFeaturesPage;
