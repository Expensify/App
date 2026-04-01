import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import FS from '@libs/Fullstory';
import {chatIncludesChronos, chatIncludesConcierge} from '@libs/ReportUtils';
import {isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import {useComposerBox} from './ComposerBox';
import {useComposerActions, useComposerData, useComposerDataActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerWithSuggestions from './ComposerWithSuggestions';

type ComposerBoxContentProps = {
    reportID: string;
};

function ComposerBoxContent({reportID}: ComposerBoxContentProps) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {isComposerFullSize, isFullComposerAvailable, isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge, exceededMaxLength} = useComposerSendState();
    const {setMenuVisibility, setIsFullComposerAvailable, handleSendMessage, focus, onValueChange} = useComposerActions();
    const {suggestionsRef, actionButtonRef, isNextModalWillOpenRef, shouldFocusComposerOnScreenFocus, shouldShowComposeInput, userBlockedFromConcierge} = useComposerData();
    const {onBlur, onFocus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, submitForm, validateAttachments, setComposerRef} = useComposerDataActions();
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
        </>
    );
}

export default ComposerBoxContent;
