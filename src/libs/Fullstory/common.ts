import {getAllPersonalDetails} from '@libs/PersonalDetailsStore';
import {chatIncludesConcierge, isDM, isInvoiceReport, isMoneyRequestReport, isSupportTicket} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getCustomAgentParticipantAccountID, getReportParticipantAccountIDs} from '@selectors/AgentZeroChat';
import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';

import type {GetChatFSClass, ShouldInitialize} from './types';

// This data is only used for Fullstory to determine if a chat-related element should be
// masked or not, so it's acceptable to use `Onyx.connectWithoutView` and avoid many UI elements
// having to subscribe to this whole collection.
let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
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

type FullstoryPropertyValue = string | number | boolean | Date | null | undefined;

type NormalizeFullstoryPropertiesForNativeOptions = {
    preserveKeys?: readonly string[];
};

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
    if (isMoneyRequestReport(report) || isInvoiceReport(report)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // If the report doesn't meet the condition above we check if the parent report is an IOU, expense or invoice.
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    if (isMoneyRequestReport(parentReport) || isInvoiceReport(parentReport)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // Support tickets, and threads inside them, are the user's conversation with Expensify support that Concierge hands off to, so they're unmasked like Concierge chats.
    if (isSupportTicket(report) || isSupportTicket(parentReport)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    // DMs / Groups / Rooms should be unmasked only if Concierge is in the chat, or if it's the user's DM with a custom agent.
    // Custom agents act as Expensify system users like Concierge, but a chat between people stays masked even when an agent is in it.
    const participantAccountIDs = getReportParticipantAccountIDs(report);
    if (participantAccountIDs.length > 0) {
        const isCustomAgentDM = isDM(report) && participantAccountIDs.length <= 2 && getCustomAgentParticipantAccountID(participantAccountIDs)(getAllPersonalDetails()) !== undefined;
        return chatIncludesConcierge(report) || isCustomAgentDM ? CONST.FULLSTORY.CLASS.UNMASK : CONST.FULLSTORY.CLASS.MASK;
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

function normalizeFullstoryPropertiesForNative(
    properties: Record<string, FullstoryPropertyValue>,
    {preserveKeys = []}: NormalizeFullstoryPropertiesForNativeOptions = {},
): Record<string, string | number | boolean> {
    const normalizedProperties: Record<string, string | number | boolean> = {};
    const preservedKeys = new Set(preserveKeys);

    for (const [key, value] of Object.entries(properties)) {
        if (value === undefined || value === null) {
            continue;
        }

        if (preservedKeys.has(key)) {
            normalizedProperties[key] = value instanceof Date ? value.toISOString() : value;
            continue;
        }

        if (value instanceof Date) {
            normalizedProperties[`${key}_date`] = value.toISOString();
            continue;
        }

        if (typeof value === 'string') {
            normalizedProperties[`${key}_str`] = value;
        } else if (typeof value === 'number') {
            normalizedProperties[`${key}_real`] = value;
        } else if (typeof value === 'boolean') {
            normalizedProperties[`${key}_bool`] = value;
        }
    }

    return normalizedProperties;
}

export {getChatFSClass, normalizeFullstoryPropertiesForNative, shouldInitializeFullstory};
