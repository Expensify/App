import isEmpty from 'lodash/isEmpty';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TPhrasing, TText} from 'react-native-render-html';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getReportName, isChatRoom} from './ReportUtils';

const removeLeadingLTRAndHash = (value: string) => value.replace(CONST.UNICODE.LTR, '').replace('#', '');

const getReportMentionDetails = (htmlAttributeReportID: string, currentReport: OnyxEntry<Report>, reports: OnyxCollection<Report>, tnode: TText | TPhrasing) => {
    let reportID: string | undefined;
    let mentionDisplayText: string;

    // Get mention details based on reportID from tag attribute
    if (!isEmpty(htmlAttributeReportID)) {
        const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${htmlAttributeReportID}`];
        reportID = report?.reportID ?? htmlAttributeReportID;
        const resolvedReportName = report ? (getReportName(report) ?? report.reportName) : undefined;
        mentionDisplayText = removeLeadingLTRAndHash(resolvedReportName ?? htmlAttributeReportID);
        // Get mention details from name inside tnode
    } else if ('data' in tnode && !isEmptyObject(tnode.data)) {
        mentionDisplayText = removeLeadingLTRAndHash(tnode.data);

        Object.values(reports ?? {}).forEach((report) => {
            const resolvedReportName = report ? (getReportName(report) ?? report.reportName) : undefined;
            const normalizedReportName = removeLeadingLTRAndHash(resolvedReportName ?? '');
            if (report?.policyID !== currentReport?.policyID || !isChatRoom(report)) {
                return;
            }
            if (normalizedReportName !== mentionDisplayText) {
                return;
            }
            if (report?.policyID !== currentReport?.policyID || !isChatRoom(report) || normalizedReportName !== mentionDisplayText) {
                return;
            }
            reportID = report?.reportID;
            mentionDisplayText = normalizedReportName;
        });
    } else {
        return null;
    }

    return {reportID, mentionDisplayText};
};

// eslint-disable-next-line import/prefer-default-export
export {getReportMentionDetails};
