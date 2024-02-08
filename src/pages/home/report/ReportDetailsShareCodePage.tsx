import React from 'react';
import ShareCodePage from '@pages/ShareCodePage';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type ReportDetailsShareCodePageProps = WithReportOrNotFoundProps;

function ReportDetailsShareCodePage({report}: ReportDetailsShareCodePageProps) {
    return <ShareCodePage report={report} />;
}

export default withReportOrNotFound()(ReportDetailsShareCodePage);
