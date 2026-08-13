import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import {PressableWithFeedback} from '@components/Pressable';
import RNTextInput from '@components/RNTextInput';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import DateUtils from '@libs/DateUtils';

import variables from '@styles/variables';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import useConciergeAttachmentPicker from './useConciergeAttachmentPicker';

// Max input height (~5 lines) before the input starts scrolling internally.
const MAX_INPUT_HEIGHT = variables.componentSizeNormal * 3;

function ConciergePromptBox() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {firstName} = useCurrentUserPersonalDetails();
    const {askConcierge, askConciergeWithAttachment, shouldShowAskConcierge, conciergeTargetReportID} = useAskConcierge({forceConcierge: true});
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Send', 'Paperclip']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const [value, setValue] = useState('');
    // The RNTextInput can't auto-grow on its own, so we measure a hidden mirror of its content
    // (grows and shrinks correctly across web/native) and drive the input height from it.
    const [inputWidth, setInputWidth] = useState(0);
    const [contentHeight, setContentHeight] = useState(variables.lineHeightXLarge);
    const [isFocused, setIsFocused] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(null);
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);

    const sendAttachment = (attachments: FileObject | FileObject[]) => {
        askConciergeWithAttachment(attachments, value);
        setValue('');
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

    // Grow the input to fit its content (measured mirror + vertical padding), clamped between a single
    // line and a max height (~5 lines) after which the input scrolls internally.
    const inputHeight = Math.min(MAX_INPUT_HEIGHT, Math.max(variables.componentSizeNormal, contentHeight + variables.componentSizeNormal - variables.lineHeightXLarge));

    const submit = () => {
        if (!canSubmit) {
            return;
        }
        askConcierge(value);
        setValue('');
    };

    return (
        <View style={styles.gap6}>
            <View style={styles.gap1}>
                <Text style={styles.textLabelSupporting}>{dateLabel}</Text>
                <Text style={styles.textHeadlineH1}>{greeting}</Text>
            </View>
            <View style={[styles.flexRow, styles.alignItemsEnd, styles.gap3, styles.ph1, styles.pv1, styles.getConciergePromptBoxContainerStyle(isFocused)]}>
                <View style={[styles.flexRow, styles.alignItemsEnd, styles.alignSelfStretch]}>
                    <AttachmentPicker
                        allowMultiple
                        fileLimit={CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT}
                        shouldValidateImage={false}
                    >
                        {({openPicker}) => {
                            const triggerAttachmentPicker = () => openPicker({onPicked: pickAttachments});
                            return (
                                <>
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
                                        style={styles.conciergePromptBoxAddButton}
                                    >
                                        <Icon
                                            src={icons.Plus}
                                            width={variables.iconSizeNormal}
                                            height={variables.iconSizeNormal}
                                            fill={theme.icon}
                                        />
                                    </PressableWithFeedback>
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
                    <View style={styles.conciergePromptBoxDivider} />
                </View>
                <View style={styles.flex1}>
                    <RNTextInput
                        style={[styles.textNormal, styles.noOutline, styles.conciergePromptBoxInput, {height: inputHeight}]}
                        value={value}
                        onChangeText={setValue}
                        onLayout={(e) => setInputWidth(e.nativeEvent.layout.width)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        multiline
                        placeholder={placeholder}
                        placeholderTextColor={theme.placeholderText}
                        onSubmitEditing={submit}
                        submitBehavior="submit"
                        returnKeyType="send"
                        accessibilityLabel={placeholder}
                    />
                    {inputWidth > 0 && (
                        <Text
                            style={[styles.textNormal, styles.conciergePromptBoxInputMeasure, styles.hiddenElementOutsideOfWindow, styles.visibilityHidden, {width: inputWidth}]}
                            onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
                            accessible={false}
                            aria-hidden
                        >
                            {/* Trailing zero-width space so a value ending in a newline still measures the extra line. */}
                            {value ? `${value}${value.endsWith('\n') ? '\u200B' : ''}` : placeholder}
                        </Text>
                    )}
                </View>
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
            </View>
            {PDFValidationComponent}
        </View>
    );
}

ConciergePromptBox.displayName = 'ConciergePromptBox';

export default ConciergePromptBox;
