import React from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {setIsComposerFullSize} from '@libs/actions/Report';
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
import {useComposerActions, useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import useAttachmentPicker from './useAttachmentPicker';
import useComposerSubmit from './useComposerSubmit';

type ComposerInputProps = {
    reportID: string;
};

const AI_PLACEHOLDER_KEYS = ['reportActionCompose.askConciergeToUpdate', 'reportActionCompose.askConciergeToCorrect', 'reportActionCompose.askConciergeForHelp'] as const;

function getRandomPlaceholder(translate: LocalizedTranslate): string {
    const randomIndex = Math.floor(Math.random() * AI_PLACEHOLDER_KEYS.length);
    return translate(AI_PLACEHOLDER_KEYS[randomIndex]);
}

function ComposerInput({reportID}: ComposerInputProps) {
    const {translate, preferredLocale} = useLocalize();
    const {isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge, debouncedCommentMaxLengthValidation} = useComposerSendState();
    const {setIsFullComposerAvailable, onBlur, onFocus, setComposerRef, setText} = useComposerActions();
    const {containerRef, suggestionsRef, isNextModalWillOpenRef} = useComposerMeta();

    const {submitDraftAndClearComposer, validateAndSubmitDraft} = useComposerSubmit(reportID);
    const {pickAttachments, PDFValidationComponent, ErrorModal} = useAttachmentPicker(reportID);

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);

    const onValueChange = (v: string) => {
        setText(v);
        if (v.length === 0 && isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }
        debouncedCommentMaxLengthValidation?.(v);
    };

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

    let inputPlaceholder = translate('reportActionCompose.writeSomething');
    if (includesConcierge && userBlockedFromConcierge) {
        inputPlaceholder = translate('reportActionCompose.blockedFromConcierge');
    } else if (isExpenseRelatedReport && canUserPerformWriteAction && isEnglishLocale) {
        inputPlaceholder = getRandomPlaceholder(translate);
    }
    const fsClass = report ? FS.getChatFSClass(report) : undefined;

    return (
        <>
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
                isMenuVisible={isMenuVisible}
                inputPlaceholder={inputPlaceholder}
                isComposerFullSize={isComposerFullSize}
                setIsFullComposerAvailable={setIsFullComposerAvailable}
                onPasteFile={(files) => pickAttachments({files})}
                onClear={validateAndSubmitDraft}
                disabled={isBlockedFromConcierge || isEmojiPickerVisible()}
                onEnterKeyPress={submitDraftAndClearComposer}
                onFocus={onFocus}
                onBlur={onBlur}
                measureParentContainer={measureContainer}
                onValueChange={onValueChange}
                forwardedFSClass={fsClass}
            />
            {PDFValidationComponent}
            {ErrorModal}
        </>
    );
}

export default ComposerInput;
