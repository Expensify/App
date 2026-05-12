import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useOnyx from '@hooks/useOnyx';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {chatIncludesConcierge} from '@libs/ReportUtils';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import {useComposerActions, useComposerMeta, useComposerSendState, useComposerState} from './ComposerContext';
import useAttachmentPicker from './useAttachmentPicker';

type ComposerActionMenuProps = {
    reportID: string;
};

function ComposerActionMenu({reportID}: ComposerActionMenuProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isMenuVisible, isFullComposerAvailable, draftComment} = useComposerState();
    const {exceededMaxLength} = useComposerSendState();
    const {setMenuVisibility, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker} = useComposerActions();
    const {actionButtonRef, composerRef} = useComposerMeta();
    const {pickAttachments, PDFValidationComponent, ErrorModal} = useAttachmentPicker(reportID);

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const {raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const isBlockedFromConcierge = chatIncludesConcierge({participants: report?.participants}) && isBlockedFromConciergeUserAction(blockedFromConcierge);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const shouldFocusComposerOnScreenFocus = canFocusInputOnScreenFocus() || !!draftComment;

    return (
        <>
            <AttachmentPickerWithMenuItems
                testID={CONST.COMPOSER.TEST_ID.DRAFT_MESSAGE_ACTION_ROW}
                onAttachmentPicked={(files) => pickAttachments({files})}
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
                    composerRef.current?.focus(true);
                }}
                actionButtonRef={actionButtonRef}
                shouldDisableAttachmentItem={!!exceededMaxLength}
            />
            {PDFValidationComponent}
            {ErrorModal}
        </>
    );
}

export default ComposerActionMenu;
