import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useOnyx from '@hooks/useOnyx';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import {useComposerActions, useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';

type ComposerActionMenuProps = {
    reportID: string;
};

function ComposerActionMenu({reportID}: ComposerActionMenuProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isMenuVisible, isFullComposerAvailable} = useComposerState();
    const {isBlockedFromConcierge, exceededMaxLength, validateAttachments} = useComposerSendState();
    const {setMenuVisibility, focus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker} = useComposerActions();
    const {actionButtonRef} = useComposerMeta();

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);

    const {raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const shouldFocusComposerOnScreenFocus = canFocusInputOnScreenFocus() || !!draftComment;

    return (
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
    );
}

export default ComposerActionMenu;
