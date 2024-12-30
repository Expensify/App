import type {PolicyReportField, Report} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

// List of keys that are allowed on the Report type. These should be the keys that are returned from the server in OpenApp.
// Before changing this, you need confirmation from an internal engineer that the new key has been added to the report object that is returned from the back-end in OpenApp
// Any report data that you want to store in Onyx, but isn't returned from the server, should be stored in reportMetaData.
type WhitelistedReport = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        avatarUrl: unknown;
        chatType: unknown;
        hasOutstandingChildRequest: unknown;
        hasOutstandingChildTask: unknown;
        isOwnPolicyExpenseChat: unknown;
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
        chatReportID: unknown;
        stateNum: unknown;
        statusNum: unknown;
        writeCapability: unknown;
        type: unknown;
        visibility: unknown;
        invoiceReceiver: unknown;
        parentReportID: unknown;
        parentReportActionID: unknown;
        managerID: unknown;
        lastVisibleActionLastModified: unknown;
        lastMessageHtml: unknown;
        lastActorAccountID: unknown;
        lastActionType: unknown;
        ownerAccountID: unknown;
        participants: unknown;
        total: unknown;
        unheldTotal: unknown;
        unheldNonReimbursableTotal: unknown;
        currency: unknown;
        errorFields: unknown;
        isWaitingOnBankAccount: unknown;
        isCancelledIOU: unknown;
        iouReportID: unknown;
        preexistingReportID: unknown;
        nonReimbursableTotal: unknown;
        privateNotes: unknown;
        fieldList: unknown;
        permissions: unknown;
        tripData: {
            startDate: unknown;
            endDate: unknown;
            tripID: unknown;
        };
        // eslint-disable-next-line @typescript-eslint/naming-convention
        private_isArchived: unknown;
        welcomeMessage: unknown;
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
