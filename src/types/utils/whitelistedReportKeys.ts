import type {PolicyReportField, Report} from '../onyx';
import type * as OnyxCommon from '../onyx/OnyxCommon';

// List of keys that are allowed on the Report type. These should be the keys that are sent from the server.
// you need confirmation from an internal engineer that this has indeed been added to the report object that is returned as
type WhitelistedReport = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        avatarUrl: unknown;
        avatarFileName: unknown;
        chatType: unknown;
        hasOutstandingChildRequest: unknown;
        hasOutstandingChildTask: unknown;
        isOwnPolicyExpenseChat: unknown;
        isPolicyExpenseChat: unknown;
        isPinned: unknown;
        lastMessageText: unknown;
        lastVisibleActionCreated: unknown;
        lastReadTime: unknown;
        lastReadSequenceNumber: unknown;
        lastMentionedTime: unknown;
        policyAvatar: unknown;
        policyName: unknown;
        oldPolicyName: unknown;
        hasParentAccess: unknown;
        description: unknown;
        isDeletedParentAction: unknown;
        policyID: unknown;
        reportName: unknown;
        reportID: string;
        reportActionID: unknown;
        chatReportID: unknown;
        stateNum: unknown;
        statusNum: unknown;
        writeCapability: unknown;
        type: unknown;
        visibility: unknown;
        cachedTotal: unknown;
        invoiceReceiver: unknown;
        lastMessageTranslationKey: unknown;
        parentReportID: unknown;
        parentReportActionID: unknown;
        isOptimisticReport: unknown;
        managerID: unknown;
        lastVisibleActionLastModified: unknown;
        displayName: unknown;
        lastMessageHtml: unknown;
        lastActorAccountID: unknown;
        lastActionType: unknown;
        ownerAccountID: unknown;
        participants: unknown;
        total: unknown;
        unheldTotal: unknown;
        currency: unknown;
        errors: unknown;
        errorFields: unknown;
        isWaitingOnBankAccount: unknown;
        isCancelledIOU: unknown;
        iouReportID: unknown;
        preexistingReportID: unknown;
        nonReimbursableTotal: unknown;
        isHidden: unknown;
        privateNotes: unknown;
        isLoadingPrivateNotes: unknown;
        pendingChatMembers: unknown;
        transactionThreadReportID: unknown;
        fieldList: unknown;
        permissions: unknown;
        tripData: {
            startDate: unknown;
            endDate: unknown;
            tripID: unknown;
        };
        // eslint-disable-next-line @typescript-eslint/naming-convention
        private_isArchived: unknown;
    },
    PolicyReportField['fieldID']
>;
type ReportKeys = keyof Report;
type WhitelistedReportKeys = keyof WhitelistedReport;

type ValidateKeys<T, U> = Exclude<T, U> extends never ? true : false;

// TypeScript type-level check intended to ensure that all keys in the Report type are part of the whitelisted keys.
// However, TypeScript doesn't execute code at runtime, so this check is purely for compile-time validation.
// This validation must be always TRUE.
const testReportKeys: ValidateKeys<ReportKeys, WhitelistedReportKeys> = true;
export default testReportKeys;
