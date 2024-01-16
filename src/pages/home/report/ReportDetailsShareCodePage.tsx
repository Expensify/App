import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import ShareCodePage from '@pages/ShareCodePage';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import withReportOrNotFound from './withReportOrNotFound';

type ReportDetailsShareCodePageProps = StackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.SHARE_CODE> & {
    report: Report;
};

function ReportDetailsShareCodePage({report}: ReportDetailsShareCodePageProps) {
    return <ShareCodePage report={report} />;
}

export default withReportOrNotFound()(ReportDetailsShareCodePage);
