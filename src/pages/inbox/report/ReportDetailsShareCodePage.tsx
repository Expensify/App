import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {isSelfDM} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ShareCodePage from '@pages/ShareCodePage';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type ReportDetailsShareCodePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_SHARE_CODE>;

function ReportDetailsShareCodePage({report, policy}: ReportDetailsShareCodePageProps) {
    if (isSelfDM(report)) {
        return <NotFoundPage />;
    }
    const navigateBackRoute = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS_SHARE_CODE.path);

    return (
        <ShareCodePage
            reportNavigateBackRoute={navigateBackRoute}
            report={report}
            policy={policy}
        />
    );
}

export default withReportOrNotFound()(ReportDetailsShareCodePage);
