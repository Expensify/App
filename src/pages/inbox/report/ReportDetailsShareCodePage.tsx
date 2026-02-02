import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {isSelfDM} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ShareCodePage from '@pages/ShareCodePage';
import type SCREENS from '@src/SCREENS';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type ReportDetailsShareCodePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.SHARE_CODE>;

function ReportDetailsShareCodePage({report, policy, route}: ReportDetailsShareCodePageProps) {
    if (isSelfDM(report)) {
        return <NotFoundPage />;
    }
    return (
        <ShareCodePage
            backTo={route.params?.backTo}
            report={report}
            policy={policy}
        />
    );
}

export default withReportOrNotFound()(ReportDetailsShareCodePage);
