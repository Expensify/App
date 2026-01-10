import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportVerifyAccountNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ExpenseReportVerifyAccountPageProps = PlatformStackScreenProps<ReportVerifyAccountNavigatorParamList, typeof SCREENS.EXPENSE_REPORT_VERIFY_ACCOUNT>;

function ExpenseReportVerifyAccountPage({route}: ExpenseReportVerifyAccountPageProps) {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: route.params.reportID})} />;
}

export default ExpenseReportVerifyAccountPage;
