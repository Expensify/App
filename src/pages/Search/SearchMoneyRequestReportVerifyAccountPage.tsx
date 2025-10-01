import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchReportParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchMoneyRequestReportVerifyAccountPageProps = PlatformStackScreenProps<SearchReportParamList, typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_VERIFY_ACCOUNT>;

function SearchMoneyRequestReportVerifyAccountPage({route}: SearchMoneyRequestReportVerifyAccountPageProps) {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: route.params.reportID})} />;
}

export default SearchMoneyRequestReportVerifyAccountPage;
