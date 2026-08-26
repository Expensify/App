import AttachmentPicker from '@components/AttachmentPicker';
import Composer from '@components/Composer';
import type {ComposerRef} from '@components/Composer/types';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';
import Text from '@components/Text';
import PopoverAnchorTooltip from '@components/Tooltip/PopoverAnchorTooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import {forceClearInput} from '@libs/ComponentUtils';
import {canSkipTriggerHotkeys} from '@libs/ComposerUtils';
import DateUtils from '@libs/DateUtils';
import getButtonState from '@libs/getButtonState';

import SubmitDraftButton from '@pages/inbox/report/ReportActionCompose/SubmitDraftButton';

import variables from '@styles/variables';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {FileObject} from '@src/types/utils/Attachment';

import type {NativeMethods, TextInputKeyPressEvent} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useAnimatedRef} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';

import useConciergeAttachmentPicker from './useConciergeAttachmentPicker';

// Max number of lines before the input starts scrolling internally.
const MAX_INPUT_LINES = 5;

// A single line of placeholder text is one lineHeightXLarge tall. Anything meaningfully taller has wrapped.
const SINGLE_LINE_PLACEHOLDER_MAX_HEIGHT = variables.lineHeightXLarge * 1.5;

type ConciergePromptBoxProps = {
    /**
     * Visibility of the "+" actions menu is owned by HomePage (above the narrow/wide layout branch) so it survives the
     * ForYouSection remount that happens when crossing the responsive breakpoint. Otherwise the open menu would be lost
     * on resize instead of converting between an anchored popover and a bottom-docked modal.
     */
    isMenuVisible: boolean;
    setIsMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

function ConciergePromptBox({isMenuVisible, setIsMenuVisible}: ConciergePromptBoxProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isKeyboardShown} = useKeyboardState();
    const {firstName} = useCurrentUserPersonalDetails();
    const {askConcierge, askConciergeWithAttachment, shouldShowAskConcierge, conciergeTargetReportID} = useAskConcierge({forceConcierge: true});
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Send', 'Paperclip']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const [value, setValue] = useState('');

    // Composer is a controlled input: the caret position must be tracked and fed back in (with
    // shouldCalculateCaretPosition), otherwise every value update re-renders it with the caret at the start.
    const [selection, setSelection] = useState({start: 0, end: 0});
    const [isFocused, setIsFocused] = useState(false);
    const [longPlaceholderHeight, setLongPlaceholderHeight] = useState<number | null>(null);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(null);
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const animatedRef = useAnimatedRef<NativeMethods>();

    const setComposerRef = (element: ComposerRef) => {
        animatedRef(element);
    };

    const clearInput = () => {
        setValue('');
        setSelection({start: 0, end: 0});
        scheduleOnUI(forceClearInput, animatedRef);
    };

    const sendAttachment = (attachments: FileObject | FileObject[]) => {
        askConciergeWithAttachment(attachments, value);
        clearInput();
    };
    const {pickAttachments, PDFValidationComponent} = useConciergeAttachmentPicker(conciergeTargetReportID, sendAttachment);

    // Anchor the "+" popover above the button.
    useEffect(() => {
        if (!actionButtonRef.current || !isMenuVisible) {
            return;
        }
        calculatePopoverPosition(actionButtonRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        }).then((position) => {
            setPopoverAnchorPosition({...position, vertical: position.vertical - CONST.MODAL.POPOVER_MENU_PADDING});
        });
    }, [isMenuVisible, calculatePopoverPosition]);

    // Current moment in the user's timezone (resolved by the localization provider).
    const localNow = getLocalDateFromDatetime();
    const dateLabel = DateUtils.formatToLongDateWithWeekdayWithoutYear(localNow, dateFnsLocale);
    const greeting = translate(`homePage.conciergePrompt.${DateUtils.getTimeOfDayGreetingKey(localNow)}`, {name: firstName});
    const longPlaceholder = translate('homePage.conciergePrompt.inputPlaceholder');
    const shortPlaceholder = translate('homePage.conciergePrompt.inputPlaceholderMobile');

    // Use the long placeholder only on the wide layout once the probe confirms it fits one line.
    // Default to the short copy until measured, so it never flashes a wrapped long placeholder that then collapses.
    const longPlaceholderFitsOneLine = longPlaceholderHeight !== null && longPlaceholderHeight <= SINGLE_LINE_PLACEHOLDER_MAX_HEIGHT;
    const placeholder = shouldUseNarrowLayout || !longPlaceholderFitsOneLine ? shortPlaceholder : longPlaceholder;
    const canSubmit = shouldShowAskConcierge && value.trim().length > 0;

    const submit = () => {
        if (!canSubmit) {
            return;
        }
        askConcierge(value);
        clearInput();
    };

    const handleKeyPress = (event: TextInputKeyPressEvent) => {
        if (canSkipTriggerHotkeys(shouldUseNarrowLayout, isKeyboardShown)) {
            return;
        }
        const {nativeEvent} = event;
        const hasShiftModifier = 'shiftKey' in nativeEvent && !!nativeEvent.shiftKey;
        if (nativeEvent.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || hasShiftModifier) {
            return;
        }
        event.preventDefault();
        submit();
    };

    return (
        <View style={styles.gap6}>
            <View style={styles.gap1}>
                <Text style={styles.textLabelSupporting}>{dateLabel}</Text>
                <Text style={styles.textHeadlineH1}>{greeting}</Text>
            </View>
            <View style={[isFocused ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor, styles.flexRow, styles.chatItemComposeBox]}>
                <View style={styles.composerButtonColumn}>
                    <View style={styles.composerButtonStack}>
                        <View style={[styles.flexGrow0, styles.flexShrink0]}>
                            <AttachmentPicker
                                allowMultiple
                                fileLimit={CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT}
                                shouldValidateImage={false}
                            >
                                {({openPicker}) => {
                                    const triggerAttachmentPicker = () => openPicker({onPicked: pickAttachments});
                                    return (
                                        <>
                                            <PopoverAnchorTooltip text={translate('reportActionCompose.addAttachment')}>
                                                <PressableWithoutFeedback
                                                    ref={actionButtonRef}
                                                    accessibilityLabel={translate('accessibilityHints.openActionsMenu')}
                                                    role={CONST.ROLE.BUTTON}
                                                    sentryLabel="ConciergePromptBox-AddAttachment"
                                                    disabled={!shouldShowAskConcierge}
                                                    onPress={(e) => {
                                                        e?.preventDefault();
                                                        actionButtonRef.current?.blur();
                                                        setIsMenuVisible((prev) => !prev);
                                                    }}
                                                    style={({hovered, pressed}) => [
                                                        styles.composerSizeButton,
                                                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered && shouldShowAskConcierge, pressed && shouldShowAskConcierge)),
                                                    ]}
                                                >
                                                    {({hovered, pressed}) => (
                                                        <Icon
                                                            src={icons.Plus}
                                                            fill={StyleUtils.getIconFillColor(getButtonState(hovered && shouldShowAskConcierge, pressed && shouldShowAskConcierge))}
                                                        />
                                                    )}
                                                </PressableWithoutFeedback>
                                            </PopoverAnchorTooltip>
                                            <PopoverMenu
                                                isVisible={isMenuVisible}
                                                onClose={() => setIsMenuVisible(false)}
                                                onItemSelected={() => {
                                                    setIsMenuVisible(false);

                                                    // On Safari the file picker must be opened from within the user-initiated
                                                    // event handler, so it can't wait for the popover to finish closing.
                                                    if (isSafari()) {
                                                        triggerAttachmentPicker();
                                                        return;
                                                    }
                                                    close(triggerAttachmentPicker);
                                                }}
                                                anchorPosition={popoverAnchorPosition ?? {horizontal: 0, vertical: 0}}
                                                anchorAlignment={{
                                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                                                }}
                                                menuItems={[
                                                    {
                                                        icon: icons.Paperclip,
                                                        text: translate('reportActionCompose.addAttachment'),
                                                        shouldCallAfterModalHide: shouldUseNarrowLayout,
                                                    },
                                                ]}
                                                anchorRef={actionButtonRef}
                                            />
                                        </>
                                    );
                                }}
                            </AttachmentPicker>
                        </View>
                        <View style={styles.conciergePromptBoxButtonSpacer} />
                    </View>
                </View>
                <View style={[StyleUtils.getContainerComposeStyles(), styles.pRelative]}>
                    <Composer
                        ref={setComposerRef}
                        style={[styles.textInputCompose, styles.textInputCollapseCompose]}
                        value={value}
                        onChangeText={setValue}
                        selection={selection}
                        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
                        shouldCalculateCaretPosition
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyPress={handleKeyPress}
                        maxLines={MAX_INPUT_LINES}
                        multiline
                        textAlignVertical="top"
                        placeholder={placeholder}
                        placeholderTextColor={theme.placeholderText}
                        accessibilityLabel={placeholder}
                    />
                    {/* Hidden probe stretched to the input's width. Its height reveals whether the long placeholder wraps past one line. */}
                    <View
                        pointerEvents="none"
                        style={styles.conciergePromptBoxPlaceholderProbe}
                        onLayout={(event) => setLongPlaceholderHeight(event.nativeEvent.layout.height)}
                    >
                        <Text
                            accessible={false}
                            style={styles.textInputCompose}
                        >
                            {longPlaceholder}
                        </Text>
                    </View>
                </View>
                {/* Mirror ComposerSendButton: the justifyContentEnd wrapper stretches to the row height and anchors the send button to the bottom. */}
                <View style={styles.justifyContentEnd}>
                    <SubmitDraftButton
                        accessibilityLabel={translate('common.send')}
                        sentryLabel="ConciergePromptBox-Send"
                        isDisabled={!canSubmit}
                        icon={icons.Send}
                        label={translate('common.send')}
                        onPress={submit}
                    />
                </View>
            </View>
            {PDFValidationComponent}
        </View>
    );
}

export default ConciergePromptBox;
