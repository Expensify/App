import React, {useEffect} from 'react';
import {View} from 'react-native';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DomUtils from '@libs/DomUtils';
import FS from '@libs/Fullstory';
import {chatIncludesChronos, chatIncludesConcierge, getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction, isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerBox, {useComposerBox} from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import {useComposerActions, useComposerData, useComposerDataActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerFooter from './ComposerFooter';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import SendButton from './SendButton';

type ReportActionComposeProps = {
    /** The ID of the report this composer is for */
    reportID: string;
};

// ---------------------------------------------------------------------------
// ComposerBoxContent — reads from all contexts, passes props to children.
// Transitional: shrinks as children self-subscribe to context.
// ---------------------------------------------------------------------------

type ComposerBoxContentProps = {
    reportID: string;
};

function ComposerBoxContent({reportID}: ComposerBoxContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isMediumScreenWidth} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {isComposerFullSize, isFullComposerAvailable, isMenuVisible} = useComposerState();
    const {isBlockedFromConcierge, isSendDisabled, exceededMaxLength} = useComposerSendState();
    const {setMenuVisibility, setIsFullComposerAvailable, handleSendMessage, focus, onValueChange} = useComposerActions();
    const {composerRef, suggestionsRef, actionButtonRef, isNextModalWillOpenRef, shouldFocusComposerOnScreenFocus, shouldShowComposeInput, userBlockedFromConcierge} = useComposerData();
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

    const emojiShiftVertical = (() => {
        const chatItemComposeSecondaryRowHeight = styles.chatItemComposeSecondaryRow.height + styles.chatItemComposeSecondaryRow.marginTop + styles.chatItemComposeSecondaryRow.marginBottom;
        const reportActionComposeHeight = styles.chatItemComposeBox.minHeight + chatItemComposeSecondaryRowHeight;
        const emojiOffsetWithComposeBox = (styles.chatItemComposeBox.minHeight - styles.chatItemEmojiButton.height) / 2;
        return reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;
    })();

    // Hide emoji picker on unmount or when switching reports — co-located with EmojiPickerButton trigger
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(report?.reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        [report?.reportID],
    );

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
            {canUseTouchScreen() && isMediumScreenWidth ? null : (
                <EmojiPickerButton
                    isDisabled={isBlockedFromConcierge}
                    onModalHide={(isNavigating) => {
                        if (isNavigating) {
                            return;
                        }
                        const activeElementId = DomUtils.getActiveElement()?.id;
                        if (activeElementId === CONST.COMPOSER.NATIVE_ID || activeElementId === CONST.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                            return;
                        }
                        focus();
                    }}
                    onEmojiSelected={(...args) => composerRef.current?.replaceSelectionWithText(...args)}
                    emojiPickerID={report?.reportID}
                    shiftVertical={emojiShiftVertical}
                />
            )}
            <SendButton
                isDisabled={isSendDisabled}
                handleSendMessage={handleSendMessage}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// Orchestrator — layout + report-level data resolution.
// ---------------------------------------------------------------------------

function Composer({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    if (!report) {
        return null;
    }

    return (
        <View style={[styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerProvider reportID={reportID}>
                <Composer.LocalTime
                    reportID={reportID}
                    pendingAction={pendingAction}
                    isComposerFullSize={isComposerFullSize}
                />
                <View style={isComposerFullSize ? styles.flex1 : {}}>
                    <Composer.DropZone reportID={reportID}>
                        <Composer.Box
                            isComposerFullSize={isComposerFullSize}
                            pendingAction={pendingAction}
                        >
                            <ComposerBoxContent reportID={reportID} />
                        </Composer.Box>
                    </Composer.DropZone>
                    <Composer.Footer reportID={reportID} />
                    {!isSmallScreenWidth && (
                        <View style={[styles.mln5, styles.mrn5]}>
                            <ImportedStateIndicator />
                        </View>
                    )}
                </View>
            </ComposerProvider>
        </View>
    );
}

Composer.LocalTime = ComposerLocalTime;
Composer.Box = ComposerBox;
Composer.DropZone = ComposerDropZone;
Composer.Footer = ComposerFooter;

export default Composer;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
