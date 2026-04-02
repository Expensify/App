import React from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import FS from '@libs/Fullstory';
import {chatIncludesChronos, chatIncludesConcierge} from '@libs/ReportUtils';
import {isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useComposerActions, useComposerMeta, useComposerSendActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import useComposerSubmit from './useComposerSubmit';

type ComposerInputWrapperProps = {
    reportID: string;
};

function ComposerInputWrapper({reportID}: ComposerInputWrapperProps) {
    const {translate} = useLocalize();
    const {isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge, validateAttachments} = useComposerSendState();
    const {setIsFullComposerAvailable, onBlur, onFocus, setComposerRef} = useComposerActions();
    const {handleSendMessage, onValueChange} = useComposerSendActions();
    const {containerRef, suggestionsRef, isNextModalWillOpenRef, attachmentFileRef} = useComposerMeta();

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);

    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        containerRef.current?.measureInWindow(callback);
    };

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {submitForm} = useComposerSubmit({report, reportID, attachmentFileRef});

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const isGroupPolicyReport = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;
    const inputPlaceholder = includesConcierge && userBlockedFromConcierge ? translate('reportActionCompose.blockedFromConcierge') : translate('reportActionCompose.writeSomething');
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
    );
}

export default ComposerInputWrapper;
