import React from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import FS from '@libs/Fullstory';
import {
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
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import {useComposerActions, useComposerMeta, useComposerSendActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerWithSuggestions from './ComposerWithSuggestions';

type ComposerInputWrapperProps = {
    reportID: string;
    submitForm: (comment: string) => void;
    onPasteFile: (files: FileObject | FileObject[]) => void;
    lastReportAction: OnyxEntry<OnyxTypes.ReportAction>;
};

const AI_PLACEHOLDER_KEYS = ['reportActionCompose.askConciergeToUpdate', 'reportActionCompose.askConciergeToCorrect', 'reportActionCompose.askConciergeForHelp'] as const;

function getRandomPlaceholder(translate: LocalizedTranslate): string {
    const randomIndex = Math.floor(Math.random() * AI_PLACEHOLDER_KEYS.length);
    return translate(AI_PLACEHOLDER_KEYS[randomIndex]);
}

function ComposerInputWrapper({reportID, submitForm, onPasteFile, lastReportAction}: ComposerInputWrapperProps) {
    const {translate, preferredLocale} = useLocalize();
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

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const isGroupPolicyReport = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;
    const isExpenseRelatedReport = isReportTransactionThread(report) || isMoneyRequestReport(report);
    const isEnglishLocale = (preferredLocale ?? CONST.LOCALES.DEFAULT) === CONST.LOCALES.EN;
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);

    const inputPlaceholder = (() => {
        if (includesConcierge && userBlockedFromConcierge) {
            return translate('reportActionCompose.blockedFromConcierge');
        }
        if (isExpenseRelatedReport && canUserPerformWriteAction && isEnglishLocale) {
            return getRandomPlaceholder(translate);
        }
        return translate('reportActionCompose.writeSomething');
    })();
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
            setIsCommentEmpty={() => {}}
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

export default ComposerInputWrapper;
