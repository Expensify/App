import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportActionsParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchMoneyRequestReportVerifyAccountPageProps = PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_VERIFY_ACCOUNT>;

function SearchMoneyRequestReportVerifyAccountPage({route}: SearchMoneyRequestReportVerifyAccountPageProps) {
    const topmostSuperWideRHPReportParams = Navigation.getTopmostSuperWideRHPReportParams();
    const {reportID, backTo} = topmostSuperWideRHPReportParams ?? {};
    const navigateBackTo =
        reportID === route.params.reportID
            ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: route.params.reportID, backTo})
            : ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: route.params.reportID});
    return <VerifyAccountPageBase navigateBackTo={navigateBackTo} />;
}

export default SearchMoneyRequestReportVerifyAccountPage;
