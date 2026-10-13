import ReportOrNotFoundGuard from '@components/ReportOrNotFoundGuard';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import ReportDetailsContent from './ReportDetailsContent';

type DynamicReportDetailsPageProps = PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>;

function DynamicReportDetailsPage({route}: DynamicReportDetailsPageProps) {
    const reportID = route.params.reportID;

    return (
        <ReportOrNotFoundGuard reportID={reportID}>
            <ReportDetailsContent reportID={reportID} />
        </ReportOrNotFoundGuard>
    );
}

export default DynamicReportDetailsPage;
