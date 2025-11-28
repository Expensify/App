import React from 'react';
import type {ExtraContentProps, PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import ReportScreen from '@pages/home/ReportScreen';

function Concierge({navigation}: Pick<ExtraContentProps, 'navigation'>) {
    const route = {name: 'Report', params: {reportID: '3150338668101492'}, key: 'Report-Concierge-Key'} as const;

    return (
        <ReportScreen
            route={route}
            navigation={navigation as unknown as PlatformStackNavigationProp<ReportsSplitNavigatorParamList, 'Report'>}
        />
    );
}

Concierge.displayName = 'Help';

export default Concierge;
