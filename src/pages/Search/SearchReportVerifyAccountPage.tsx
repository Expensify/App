import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchReportVerifyAccountPageParamList = PlatformStackScreenProps<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT>;

function SearchReportVerifyAccountPage({route}: SearchReportVerifyAccountPageParamList) {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.SEARCH_REPORT.getRoute({reportID: route.params.reportID})} />;
}

export default SearchReportVerifyAccountPage;
