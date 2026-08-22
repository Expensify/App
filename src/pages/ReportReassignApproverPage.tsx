import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type ReportReassignApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.REASSIGN_APPROVER>;

function ReportReassignApproverPage({report}: ReportReassignApproverPageProps) {
    const {translate} = useLocalize();

    if (!isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="ReportReassignApproverPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.actions.reassignApprover')}
                onBackButtonPress={() => {
                    Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path, ROUTES.REPORT_WITH_ID.getRoute(report.reportID)), {compareParams: false});
                }}
            />
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportReassignApproverPage);
