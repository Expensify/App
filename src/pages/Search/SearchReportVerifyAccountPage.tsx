import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportActionsParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchReportVerifyAccountPageProps = PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT>;

function SearchReportVerifyAccountPage({route}: SearchReportVerifyAccountPageProps) {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.SEARCH_REPORT.getRoute({reportID: route.params.reportID})} />;
}

SearchReportVerifyAccountPage.displayName = 'SearchReportVerifyAccountPage';

export default SearchReportVerifyAccountPage;
