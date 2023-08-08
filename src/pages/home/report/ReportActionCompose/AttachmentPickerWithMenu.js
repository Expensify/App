import React, {useRef, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
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
import * as ReportUtils from '../../../../libs/ReportUtils';
import * as IOU from '../../../../libs/actions/IOU';
import * as Task from '../../../../libs/actions/Task';
import ONYXKEYS from '../../../../ONYXKEYS';
import Permissions from '../../../../libs/Permissions';

function AttachmentPickerWithMenu({
    // Onyx
    betas,
    // Other props
    report,
    reportParticipants,
    suggestionsRef,
    displayFileInModal,
    isFullSizeComposerAvailable,
    isComposerFullSize,
    updateShouldShowSuggestionMenuToFalse,
    reportID,
    disabled,
    setMenuVisibility,
    isMenuVisible,
}) {
    const actionButtonRef = useRef(null);
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions;

    /**
     * Returns the list of IOU Options
     * @returns {Array<object>}
     */
    const moneyRequestOptions = useMemo(() => {
        const options = {
            [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: translate('iou.splitBill'),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: translate('iou.requestMoney'),
            },
            [CONST.IOU.MONEY_REQUEST_TYPE.SEND]: {
                icon: Expensicons.Send,
                text: translate('iou.sendMoney'),
            },
        };

        return _.map(ReportUtils.getMoneyRequestOptions(report, reportParticipants, betas), (option) => ({
            ...options[option],
            onSelected: () => IOU.startMoneyRequest(option, reportID),
        }));
    }, [betas, report, reportID, reportParticipants, translate]);

    /**
     * Determines if we can show the task option
     * @returns {Boolean}
     */
    const taskOption = useMemo(() => {
        // We only prevent the task option from showing if it's a DM and the other user is an Expensify default email
        if (!Permissions.canUseTasks(betas) || ReportUtils.isExpensifyOnlyParticipantInReport(report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: translate('newTaskPage.assignTask'),
                onSelected: () => Task.clearOutTaskInfoAndNavigate(reportID),
            },
        ];
    }, [betas, report, reportID, translate]);

    return (
        <AttachmentPicker>
            {({openPicker}) => {
                const triggerAttachmentPicker = () => {
                    // Set a flag to block suggestion calculation until we're finished using the file picker,
                    // which will stop any flickering as the file picker opens on non-native devices.
                    if (willBlurTextInputOnTapOutsideFunc) {
                        suggestionsRef.current.setShouldBlockSuggestionCalc(true);
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
                                        disabled={disabled}
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
                                        disabled={disabled}
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
                                    disabled={disabled}
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

export default withOnyx({
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(AttachmentPickerWithMenu);
