import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useOnyx from '@hooks/useOnyx';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import {useComposerActions, useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';

type ComposerActionMenuProps = {
    reportID: string;
    onAttachmentPicked: (files: FileObject | FileObject[]) => void;
};

function ComposerActionMenu({reportID, onAttachmentPicked}: ComposerActionMenuProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isMenuVisible, isFullComposerAvailable} = useComposerState();
    const {exceededMaxLength} = useComposerSendState();
    const {setMenuVisibility, focus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker} = useComposerActions();
    const {actionButtonRef} = useComposerMeta();

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);

    const {raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const isBlockedFromConcierge = chatIncludesConcierge({participants: report?.participants}) && isBlockedFromConciergeUserAction(blockedFromConcierge);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const shouldFocusComposerOnScreenFocus = canFocusInputOnScreenFocus() || !!draftComment;

    return (
        <AttachmentPickerWithMenuItems
            onAttachmentPicked={onAttachmentPicked}
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
