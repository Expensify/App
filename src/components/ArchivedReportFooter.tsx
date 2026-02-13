import {getLastClosedReportAction} from '@selectors/ReportAction';
import lodashEscape from 'lodash/escape';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, isClosedAction} from '@libs/ReportActionsUtils';
import {getPolicyName} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import Banner from './Banner';

type ArchivedReportFooterProps = {
    /** The archived report */
    report: Report;
    /** Current user's account id */
    currentUserAccountID: number;
};

function ArchivedReportFooter({report, currentUserAccountID}: ArchivedReportFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [personalDetails = getEmptyObject<PersonalDetailsList>()] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [reportClosedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {canEvict: false, selector: getLastClosedReportAction, canBeMissing: true});
    const originalMessage = isClosedAction(reportClosedAction) ? getOriginalMessage(reportClosedAction) : null;
    const archiveReason = originalMessage?.reason ?? CONST.REPORT.ARCHIVE_REASON.DEFAULT;
    const actorPersonalDetails = personalDetails?.[reportClosedAction?.actorAccountID ?? CONST.DEFAULT_NUMBER_ID];
    let displayName = getDisplayNameOrDefault(actorPersonalDetails);

    let oldDisplayName: string | undefined;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newAccountID = originalMessage?.newAccountID;
        const oldAccountID = originalMessage?.oldAccountID;
        displayName = getDisplayNameOrDefault(personalDetails?.[newAccountID ?? CONST.DEFAULT_NUMBER_ID]);
        oldDisplayName = getDisplayNameOrDefault(personalDetails?.[oldAccountID ?? CONST.DEFAULT_NUMBER_ID]);
    }

    const shouldRenderHTML = archiveReason !== CONST.REPORT.ARCHIVE_REASON.DEFAULT && archiveReason !== CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED;

    let policyName = getPolicyName({report});

    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED) {
        policyName = originalMessage?.receiverPolicyName ?? '';
    }

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
              shouldUseYou: actorPersonalDetails?.accountID === currentUserAccountID,
          })
        : translate(`reportArchiveReasons.${archiveReason}`);

    return (
        <Banner
            containerStyles={[styles.chatFooterBanner]}
            text={text}
            shouldRenderHTML={shouldRenderHTML}
            shouldShowIcon
        />
    );
}

export default ArchivedReportFooter;
