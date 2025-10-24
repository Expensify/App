import {Str} from 'expensify-common';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {chatIncludesConcierge, isConciergeChatReport, shouldUnmaskChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {GetChatFSClass, ShouldInitialize} from './types';

let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

const getChatFSClass: GetChatFSClass = (context, report) => {
    if (!report?.participants) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    const participantAccountIDs = Object.keys(report.participants);

    if (report.type === CONST.REPORT.TYPE.IOU || report.type === CONST.REPORT.TYPE.EXPENSE || report.type === CONST.REPORT.TYPE.INVOICE) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    if (parentReport && (parentReport.type === CONST.REPORT.TYPE.IOU || parentReport.type === CONST.REPORT.TYPE.EXPENSE || parentReport.type === CONST.REPORT.TYPE.INVOICE)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // DMs / Groups / Rooms
    if (participantAccountIDs.length >= 2) {
        return chatIncludesConcierge(report) ? CONST.FULLSTORY.CLASS.UNMASK : CONST.FULLSTORY.CLASS.MASK;
    }

    return CONST.FULLSTORY.CLASS.UNMASK;

    // if (isConciergeChatReport(report)) {
    //     return CONST.FULLSTORY.CLASS.UNMASK;
    // }

    // if (shouldUnmaskChat(context, report)) {
    //     return CONST.FULLSTORY.CLASS.UNMASK;
    // }

    // return CONST.FULLSTORY.CLASS.MASK;
};

const shouldInitializeFullstory: ShouldInitialize = (userMetadata, envName) => {
    const isTestEmail = userMetadata.email !== undefined && userMetadata.email.startsWith('fullstory') && userMetadata.email.endsWith(CONST.EMAIL.QA_DOMAIN);
    if ((CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) || Str.extractEmailDomain(userMetadata.email ?? '') === CONST.EXPENSIFY_PARTNER_NAME) {
        return false;
    }

    return true;
};

export {getChatFSClass, shouldInitializeFullstory};
