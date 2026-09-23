import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import MergeSyncResultsPageBase from '@pages/workspace/merge/MergeSyncResultsPageBase';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type DynamicHRSyncResultsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_HR_SYNC_RESULTS>;

function DynamicHRSyncResultsPage({route}: DynamicHRSyncResultsPageProps) {
    return (
        <MergeSyncResultsPageBase
            policyID={route.params.policyID}
            category={CONST.POLICY.CONNECTIONS.CATEGORY.HR}
        />
    );
}

export default DynamicHRSyncResultsPage;
