import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useOnyx from '@hooks/useOnyx';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import {useComposerActions, useComposerMeta, useComposerMetaActions, useComposerSendState, useComposerState} from './ComposerContext';

type ComposerActionMenuProps = {
    reportID: string;
};

function ComposerActionMenu({reportID}: ComposerActionMenuProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isComposerFullSize, isFullComposerAvailable, isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge, exceededMaxLength} = useComposerSendState();
    const {setMenuVisibility, focus} = useComposerActions();
    const {actionButtonRef, shouldFocusComposerOnScreenFocus} = useComposerMeta();
    const {onAddActionPressed, onItemSelected, onTriggerAttachmentPicker, validateAttachments} = useComposerMetaActions();

    const {raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

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
