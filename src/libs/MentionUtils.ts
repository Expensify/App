import isEmpty from 'lodash/isEmpty';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {TPhrasing, TText} from 'react-native-render-html';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {isChatRoom} from './ReportUtils';

const removeLeadingLTRAndHash = (value: string) => value.replace(CONST.UNICODE.LTR, '').replace('#', '');

const getReportMentionDetails = (htmlAttributeReportID: string, currentReport: OnyxEntry<Report>, reports: OnyxCollection<Report>, tnode: TText | TPhrasing) => {
    let reportID: string | undefined;
    let mentionDisplayText: string;

    // Get mention details based on reportID from tag attribute
    if (!isEmpty(htmlAttributeReportID)) {
        const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${htmlAttributeReportID}`];
        reportID = report?.reportID ?? htmlAttributeReportID;
        mentionDisplayText = removeLeadingLTRAndHash(report?.reportName ?? htmlAttributeReportID);
        // Get mention details from name inside tnode
    } else if ('data' in tnode && !isEmptyObject(tnode.data)) {
        mentionDisplayText = removeLeadingLTRAndHash(tnode.data);

        Object.values(reports ?? {}).forEach((report) => {
            if (report?.policyID !== currentReport?.policyID || !isChatRoom(report) || removeLeadingLTRAndHash(report?.reportName ?? '') !== mentionDisplayText) {
                return;
            }
            reportID = report?.reportID;
        });
    } else {
        return null;
    }

    return {reportID, mentionDisplayText};
};

export {getReportMentionDetails};
