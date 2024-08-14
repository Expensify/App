import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ShareCodePage from '@pages/ShareCodePage';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './withReportOrNotFound';
import withReportOrNotFound from './withReportOrNotFound';

type ReportDetailsShareCodePageOnyxProps = {
    policy: OnyxEntry<Policy>;
};

type ReportDetailsShareCodePageProps = ReportDetailsShareCodePageOnyxProps & WithReportOrNotFoundProps;

function ReportDetailsShareCodePage({report, policy}: ReportDetailsShareCodePageProps) {
    if (ReportUtils.isSelfDM(report)) {
        return <NotFoundPage />;
    }
    return (
        <ShareCodePage
            report={report}
            policy={policy}
        />
    );
}

export default withReportOrNotFound()(
    withOnyx<ReportDetailsShareCodePageProps, ReportDetailsShareCodePageOnyxProps>({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`,
        },
    })(ReportDetailsShareCodePage),
);
