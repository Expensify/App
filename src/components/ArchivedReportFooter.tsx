import lodashEscape from 'lodash/escape';
import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import Banner from './Banner';

type ArchivedReportFooterOnyxProps = {
    /** The reason this report was archived */
    reportClosedAction: OnyxEntry<ReportAction>;
};

type ArchivedReportFooterProps = ArchivedReportFooterOnyxProps & {
    /** The archived report */
    report: Report;
};

function ArchivedReportFooter({report, reportClosedAction}: ArchivedReportFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const originalMessage = reportClosedAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED ? reportClosedAction.originalMessage : null;
    const archiveReason = originalMessage?.reason ?? CONST.REPORT.ARCHIVE_REASON.DEFAULT;

    let displayName = ReportUtils.getDisplayNameForParticipant(report.ownerAccountID);

    let oldDisplayName: string | undefined;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newAccountID = originalMessage?.newAccountID;
        const oldAccountID = originalMessage?.oldAccountID;
        displayName = ReportUtils.getDisplayNameForParticipant(newAccountID) ?? translate('common.hidden');
        oldDisplayName = ReportUtils.getDisplayNameForParticipant(oldAccountID) ?? translate('common.hidden');
    }

    const shouldRenderHTML = archiveReason !== CONST.REPORT.ARCHIVE_REASON.DEFAULT;

    let policyName = ReportUtils.getPolicyName(report);

    if (shouldRenderHTML) {
        oldDisplayName = lodashEscape(oldDisplayName);
        displayName = lodashEscape(displayName);
        policyName = lodashEscape(policyName);
    }

    const text = shouldRenderHTML
        ? translate(`reportArchiveReasons.${archiveReason}`, {
              displayName: `<strong>${displayName}</strong>`,
              oldDisplayName: `<strong>${oldDisplayName}</strong>`,
              policyName: `<strong>${policyName}</strong>`,
          })
        : translate(`reportArchiveReasons.${archiveReason}`);

    return (
        <Banner
            containerStyles={[styles.archivedReportFooter]}
            text={text}
            shouldRenderHTML={shouldRenderHTML}
            shouldShowIcon
        />
    );
}

ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default withOnyx<ArchivedReportFooterProps, ArchivedReportFooterOnyxProps>({
    reportClosedAction: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
        canEvict: false,
        selector: ReportActionsUtils.getLastClosedReportAction,
    },
})(ArchivedReportFooter);
