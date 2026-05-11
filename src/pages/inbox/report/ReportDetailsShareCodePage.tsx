import React from 'react';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {isSelfDM} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ShareCodePage from '@pages/ShareCodePage';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type ReportDetailsShareCodePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_SHARE_CODE>;

function ReportDetailsShareCodePage({report, policy}: ReportDetailsShareCodePageProps) {
    const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(report.reportID);
    const navigateBackRoute = createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.path, reportRoute);

    if (isSelfDM(report)) {
        return <NotFoundPage />;
    }

    return (
        <ShareCodePage
            reportNavigateBackRoute={navigateBackRoute}
            report={report}
            policy={policy}
        />
    );
}

export default withReportOrNotFound()(ReportDetailsShareCodePage);
