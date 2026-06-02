import React from 'react';
import {createDynamicRoute} from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportActionsParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchReportVerifyAccountPageProps = PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT>;

function SearchReportVerifyAccountPage({route}: SearchReportVerifyAccountPageProps) {
    const {reportID} = Navigation.getTopmostSearchReportRouteParams() ?? {};
    const navigateBackTo = createDynamicRoute(DYNAMIC_ROUTES.SEARCH_REPORT_VIEW.getRoute(route.params.reportID));
    return <VerifyAccountPageBase navigateBackTo={navigateBackTo} />;
}

export default SearchReportVerifyAccountPage;
