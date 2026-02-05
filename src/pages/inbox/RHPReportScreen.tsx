import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import ReportScreen from './ReportScreen';

type PageProps = PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

// When switching search reports using arrows SET_PARAMS action is performed, but it's necessary to remount the whole component after changing the reportID due to the hooks dependencies.
// It's suggested to refactor hooks in ReportScreen to remove this file and perform SET_PARAMS without the report screen remount.
export default function RHPReportScreen({route, navigation}: PageProps) {
    return (
        <ReportScreen
            key={route.params?.reportID}
            route={route}
            navigation={navigation}
        />
    );
}
