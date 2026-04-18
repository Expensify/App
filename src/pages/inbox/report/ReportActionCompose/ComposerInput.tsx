import {useRoute} from '@react-navigation/native';
import React from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import FS from '@libs/Fullstory';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getCombinedReportActions, getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isMoneyRequestAction, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {
    canEditReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    chatIncludesChronos,
    chatIncludesConcierge,
    isMoneyRequestReport,
    isReportTransactionThread,
} from '@libs/ReportUtils';
import {isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import {useComposerActions, useComposerMeta, useComposerSendActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerWithSuggestions from './ComposerWithSuggestions';

type ComposerInputProps = {
    reportID: string;
    submitForm: (comment: string) => void;
    onPasteFile: (files: FileObject | FileObject[]) => void;
};

const AI_PLACEHOLDER_KEYS = ['reportActionCompose.askConciergeToUpdate', 'reportActionCompose.askConciergeToCorrect', 'reportActionCompose.askConciergeForHelp'] as const;

function getRandomPlaceholder(translate: LocalizedTranslate): string {
    const randomIndex = Math.floor(Math.random() * AI_PLACEHOLDER_KEYS.length);
    return translate(AI_PLACEHOLDER_KEYS[randomIndex]);
}

function ComposerInput({reportID, submitForm, onPasteFile}: ComposerInputProps) {
    const {translate, preferredLocale} = useLocalize();
    const {isOffline} = useNetwork();
    const {isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge} = useComposerSendState();
    const {setIsFullComposerAvailable, onBlur, onFocus, setComposerRef} = useComposerActions();
    const {handleSendMessage, onValueChange} = useComposerSendActions();
    const {containerRef, suggestionsRef, isNextModalWillOpenRef} = useComposerMeta();

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);

    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        containerRef.current?.measureInWindow(callback);
    };

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const isReportArchived = useReportIsArchived(report?.reportID);

    // --- lastReportAction derivation (moves to useLastEditableAction hook in PR 4) ---
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;
    const parentReportAction = useParentReportAction(report);
    const [transactionThreadReportActionsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${effectiveTransactionThreadReportID}`);
    const transactionThreadReportActionsArray = transactionThreadReportActionsOnyx ? Object.values(transactionThreadReportActionsOnyx) : [];
    const combinedReportActions = getCombinedReportActions(filteredReportActions, effectiveTransactionThreadReportID ?? null, transactionThreadReportActionsArray);
    const route = useRoute();
    const isOnSearchMoneyRequestReport = route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || route.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;
    const lastReportAction = [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const isGroupPolicyReport = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;
    const isExpenseRelatedReport = isReportTransactionThread(report) || isMoneyRequestReport(report);
    const isEnglishLocale = (preferredLocale ?? CONST.LOCALES.DEFAULT) === CONST.LOCALES.EN;
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);

    let inputPlaceholder = translate('reportActionCompose.writeSomething');
    if (includesConcierge && userBlockedFromConcierge) {
        inputPlaceholder = translate('reportActionCompose.blockedFromConcierge');
    } else if (isExpenseRelatedReport && canUserPerformWriteAction && isEnglishLocale) {
        inputPlaceholder = getRandomPlaceholder(translate);
    }
    const fsClass = report ? FS.getChatFSClass(report) : undefined;

    return (
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
            onPasteFile={onPasteFile}
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
    );
}

export default ComposerInput;
