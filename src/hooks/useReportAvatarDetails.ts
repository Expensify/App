import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getIcons,
    getPolicyName,
    getReportActionActorAccountID,
    getWorkspaceIcon,
    isDM,
    isIndividualInvoiceRoom,
    isInvoiceReport as isInvoiceReportUtils,
    isInvoiceRoom,
    isPolicyExpenseChat,
    isTripRoom as isTripRoomReportUtils,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type ReportAvatarDetails = {
    reportPreviewSenderID: number | undefined;
    reportPreviewAction: OnyxEntry<ReportAction>;
    primaryAvatar: Icon;
    secondaryAvatar: Icon;
    shouldDisplayAllActors: boolean;
    displayName: string;
    isWorkspaceActor: boolean;
    actorHint: string;
    fallbackIcon: string | undefined;
};

type AvatarDetailsProps = {
    personalDetails: OnyxEntry<PersonalDetailsList>;
    innerPolicies: OnyxCollection<Policy>;
    policy: OnyxEntry<Policy>;
    action: OnyxEntry<ReportAction>;
    report: OnyxEntry<Report>;
    iouReport?: OnyxEntry<Report>;
    policies?: OnyxCollection<Policy>;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

function getSplitAuthor(transaction: Transaction, splits?: Array<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>) {
    const {originalTransactionID, source} = transaction.comment ?? {};

    if (source !== CONST.IOU.TYPE.SPLIT || originalTransactionID === undefined) {
        return undefined;
    }

    const splitAction = splits?.find((split) => getOriginalMessage(split)?.IOUTransactionID === originalTransactionID);

    if (!splitAction) {
        return undefined;
    }

    return splitAction.actorAccountID;
}

function getIconDetails({
    action,
    report,
    iouReport,
    policies,
    personalDetails,
    reportPreviewSenderID,
    innerPolicies,
    policy,
    formatPhoneNumber,
}: AvatarDetailsProps & {reportPreviewSenderID: number | undefined}) {
    const delegatePersonalDetails = action?.delegateAccountID ? personalDetails?.[action?.delegateAccountID] : undefined;
    const actorAccountID = getReportActionActorAccountID(action, iouReport, report, delegatePersonalDetails);
    const accountID = reportPreviewSenderID ?? actorAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const activePolicies = policies ?? innerPolicies;

    const ownerAccountID = iouReport?.ownerAccountID ?? action?.childOwnerAccountID;
    const isReportPreviewAction = action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;

    const invoiceReceiverPolicy =
        report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? activePolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.invoiceReceiver.policyID}`] : undefined;

    const {avatar, login, fallbackIcon} = personalDetails?.[accountID] ?? {};

    const isTripRoom = isTripRoomReportUtils(report);
    // We want to display only the sender's avatar next to the report preview if it only contains one person's expenses.
    const displayAllActors = isReportPreviewAction && !isTripRoom && !isPolicyExpenseChat(report) && !reportPreviewSenderID;
    const isInvoiceReport = isInvoiceReportUtils(iouReport ?? null);
    const isWorkspaceActor = isInvoiceReport || (isPolicyExpenseChat(report) && (!actorAccountID || displayAllActors));

    const getPrimaryAvatar = () => {
        const defaultDisplayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails});
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const actorHint = isWorkspaceActor ? getPolicyName({report, policy}) : (login || (defaultDisplayName ?? '')).replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');

        const defaultAvatar = {
            source: avatar ?? FallbackAvatar,
            id: accountID,
            name: defaultDisplayName,
            type: CONST.ICON_TYPE_AVATAR,
        };

        if (isWorkspaceActor) {
            return {
                avatar: {
                    ...defaultAvatar,
                    name: getPolicyName({report, policy}),
                    type: CONST.ICON_TYPE_WORKSPACE,
                    source: getWorkspaceIcon(report, policy).source,
                    id: report?.policyID,
                },
                actorHint,
            };
        }

        if (delegatePersonalDetails) {
            return {
                avatar: {
                    ...defaultAvatar,
                    name: delegatePersonalDetails?.displayName ?? '',
                    source: delegatePersonalDetails?.avatar ?? FallbackAvatar,
                    id: delegatePersonalDetails?.accountID,
                },
                actorHint,
            };
        }

        if (isReportPreviewAction && isTripRoom) {
            return {
                avatar: {
                    ...defaultAvatar,
                    name: report?.reportName ?? '',
                    source: personalDetails?.[ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.avatar ?? FallbackAvatar,
                    id: ownerAccountID,
                },
                actorHint,
            };
        }

        return {
            avatar: defaultAvatar,
            actorHint,
        };
    };

    const getSecondaryAvatar = () => {
        const defaultAvatar = {name: '', source: '', type: CONST.ICON_TYPE_AVATAR};

        // If this is a report preview, display names and avatars of both people involved
        if (displayAllActors) {
            const secondaryAccountId = ownerAccountID === actorAccountID || isInvoiceReport ? actorAccountID : ownerAccountID;
            const secondaryUserAvatar = personalDetails?.[secondaryAccountId ?? -1]?.avatar ?? FallbackAvatar;
            const secondaryDisplayName = getDisplayNameForParticipant({accountID: secondaryAccountId});
            const secondaryPolicyAvatar = invoiceReceiverPolicy?.avatarURL ?? getDefaultWorkspaceAvatar(invoiceReceiverPolicy?.name);
            const isWorkspaceInvoice = isInvoiceRoom(report) && !isIndividualInvoiceRoom(report);

            return isWorkspaceInvoice
                ? {
                      source: secondaryPolicyAvatar,
                      type: CONST.ICON_TYPE_WORKSPACE,
                      name: invoiceReceiverPolicy?.name,
                      id: invoiceReceiverPolicy?.id,
                  }
                : {
                      source: secondaryUserAvatar,
                      type: CONST.ICON_TYPE_AVATAR,
                      name: secondaryDisplayName ?? '',
                      id: secondaryAccountId,
                  };
        }

        if (!isWorkspaceActor) {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const avatarIconIndex = report?.isOwnPolicyExpenseChat || isPolicyExpenseChat(report) ? 0 : 1;
            const reportIcons = getIcons(report, formatPhoneNumber, personalDetails, undefined, undefined, undefined, policy);

            return reportIcons.at(avatarIconIndex) ?? defaultAvatar;
        }

        if (isInvoiceReportUtils(iouReport)) {
            const secondaryAccountId = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
            const secondaryUserAvatar = personalDetails?.[secondaryAccountId ?? -1]?.avatar ?? FallbackAvatar;
            const secondaryDisplayName = getDisplayNameForParticipant({accountID: secondaryAccountId});

            return {
                source: secondaryUserAvatar,
                type: CONST.ICON_TYPE_AVATAR,
                name: secondaryDisplayName,
                id: secondaryAccountId,
            };
        }

        return defaultAvatar;
    };

    const {avatar: primaryAvatar, actorHint} = getPrimaryAvatar();

    return {
        primaryAvatar,
        secondaryAvatar: getSecondaryAvatar(),
        shouldDisplayAllActors: displayAllActors,
        displayName: primaryAvatar.name,
        isWorkspaceActor,
        actorHint,
        fallbackIcon,
    };
}

/**
 * This hook is used to determine the ID of the sender, as well as the avatars of the actors and some additional data, for the report preview action.
 * It was originally based on actions; now, it uses transactions and unique emails as a fallback.
 * For a reason why, see https://github.com/Expensify/App/pull/64802 discussion.
 */
function useReportAvatarDetails({iouReport, report, action, ...rest}: AvatarDetailsProps): ReportAvatarDetails {
    const [iouActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`, {
        canBeMissing: true,
        selector: (actions) => Object.values(actions ?? {}).filter(isMoneyRequestAction),
    });
    const {formatPhoneNumber} = useLocalize();

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(action?.childReportID);
    const transactions = useMemo(() => getAllNonDeletedTransactions(reportTransactions, iouActions ?? []), [reportTransactions, iouActions]);

    const [splits] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {
        canBeMissing: true,
        selector: (actions) =>
            Object.values(actions ?? {})
                .filter(isMoneyRequestAction)
                .filter((act) => getOriginalMessage(act)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT),
    });

    if (action?.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
        return {
            reportPreviewSenderID: undefined,
            reportPreviewAction: undefined,
            ...getIconDetails({
                ...rest,
                action,
                report,
                iouReport,
                reportPreviewSenderID: undefined,
            }),
        };
    }

    // 1. If all amounts have the same sign - either all amounts are positive or all amounts are negative.
    // We have to do it this way because there can be a case when actions are not available
    // See: https://github.com/Expensify/App/pull/64802#issuecomment-3008944401

    const areAmountsSignsTheSame = new Set(transactions?.map((tr) => Math.sign(tr.amount))).size < 2;

    // 2. If there is only one attendee - we check that by counting unique emails converted to account IDs in the attendees list.
    // This is a fallback added because: https://github.com/Expensify/App/pull/64802#issuecomment-3007906310

    const attendeesIDs = transactions
        // If the transaction is a split, then attendees are not present as a property so we need to use a helper function.
        ?.flatMap<number | undefined>((tr) =>
            tr.comment?.attendees?.map?.((att) => (tr.comment?.source === CONST.IOU.TYPE.SPLIT ? getSplitAuthor(tr, splits) : getPersonalDetailByEmail(att.email)?.accountID)),
        )
        .filter((accountID) => !!accountID);

    const isThereOnlyOneAttendee = new Set(attendeesIDs).size <= 1;

    // If the action is a 'Send Money' flow, it will only have one transaction, but the person who sent the money is the child manager account, not the child owner account.
    const isSendMoneyFlow = action?.childMoneyRequestCount === 0 && transactions?.length === 1 && isDM(report);
    const singleAvatarAccountID = isSendMoneyFlow ? action.childManagerAccountID : action?.childOwnerAccountID;

    const reportPreviewSenderID = areAmountsSignsTheSame && isThereOnlyOneAttendee ? singleAvatarAccountID : undefined;

    return {
        reportPreviewSenderID,
        reportPreviewAction: action,
        ...getIconDetails({
            ...rest,
            action,
            report,
            iouReport,
            reportPreviewSenderID,
            formatPhoneNumber,
        }),
    };
}

export default useReportAvatarDetails;
export type {ReportAvatarDetails};
