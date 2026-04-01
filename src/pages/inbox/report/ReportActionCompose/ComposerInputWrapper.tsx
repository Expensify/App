import React from 'react';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import FS from '@libs/Fullstory';
import {chatIncludesChronos, chatIncludesConcierge} from '@libs/ReportUtils';
import {isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {useComposerBox} from './ComposerBox';
import {useComposerActions, useComposerMeta, useComposerMetaActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerWithSuggestions from './ComposerWithSuggestions';

type ComposerInputWrapperProps = {
    reportID: string;
};

function ComposerInputWrapper({reportID}: ComposerInputWrapperProps) {
    const {translate} = useLocalize();
    const {isComposerFullSize, isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge} = useComposerSendState();
    const {setIsFullComposerAvailable, handleSendMessage, onValueChange} = useComposerActions();
    const {suggestionsRef, isNextModalWillOpenRef, shouldShowComposeInput, userBlockedFromConcierge} = useComposerMeta();
    const {onBlur, onFocus, submitForm, validateAttachments, setComposerRef} = useComposerMetaActions();
    const {measureContainer} = useComposerBox();

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

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
