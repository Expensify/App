import {Str} from 'expensify-common';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {GetChatFSClass, ShouldInitialize} from './types';

// This data is only used for Fullstory to determine if a chat-related element should be
// masked or not, so it's acceptable to use `Onyx.connectWithoutView` and avoid many UI elements
// having to subscribe to this whole collection.
let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

const allowedReportChatTypes = new Set<ValueOf<typeof CONST.REPORT.CHAT_TYPE>>([
    CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
    CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
    CONST.REPORT.CHAT_TYPE.INVOICE,
]);

const allowedReportTypes = new Set<ValueOf<typeof CONST.REPORT.TYPE>>([CONST.REPORT.TYPE.IOU, CONST.REPORT.TYPE.EXPENSE, CONST.REPORT.TYPE.INVOICE]);

const getChatFSClass: GetChatFSClass = (report) => {
    if (!report) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // Self DMs should be masked.
    if (report.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM) {
        return CONST.FULLSTORY.CLASS.MASK;
    }

    // Workspace expense chat, #admins, #announce rooms and invoices should be unmasked.
    if (report.chatType && allowedReportChatTypes.has(report.chatType)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // IOUs, expenses and invoices should be unmasked.
    if (report.type && allowedReportTypes.has(report.type as ValueOf<typeof CONST.REPORT.TYPE>)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // If the report doesn't meet the condition above we check if the parent report is an IOU, expense or invoice.
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    if (parentReport?.type && allowedReportTypes.has(parentReport.type as ValueOf<typeof CONST.REPORT.TYPE>)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // DMs / Groups / Rooms should be unmasked only if Concierge is in the chat.
    const participantAccountIDs = Object.keys(report.participants ?? {});
    if (participantAccountIDs.length > 0) {
        return chatIncludesConcierge(report) ? CONST.FULLSTORY.CLASS.UNMASK : CONST.FULLSTORY.CLASS.MASK;
    }

    return CONST.FULLSTORY.CLASS.UNMASK;
};

const shouldInitializeFullstory: ShouldInitialize = (userMetadata, envName) => {
    const isTestEmail = userMetadata.email !== undefined && userMetadata.email.startsWith('fullstory') && userMetadata.email.endsWith(CONST.EMAIL.QA_DOMAIN);
    if ((CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) || Str.extractEmailDomain(userMetadata.email ?? '') === CONST.EXPENSIFY_PARTNER_NAME) {
        return false;
    }

    return true;
};

export {getChatFSClass, shouldInitializeFullstory};
