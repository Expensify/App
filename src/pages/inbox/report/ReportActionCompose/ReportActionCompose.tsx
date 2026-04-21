import React, {useState} from 'react';
import {View} from 'react-native';
import {scheduleOnUI} from 'react-native-worklets';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import OfflineIndicator from '@components/OfflineIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getLinkedTransactionID, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getParentReport,
    isChatRoom,
    isGroupChat,
    isInvoiceReport,
    isReportApproved,
    isReportTransactionThread,
    isSettled,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {getTransactionID, hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import {useComposerMeta, useComposerSendState} from './ComposerContext';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';

type ReportActionComposeProps = {
    reportID: string;
};

function ReportActionComposeInner({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    // Context: only 2 subscriptions needed for attachment/DropZone logic
    const {exceededMaxLength} = useComposerSendState();
    const {composerRef, suggestionsRef, attachmentFileRef} = useComposerMeta();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle']);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const isTransactionThreadView = isReportTransactionThread(report);
    const isExpensesReport = reportTransactions && reportTransactions.length > 1;

    const [rawReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canEvict: false});
    const iouAction = rawReportActions ? (Object.values(rawReportActions).find((action) => isMoneyRequestAction(action)) as OnyxTypes.ReportAction | undefined) : undefined;
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;
    const transactionID = getTransactionID(report) ?? linkedTransactionID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);

    const isSingleTransactionView = !!transaction && !!reportTransactions && reportTransactions.length === 1;
    const effectiveParentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt =
        canUserPerformWriteAction &&
        canEditFieldOfMoneyRequest({reportAction: effectiveParentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction}) &&
        !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;
    const hasReceipt = hasReceiptTransactionUtils(transaction);

    const parentReport = getParentReport(report);
    const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
    const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
    const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
    const isRoomOrGroupChat = isChatRoom(report) || isGroupChat(report);
    const shouldDisplayDualDropZone = !isRoomOrGroupChat && (canModifyReceipt || hasMoneyRequestOptions) && !isInvoiceReport(report);

    const updateShouldShowSuggestionMenuToFalse = () => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    };

    const addAttachment = (file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;
        const clearWorklet = composerRef.current?.clearWorklet;
        if (!clearWorklet) {
            throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
        }
        scheduleOnUI(clearWorklet);
    };

    const onAttachmentPreviewClose = () => {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
        ComposerFocusManager.setReadyToFocus();
    };

    const {validateAttachments, onReceiptDropped, PDFValidationComponent, ErrorModal} = useAttachmentUploadValidation({
        policy,
        reportID,
        addAttachment,
        onAttachmentPreviewClose,
        exceededMaxLength,
        shouldAddOrReplaceReceipt,
        transactionID,
        report,
        newParentReport,
        currentDate,
        currentUserPersonalDetails,
        isAttachmentPreviewActive,
        setIsAttachmentPreviewActive,
    });

    if (!report) {
        return null;
    }

    return (
        <View style={[isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerLocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ComposerBox reportID={reportID}>
                    {PDFValidationComponent}
                    <ComposerActionMenu
                        reportID={reportID}
                        onAttachmentPicked={(files) => validateAttachments({files})}
                    />
                    <ComposerInput
                        reportID={reportID}
                        onPasteFile={(files) => validateAttachments({files})}
                    />
                    {shouldDisplayDualDropZone && (
                        <DualDropZone
                            isEditing={shouldAddOrReplaceReceipt && hasReceipt}
                            onAttachmentDrop={(dragEvent) => validateAttachments({dragEvent})}
                            onReceiptDrop={onReceiptDropped}
                            shouldAcceptSingleReceipt={shouldAddOrReplaceReceipt}
                        />
                    )}
                    {!shouldDisplayDualDropZone && (
                        <DragAndDropConsumer onDrop={(dragEvent) => validateAttachments({dragEvent})}>
                            <DropZoneUI
                                icon={icons.MessageInABottle}
                                dropTitle={translate('dropzone.addAttachments')}
                                dropStyles={styles.attachmentDropOverlay(true)}
                                dropTextStyles={styles.attachmentDropText}
                                dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.attachmentDropBorderColorActive, true)]}
                            />
                        </DragAndDropConsumer>
                    )}
                    <ComposerEmojiPicker reportID={reportID} />
                    <ComposerSendButton />
                </ComposerBox>
                {ErrorModal}
                <ComposerFooter>
                    {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                    <AgentZeroAwareTypingIndicator reportID={reportID} />
                    <ComposerExceededLength />
                </ComposerFooter>
                <ComposerImportedState />
            </View>
        </View>
    );
}

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ReportActionComposeInner reportID={reportID} />
        </ComposerProvider>
    );
}

export default ReportActionCompose;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
