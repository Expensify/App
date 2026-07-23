import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, isClosedAction} from '@libs/ReportActionsUtils';
import {getPolicyName} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import {getLastClosedReportAction} from '@selectors/ReportAction';
import lodashEscape from 'lodash/escape';
import React from 'react';

import Banner from './Banner';

type ArchivedReportFooterProps = {
    /** The reportID of the archived report */
    reportID: string;
};

function ArchivedReportFooter({reportID}: ArchivedReportFooterProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const [personalDetails = getEmptyObject<PersonalDetailsList>()] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [reportClosedAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: getLastClosedReportAction});
    const originalMessage = isClosedAction(reportClosedAction) ? getOriginalMessage(reportClosedAction) : null;
    const archiveReason = originalMessage?.reason ?? CONST.REPORT.ARCHIVE_REASON.DEFAULT;
    const actorPersonalDetails = personalDetails?.[reportClosedAction?.actorAccountID ?? CONST.DEFAULT_NUMBER_ID];
    let displayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: actorPersonalDetails, translate});

    let oldDisplayName: string | undefined;
    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED) {
        const newAccountID = originalMessage?.newAccountID;
        const oldAccountID = originalMessage?.oldAccountID;
        displayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails?.[newAccountID ?? CONST.DEFAULT_NUMBER_ID], translate});
        oldDisplayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: personalDetails?.[oldAccountID ?? CONST.DEFAULT_NUMBER_ID], translate});
    }

    const shouldRenderHTML = archiveReason !== CONST.REPORT.ARCHIVE_REASON.DEFAULT && archiveReason !== CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED;

    let policyName = getPolicyName({report, unavailableTranslation: translate('workspace.common.unavailable')});

    if (archiveReason === CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED) {
        policyName = originalMessage?.receiverPolicyName ?? '';
    }

    if (shouldRenderHTML) {
        oldDisplayName = lodashEscape(oldDisplayName);
        displayName = lodashEscape(displayName);
        policyName = lodashEscape(policyName);
    }

    let text: string;
    if (shouldRenderHTML) {
        const displayNameHtml = `<strong>${displayName}</strong>`;
        const oldDisplayNameHtml = `<strong>${oldDisplayName}</strong>`;
        const policyNameHtml = `<strong>${policyName}</strong>`;
        const shouldUseYou = actorPersonalDetails?.accountID === currentUserAccountID;
        switch (archiveReason) {
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
                text = translate('reportArchiveReasons.accountClosed', displayNameHtml);
                break;
            case CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED:
                text = translate('reportArchiveReasons.accountMerged', displayNameHtml, oldDisplayNameHtml);
                break;
            case CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
                text = translate('reportArchiveReasons.removedFromPolicy', displayNameHtml, policyNameHtml, shouldUseYou);
                break;
            case CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED:
                text = translate('reportArchiveReasons.policyDeleted', policyNameHtml);
                break;
            case CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED:
                text = translate('reportArchiveReasons.invoiceReceiverPolicyDeleted', policyNameHtml);
                break;
            default:
                text = translate('reportArchiveReasons.default');
        }
    } else {
        text = translate(`reportArchiveReasons.${archiveReason}`);
    }

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
