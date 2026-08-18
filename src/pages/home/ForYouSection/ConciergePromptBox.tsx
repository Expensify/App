import AttachmentPicker from '@components/AttachmentPicker';
import Composer from '@components/Composer';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import {PressableWithFeedback} from '@components/Pressable';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import PopoverAnchorTooltip from '@components/Tooltip/PopoverAnchorTooltip';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useKeyboardState from '@hooks/useKeyboardState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import {canSkipTriggerHotkeys} from '@libs/ComposerUtils';
import DateUtils from '@libs/DateUtils';

import variables from '@styles/variables';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {FileObject} from '@src/types/utils/Attachment';

import type {TextInputKeyPressEvent} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import useConciergeAttachmentPicker from './useConciergeAttachmentPicker';

// Max number of lines before the input starts scrolling internally.
const MAX_INPUT_LINES = 5;

function ConciergePromptBox() {
    const styles = useThemeStyles();
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
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(null);
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);

    const clearInput = () => {
        setValue('');
        setSelection({start: 0, end: 0});
    };

    const sendAttachment = (attachments: FileObject | FileObject[]) => {
        askConciergeWithAttachment(attachments, value);
        clearInput();
    };
    const {pickAttachments, PDFValidationComponent} = useConciergeAttachmentPicker(conciergeTargetReportID, sendAttachment);

    // Anchor the "+" popover above the button, mirroring the composer's attachment menu.
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
    const placeholder = translate(shouldUseNarrowLayout ? 'homePage.conciergePrompt.inputPlaceholderMobile' : 'homePage.conciergePrompt.inputPlaceholder');
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
            <View style={[styles.flexRow, styles.alignItemsEnd, styles.gap3, styles.pr1, styles.pv1, styles.getConciergePromptBoxContainerStyle(isFocused)]}>
                <View style={[styles.flexRow, styles.alignSelfStretch]}>
                    <View style={styles.conciergePromptBoxButtonColumn}>
                        <View style={styles.conciergePromptBoxButtonStack}>
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
                                                    <PressableWithFeedback
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
                                                        style={styles.composerSizeButton}
                                                    >
                                                        <Icon
                                                            src={icons.Plus}
                                                            width={variables.iconSizeNormal}
                                                            height={variables.iconSizeNormal}
                                                            fill={theme.icon}
                                                        />
                                                    </PressableWithFeedback>
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
                    <View style={styles.conciergePromptBoxDivider} />
                </View>
                <Composer
                    style={[styles.textNormal, styles.noOutline, styles.flex1, styles.conciergePromptBoxInput]}
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
                    placeholder={placeholder}
                    accessibilityLabel={placeholder}
                />
                <Tooltip text={translate('common.send')}>
                    <PressableWithFeedback
                        accessibilityLabel={translate('common.send')}
                        sentryLabel="ConciergePromptBox-Send"
                        disabled={!canSubmit}
                        onPress={submit}
                        style={[styles.conciergePromptBoxSendButton, canSubmit && styles.buttonSuccess]}
                    >
                        <Icon
                            src={icons.Send}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                            fill={canSubmit ? theme.textLight : theme.icon}
                        />
                    </PressableWithFeedback>
                </Tooltip>
            </View>
            {PDFValidationComponent}
        </View>
    );
}

export default ConciergePromptBox;
