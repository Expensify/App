import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DomUtils from '@libs/DomUtils';
import FS from '@libs/Fullstory';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getLinkedTransactionID,
    getOneTransactionThreadReportID,
    getReportAction,
    isMoneyRequestAction,
    isSentMoneyReportAction,
} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    chatIncludesChronos,
    chatIncludesConcierge,
    getReportOfflinePendingActionAndErrors,
    isReportTransactionThread,
} from '@libs/ReportUtils';
import {getTransactionID} from '@libs/TransactionUtils';
import {isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerBox, {useComposerBox} from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import {useComposerActions, useComposerInternalsActions, useComposerInternalsData, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerFooter from './ComposerFooter';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import SendButton from './SendButton';

type ReportActionComposeProps = {
    /** The ID of the report this composer is for */
    reportID: string;
};

// ---------------------------------------------------------------------------
// ComposerBoxContent — reads from all contexts, passes props to children.
// Transitional: shrinks as children self-subscribe to context.
// ---------------------------------------------------------------------------

type ComposerBoxContentProps = {
    reportID: string;
    lastReportAction: OnyxEntry<OnyxTypes.ReportAction>;
};

function ComposerBoxContent({reportID, lastReportAction}: ComposerBoxContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isMediumScreenWidth} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {isComposerFullSize, isFullComposerAvailable, isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge, isSendDisabled, exceededMaxLength} = useComposerSendState();
    const {setMenuVisibility, setIsFullComposerAvailable, handleSendMessage, focus, onValueChange} = useComposerActions();
    const {composerRef, suggestionsRef, actionButtonRef, isNextModalWillOpenRef, shouldFocusComposerOnScreenFocus, shouldShowComposeInput, userBlockedFromConcierge} =
        useComposerInternalsData();
    const {onBlur, onFocus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, submitForm, validateAttachments, setComposerRef} = useComposerInternalsActions();
    const {measureContainer} = useComposerBox();

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const isGroupPolicyReport = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;
    const inputPlaceholder = includesConcierge && userBlockedFromConcierge ? translate('reportActionCompose.blockedFromConcierge') : translate('reportActionCompose.writeSomething');
    const fsClass = report ? FS.getChatFSClass(report) : undefined;

    const emojiShiftVertical = (() => {
        const chatItemComposeSecondaryRowHeight = styles.chatItemComposeSecondaryRow.height + styles.chatItemComposeSecondaryRow.marginTop + styles.chatItemComposeSecondaryRow.marginBottom;
        const reportActionComposeHeight = styles.chatItemComposeBox.minHeight + chatItemComposeSecondaryRowHeight;
        const emojiOffsetWithComposeBox = (styles.chatItemComposeBox.minHeight - styles.chatItemEmojiButton.height) / 2;
        return reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;
    })();

    return (
        <>
            <AttachmentPickerWithMenuItems
                onAttachmentPicked={(files) => validateAttachments({files})}
                reportID={reportID}
                report={report}
                currentUserPersonalDetails={currentUserPersonalDetails}
                reportParticipantIDs={reportParticipantIDs}
                isFullComposerAvailable={isFullComposerAvailable}
                isComposerFullSize={isComposerFullSize}
                disabled={isBlockedFromConcierge}
                setMenuVisibility={setMenuVisibility}
                isMenuVisible={isMenuVisible}
                onTriggerAttachmentPicker={onTriggerAttachmentPicker}
                raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLayoutTriggered}
                onAddActionPressed={onAddActionPressed}
                onItemSelected={onItemSelected}
                onCanceledAttachmentPicker={() => {
                    if (!shouldFocusComposerOnScreenFocus) {
                        return;
                    }
                    focus();
                }}
                actionButtonRef={actionButtonRef}
                shouldDisableAttachmentItem={!!exceededMaxLength}
            />
            <ComposerWithSuggestions
                ref={setComposerRef}
                suggestionsRef={suggestionsRef}
                isNextModalWillOpenRef={isNextModalWillOpenRef}
                isScrollLikelyLayoutTriggered={isScrollLayoutTriggered}
                raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLayoutTriggered}
                reportID={reportID}
                policyID={report?.policyID}
                includeChronos={chatIncludesChronos(report)}
                isGroupPolicyReport={isGroupPolicyReport}
                lastReportAction={lastReportAction}
                isMenuVisible={isMenuVisible}
                inputPlaceholder={inputPlaceholder}
                isComposerFullSize={isComposerFullSize}
                setIsFullComposerAvailable={setIsFullComposerAvailable}
                onPasteFile={(files) => validateAttachments({files})}
                onClear={submitForm}
                disabled={isBlockedFromConcierge || isEmojiPickerVisible()}
                onEnterKeyPress={handleSendMessage}
                shouldShowComposeInput={shouldShowComposeInput}
                onFocus={onFocus}
                onBlur={onBlur}
                measureParentContainer={measureContainer}
                onValueChange={onValueChange}
                forwardedFSClass={fsClass}
            />
            {canUseTouchScreen() && isMediumScreenWidth ? null : (
                <EmojiPickerButton
                    isDisabled={isBlockedFromConcierge}
                    onModalHide={(isNavigating) => {
                        if (isNavigating) {
                            return;
                        }
                        const activeElementId = DomUtils.getActiveElement()?.id;
                        if (activeElementId === CONST.COMPOSER.NATIVE_ID || activeElementId === CONST.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                            return;
                        }
                        focus();
                    }}
                    onEmojiSelected={(...args) => composerRef.current?.replaceSelectionWithText(...args)}
                    emojiPickerID={report?.reportID}
                    shiftVertical={emojiShiftVertical}
                />
            )}
            <SendButton
                isDisabled={isSendDisabled}
                handleSendMessage={handleSendMessage}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// Thin wrappers that bridge context → existing child components.
// ---------------------------------------------------------------------------

function ComposerDropZoneWrapper({reportID, shouldAddOrReplaceReceipt, transactionID}: {reportID: string; shouldAddOrReplaceReceipt: boolean; transactionID: string | undefined}) {
    const {validateAttachments, onReceiptDropped} = useComposerInternalsActions();
    return (
        <ComposerDropZone
            reportID={reportID}
            shouldAddOrReplaceReceipt={shouldAddOrReplaceReceipt}
            transactionID={transactionID}
            onAttachmentDrop={(dragEvent) => validateAttachments({dragEvent})}
            onReceiptDrop={onReceiptDropped}
        />
    );
}

function ComposerFooterWrapper({reportID}: {reportID: string}) {
    const {isOffline} = useNetwork();
    const {exceededMaxLength, hasExceededMaxTaskTitleLength} = useComposerSendState();
    return (
        <ComposerFooter
            reportID={reportID}
            exceededMaxLength={exceededMaxLength}
            hasExceededMaxTaskTitleLength={hasExceededMaxTaskTitleLength}
            isOffline={isOffline}
        />
    );
}

// ---------------------------------------------------------------------------
// Orchestrator — layout + report-level data resolution.
// ---------------------------------------------------------------------------

function Composer({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    // --- Report actions & transaction resolution ---
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    // --- lastReportAction (for up-arrow-to-edit) ---
    const parentReportAction = useParentReportAction(report);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${effectiveTransactionThreadReportID}`);
    const transactionThreadReportActionsArray = transactionThreadReportActions ? Object.values(transactionThreadReportActions) : [];
    const combinedReportActions = getCombinedReportActions(filteredReportActions, effectiveTransactionThreadReportID ?? null, transactionThreadReportActionsArray);

    const route = useRoute();
    const isOnSearchMoneyRequestReport = route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || route.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;
    const lastReportAction = [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));

    // --- shouldAddOrReplaceReceipt & transactionID ---
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isTransactionThreadView = isReportTransactionThread(report);
    const isExpensesReport = reportTransactions && reportTransactions.length > 1;

    const [rawReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canEvict: false});
    const iouAction = rawReportActions ? Object.values(rawReportActions).find((action) => isMoneyRequestAction(action)) : null;
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

    if (!report) {
        return null;
    }

    return (
        <View style={[styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerProvider
                reportID={reportID}
                transactionThreadReportID={effectiveTransactionThreadReportID}
                shouldAddOrReplaceReceipt={shouldAddOrReplaceReceipt}
                transactionID={transactionID}
            >
                <Composer.LocalTime
                    reportID={reportID}
                    pendingAction={pendingAction}
                    isComposerFullSize={isComposerFullSize}
                />
                <View style={isComposerFullSize ? styles.flex1 : {}}>
                    <Composer.Box
                        reportID={reportID}
                        isComposerFullSize={isComposerFullSize}
                        pendingAction={pendingAction}
                    >
                        <ComposerBoxContent
                            reportID={reportID}
                            lastReportAction={lastReportAction}
                        />
                        <Composer.DropZone
                            reportID={reportID}
                            shouldAddOrReplaceReceipt={shouldAddOrReplaceReceipt}
                            transactionID={transactionID}
                        />
                    </Composer.Box>
                    <Composer.Footer reportID={reportID} />
                    {!isSmallScreenWidth && (
                        <View style={[styles.mln5, styles.mrn5]}>
                            <ImportedStateIndicator />
                        </View>
                    )}
                </View>
            </ComposerProvider>
        </View>
    );
}

Composer.LocalTime = ComposerLocalTime;
Composer.Box = ComposerBox;
Composer.DropZone = ComposerDropZoneWrapper;
Composer.Footer = ComposerFooterWrapper;

export default Composer;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
