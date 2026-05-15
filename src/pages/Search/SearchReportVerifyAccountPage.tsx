import React from 'react';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportActionsParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchReportVerifyAccountPageProps = PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT>;

function SearchReportVerifyAccountPage({route}: SearchReportVerifyAccountPageProps) {
    const {reportID, reportActionID} = Navigation.getTopmostSearchReportRouteParams() ?? {};
    const navigateBackTo = createDynamicRoute(
        DYNAMIC_ROUTES.SEARCH_REPORT.getRoute(
            reportID === route.params.reportID ? {reportID: route.params.reportID, reportActionID} : {reportID: route.params.reportID},
        ),
        ROUTES.SEARCH_ROOT.route,
    );
    return <VerifyAccountPageBase navigateBackTo={navigateBackTo} />;
}

export default SearchReportVerifyAccountPage;
