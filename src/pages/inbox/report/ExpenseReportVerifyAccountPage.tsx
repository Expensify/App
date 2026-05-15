import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportVerifyAccountNavigatorParamList} from '@libs/Navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import type SCREENS from '@src/SCREENS';

type ExpenseReportVerifyAccountPageProps = PlatformStackScreenProps<ReportVerifyAccountNavigatorParamList, typeof SCREENS.EXPENSE_REPORT_VERIFY_ACCOUNT>;

function ExpenseReportVerifyAccountPage(_: ExpenseReportVerifyAccountPageProps) {
    return <VerifyAccountPageBase />;
}

export default ExpenseReportVerifyAccountPage;
