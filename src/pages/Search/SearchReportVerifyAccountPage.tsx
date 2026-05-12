import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportActionsParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchReportVerifyAccountPageProps = PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT>;

function SearchReportVerifyAccountPage({route}: SearchReportVerifyAccountPageProps) {
    const {reportID, backTo} = Navigation.getTopmostSearchReportRouteParams() ?? {};
    const navigateBackTo =
        reportID === route.params.reportID ? ROUTES.SEARCH_REPORT.getRoute({reportID: route.params.reportID, backTo}) : ROUTES.SEARCH_REPORT.getRoute({reportID: route.params.reportID});
    return <VerifyAccountPageBase navigateBackTo={navigateBackTo} />;
}

export default SearchReportVerifyAccountPage;
