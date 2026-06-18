import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportVerifyAccountNavigatorParamList} from '@libs/Navigation/types';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ReportVerifyAccountPageProps = PlatformStackScreenProps<ReportVerifyAccountNavigatorParamList, typeof SCREENS.RIGHT_MODAL.REPORT_VERIFY_ACCOUNT>;

function ReportVerifyAccountPage({route}: ReportVerifyAccountPageProps) {
    return <VerifyAccountPageBase navigateBackTo={ROUTES.REPORT_WITH_ID.getRoute(route.params.reportID)} />;
}

export default ReportVerifyAccountPage;
