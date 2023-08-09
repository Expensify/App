import React from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import Icon from '../../../../components/Icon';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import AttachmentPicker from '../../../../components/AttachmentPicker';
import * as Report from '../../../../libs/actions/Report';
import PopoverMenu from '../../../../components/PopoverMenu';
import willBlurTextInputOnTapOutsideFunc from '../../../../libs/willBlurTextInputOnTapOutside';
import CONST from '../../../../CONST';
import Tooltip from '../../../../components/Tooltip';
import * as Browser from '../../../../libs/Browser';
import PressableWithFeedback from '../../../../components/Pressable/PressableWithFeedback';
import useLocalize from '../../../../hooks/useLocalize';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';

function AttachmentPickerWithMenuItems({
    displayFileInModal,
    moneyRequestOptions,
    taskOption,
    isFullSizeComposerAvailable,
    isComposerFullSize,
    updateShouldShowSuggestionMenuToFalse,
    reportID,
    isBlockedFromConcierge,
    disabled,
    actionButtonRef,
    setMenuVisibility,
    isMenuVisible,
}) {
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();

    return (
        <AttachmentPicker>
            {({openPicker}) => {
                const triggerAttachmentPicker = () => {
                    // Set a flag to block suggestion calculation until we're finished using the file picker,
                    // which will stop any flickering as the file picker opens on non-native devices.
                    if (willBlurTextInputOnTapOutsideFunc) {
                        shouldBlockEmojiCalc.current = true;
                        shouldBlockMentionCalc.current = true;
                    }
                    openPicker({
                        onPicked: displayFileInModal,
                    });
                };
                const menuItems = [
                    ...moneyRequestOptions,
                    ...taskOption,
                    {
                        icon: Expensicons.Paperclip,
                        text: translate('reportActionCompose.addAttachment'),
                        onSelected: () => {
                            if (Browser.isSafari()) {
                                return;
                            }
                            triggerAttachmentPicker();
                        },
                    },
                ];
                return (
                    <>
                        <View style={[styles.dFlex, styles.flexColumn, isFullSizeComposerAvailable || isComposerFullSize ? styles.justifyContentBetween : styles.justifyContentCenter]}>
                            {isComposerFullSize && (
                                <Tooltip text={translate('reportActionCompose.collapse')}>
                                    <PressableWithFeedback
                                        onPress={(e) => {
                                            e.preventDefault();
                                            updateShouldShowSuggestionMenuToFalse();
                                            Report.setIsComposerFullSize(reportID, false);
                                        }}
                                        // Keep focus on the composer when Collapse button is clicked.
                                        onMouseDown={(e) => e.preventDefault()}
                                        style={styles.composerSizeButton}
                                        disabled={isBlockedFromConcierge || disabled}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                        accessibilityLabel={translate('reportActionCompose.collapse')}
                                    >
                                        <Icon src={Expensicons.Collapse} />
                                    </PressableWithFeedback>
                                </Tooltip>
                            )}
                            {!isComposerFullSize && isFullSizeComposerAvailable && (
                                <Tooltip text={translate('reportActionCompose.expand')}>
                                    <PressableWithFeedback
                                        onPress={(e) => {
                                            e.preventDefault();
                                            updateShouldShowSuggestionMenuToFalse();
                                            Report.setIsComposerFullSize(reportID, true);
                                        }}
                                        // Keep focus on the composer when Expand button is clicked.
                                        onMouseDown={(e) => e.preventDefault()}
                                        style={styles.composerSizeButton}
                                        disabled={isBlockedFromConcierge || disabled}
                                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                        accessibilityLabel={translate('reportActionCompose.expand')}
                                    >
                                        <Icon src={Expensicons.Expand} />
                                    </PressableWithFeedback>
                                </Tooltip>
                            )}
                            <Tooltip text={translate('reportActionCompose.addAction')}>
                                <PressableWithFeedback
                                    ref={actionButtonRef}
                                    onPress={(e) => {
                                        e.preventDefault();

                                        // Drop focus to avoid blue focus ring.
                                        actionButtonRef.current.blur();
                                        setMenuVisibility(!isMenuVisible);
                                    }}
                                    style={styles.composerSizeButton}
                                    disabled={isBlockedFromConcierge || disabled}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                    accessibilityLabel={translate('reportActionCompose.addAction')}
                                >
                                    <Icon src={Expensicons.Plus} />
                                </PressableWithFeedback>
                            </Tooltip>
                        </View>
                        <PopoverMenu
                            animationInTiming={CONST.ANIMATION_IN_TIMING}
                            isVisible={isMenuVisible}
                            onClose={() => setMenuVisibility(false)}
                            onItemSelected={(item, index) => {
                                setMenuVisibility(false);

                                // In order for the file picker to open dynamically, the click
                                // function must be called from within a event handler that was initiated
                                // by the user on Safari.
                                if (index === menuItems.length - 1) {
                                    triggerAttachmentPicker();
                                }
                            }}
                            anchorPosition={styles.createMenuPositionReportActionCompose(windowHeight)}
                            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
                            menuItems={menuItems}
                            withoutOverlay
                            anchorRef={actionButtonRef}
                        />
                    </>
                );
            }}
        </AttachmentPicker>
    );
}

export default AttachmentPickerWithMenuItems;
