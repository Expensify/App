import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as IOU from '@userActions/IOU';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';

const propTypes = {
    /** The report currently being looked at */
    report: PropTypes.shape({
        /** ID of the report */
        reportID: PropTypes.string,

        /** Whether or not the report is in the process of being created */
        loading: PropTypes.bool,
    }).isRequired,

    /** The personal details of everyone in the report */
    reportParticipantIDs: PropTypes.arrayOf(PropTypes.number),

    /** Callback to open the file in the modal */
    displayFileInModal: PropTypes.func.isRequired,

    /** Whether or not the full size composer is available */
    isFullComposerAvailable: PropTypes.bool.isRequired,

    /** Whether or not the composer is full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Updates the isComposerFullSize value */
    updateShouldShowSuggestionMenuToFalse: PropTypes.func.isRequired,

    /** Whether or not the user is blocked from concierge */
    isBlockedFromConcierge: PropTypes.bool.isRequired,

    /** Whether or not the attachment picker is disabled */
    disabled: PropTypes.bool.isRequired,

    /** Sets the menu visibility */
    setMenuVisibility: PropTypes.func.isRequired,

    /** Whether or not the menu is visible */
    isMenuVisible: PropTypes.bool.isRequired,

    /** Report ID */
    reportID: PropTypes.string.isRequired,

    /** Called when opening the attachment picker */
    onTriggerAttachmentPicker: PropTypes.func.isRequired,

    /** Called when cancelling the attachment picker */
    onCanceledAttachmentPicker: PropTypes.func.isRequired,

    /** Called when the menu with the items is closed after it was open */
    onMenuClosed: PropTypes.func.isRequired,

    /** Called when the add action button is pressed */
    onAddActionPressed: PropTypes.func.isRequired,

    /** Called when the menu item is selected */
    onItemSelected: PropTypes.func.isRequired,

    /** A ref for the add action button */
    actionButtonRef: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        current: PropTypes.object,
    }).isRequired,
};

const defaultProps = {
    reportParticipantIDs: [],
};

/**
 * This includes the popover of options you see when pressing the + button in the composer.
 * It also contains the attachment picker, as the menu items need to be able to open it.
 *
 * @returns {React.Component}
 */
function AttachmentPickerWithMenuItems({
    report,
    reportParticipantIDs,
    displayFileInModal,
    isFullComposerAvailable,
    isComposerFullSize,
    updateShouldShowSuggestionMenuToFalse,
    reportID,
    isBlockedFromConcierge,
    disabled,
    setMenuVisibility,
    isMenuVisible,
    onTriggerAttachmentPicker,
    onCanceledAttachmentPicker,
    onMenuClosed,
    onAddActionPressed,
    onItemSelected,
    actionButtonRef,
}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();

    /**
     * Returns the list of IOU Options
     * @returns {Array<object>}
     */
    const moneyRequestOptions = useMemo(() => {
        const options = {
            [CONST.IOU.TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: translate('iou.splitBill'),
            },
            [CONST.IOU.TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: translate('iou.requestMoney'),
            },
            [CONST.IOU.TYPE.SEND]: {
                icon: Expensicons.Send,
                text: translate('iou.sendMoney'),
            },
        };

        return _.map(ReportUtils.getMoneyRequestOptions(report, reportParticipantIDs), (option) => ({
            ...options[option],
            onSelected: () => IOU.startMoneyRequest(option, report.reportID),
        }));
    }, [report, reportParticipantIDs, translate]);

    /**
     * Determines if we can show the task option
     * @returns {Boolean}
     */
    const taskOption = useMemo(() => {
        if (!ReportUtils.canCreateTaskInReport(report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: translate('newTaskPage.assignTask'),
                onSelected: () => Task.clearOutTaskInfoAndNavigate(reportID),
            },
        ];
    }, [report, reportID, translate]);

    const onPopoverMenuClose = () => {
        setMenuVisibility(false);
        onMenuClosed();
    };

    return (
        <AttachmentPicker>
            {({openPicker}) => {
                const triggerAttachmentPicker = () => {
                    onTriggerAttachmentPicker();
                    openPicker({
                        onPicked: displayFileInModal,
                        onCanceled: onCanceledAttachmentPicker,
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
                        <View style={[styles.dFlex, styles.flexColumn, isFullComposerAvailable || isComposerFullSize ? styles.justifyContentBetween : styles.justifyContentCenter]}>
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
                                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                        accessibilityLabel={translate('reportActionCompose.collapse')}
                                    >
                                        <Icon src={Expensicons.Collapse} />
                                    </PressableWithFeedback>
                                </Tooltip>
                            )}
                            {!isComposerFullSize && isFullComposerAvailable && (
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
                                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                                        onAddActionPressed();

                                        // Drop focus to avoid blue focus ring.
                                        actionButtonRef.current.blur();
                                        setMenuVisibility(!isMenuVisible);
                                    }}
                                    style={styles.composerSizeButton}
                                    disabled={isBlockedFromConcierge || disabled}
                                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                    accessibilityLabel={translate('reportActionCompose.addAction')}
                                >
                                    <Icon src={Expensicons.Plus} />
                                </PressableWithFeedback>
                            </Tooltip>
                        </View>
                        <PopoverMenu
                            animationInTiming={CONST.ANIMATION_IN_TIMING}
                            isVisible={isMenuVisible}
                            onClose={onPopoverMenuClose}
                            onItemSelected={(item, index) => {
                                setMenuVisibility(false);
                                onItemSelected();

                                // In order for the file picker to open dynamically, the click
                                // function must be called from within a event handler that was initiated
                                // by the user on Safari.
                                if (index === menuItems.length - 1 && Browser.isSafari()) {
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

AttachmentPickerWithMenuItems.propTypes = propTypes;
AttachmentPickerWithMenuItems.defaultProps = defaultProps;
AttachmentPickerWithMenuItems.displayName = 'AttachmentPickerWithMenuItems';

export default AttachmentPickerWithMenuItems;
