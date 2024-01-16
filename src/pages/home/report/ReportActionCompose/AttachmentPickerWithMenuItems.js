import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import withNavigationFocus from '@components/withNavigationFocus';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** The report currently being looked at */
    report: PropTypes.shape({
        /** ID of the report */
        reportID: PropTypes.string,

        /** Whether or not the report is in the process of being created */
        loading: PropTypes.bool,
    }).isRequired,

    /** The policy tied to the report */
    policy: PropTypes.shape({
        /** Type of the policy */
        type: PropTypes.string,
    }),

    /** The personal details of everyone in the report */
    reportParticipantIDs: PropTypes.arrayOf(PropTypes.number),

    /** Callback to open the file in the modal */
    displayFileInModal: PropTypes.func.isRequired,

    /** Whether or not the full size composer is available */
    isFullComposerAvailable: PropTypes.bool.isRequired,

    /** Whether or not the composer is full size */
    isComposerFullSize: PropTypes.bool.isRequired,

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

    /** Called when the menu with the items is closed after it was open */
    onMenuClosed: PropTypes.func.isRequired,

    /** A ref for the add action button */
    actionButtonRef: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        current: PropTypes.object,
    }).isRequired,

    /** Whether or not the screen is focused */
    isFocused: PropTypes.bool.isRequired,

    /** A function that toggles isScrollLikelyLayoutTriggered flag for a certain period of time */
    raiseIsScrollLikelyLayoutTriggered: PropTypes.func.isRequired,
};

const defaultProps = {
    reportParticipantIDs: [],
    policy: {},
};

/**
 * This includes the popover of options you see when pressing the + button in the composer.
 * It also contains the attachment picker, as the menu items need to be able to open it.
 *
 * @returns {React.Component}
 */
function AttachmentPickerWithMenuItems({
    report,
    policy,
    reportParticipantIDs,
    displayFileInModal,
    isFullComposerAvailable,
    isComposerFullSize,
    reportID,
    isBlockedFromConcierge,
    disabled,
    setMenuVisibility,
    isMenuVisible,
    onTriggerAttachmentPicker,
    onMenuClosed,
    actionButtonRef,
    isFocused,
    raiseIsScrollLikelyLayoutTriggered,
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const [restoreFocusType, setRestoreFocusType] = useState(undefined);

    /**
     * Returns the list of IOU Options
     * @returns {Array<object>}
     */
    const moneyRequestOptions = useMemo(() => {
        const options = {
            [CONST.IOU.TYPE.SPLIT]: {
                icon: Expensicons.Receipt,
                text: translate('iou.splitBill'),
                onSelected: () => Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.TYPE.SPLIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, report.reportID)),
            },
            [CONST.IOU.TYPE.REQUEST]: {
                icon: Expensicons.MoneyCircle,
                text: translate('iou.requestMoney'),
                onSelected: () => Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.TYPE.REQUEST, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, report.reportID)),
            },
            [CONST.IOU.TYPE.SEND]: {
                icon: Expensicons.Send,
                text: translate('iou.sendMoney'),
                onSelected: () => IOU.startMoneyRequest(CONST.IOU.TYPE.SEND, report.reportID),
            },
        };

        return _.map(ReportUtils.getMoneyRequestOptions(report, policy, reportParticipantIDs), (option) => ({
            ...options[option],
        }));
    }, [report, policy, reportParticipantIDs, translate]);

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

    const prevIsFocused = usePrevious(isFocused);

    /**
     * Check if current screen is inactive and previous screen is active.
     * Used to close already opened popover menu when any other page is opened over current page.
     *
     * @return {Boolean}
     */
    const didScreenBecomeInactive = useCallback(() => !isFocused && prevIsFocused, [isFocused, prevIsFocused]);

    // When the navigation is focused, we want to close the popover menu.
    useEffect(() => {
        if (!didScreenBecomeInactive() || !isMenuVisible) {
            return;
        }
        setMenuVisibility(false);
    }, [didScreenBecomeInactive, isMenuVisible, setMenuVisibility]);

    return (
        <AttachmentPicker>
            {({openPicker}) => {
                const triggerAttachmentPicker = () => {
                    onTriggerAttachmentPicker();
                    openPicker({
                        onPicked: displayFileInModal,
                        onCanceled: () => ComposerFocusManager.tryRestoreFocusByExternal(CONST.MODAL.BUSINESS_TYPE.ATTACHMENT),
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
                                            raiseIsScrollLikelyLayoutTriggered();
                                            Report.setIsComposerFullSize(reportID, false);
                                        }}
                                        // Keep focus on the composer when Collapse button is clicked.
                                        onMouseDown={(e) => e.preventDefault()}
                                        style={styles.composerSizeButton}
                                        disabled={isBlockedFromConcierge || disabled}
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('reportActionCompose.collapse')}
                                    >
                                        <Icon
                                            fill={theme.icon}
                                            src={Expensicons.Collapse}
                                        />
                                    </PressableWithFeedback>
                                </Tooltip>
                            )}
                            {!isComposerFullSize && isFullComposerAvailable && (
                                <Tooltip text={translate('reportActionCompose.expand')}>
                                    <PressableWithFeedback
                                        onPress={(e) => {
                                            e.preventDefault();
                                            raiseIsScrollLikelyLayoutTriggered();
                                            Report.setIsComposerFullSize(reportID, true);
                                        }}
                                        // Keep focus on the composer when Expand button is clicked.
                                        onMouseDown={(e) => e.preventDefault()}
                                        style={styles.composerSizeButton}
                                        disabled={isBlockedFromConcierge || disabled}
                                        role={CONST.ROLE.BUTTON}
                                        accessibilityLabel={translate('reportActionCompose.expand')}
                                    >
                                        <Icon
                                            fill={theme.icon}
                                            src={Expensicons.Expand}
                                        />
                                    </PressableWithFeedback>
                                </Tooltip>
                            )}
                            <Tooltip text={translate('reportActionCompose.addAction')}>
                                <PressableWithFeedback
                                    ref={actionButtonRef}
                                    onPress={(e) => {
                                        e.preventDefault();
                                        if (!isFocused) {
                                            return;
                                        }

                                        // Drop focus to avoid blue focus ring.
                                        actionButtonRef.current.blur();
                                        setMenuVisibility(!isMenuVisible);
                                    }}
                                    style={styles.composerSizeButton}
                                    disabled={isBlockedFromConcierge || disabled}
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={translate('reportActionCompose.addAction')}
                                >
                                    <Icon
                                        fill={theme.icon}
                                        src={Expensicons.Plus}
                                    />
                                </PressableWithFeedback>
                            </Tooltip>
                        </View>
                        <PopoverMenu
                            shouldClearFocusWithType
                            restoreFocusType={restoreFocusType}
                            animationInTiming={CONST.ANIMATION_IN_TIMING}
                            isVisible={isMenuVisible && isFocused}
                            onModalShow={() => setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.DEFAULT)}
                            onClose={onPopoverMenuClose}
                            onItemSelected={(item, index) => {
                                setMenuVisibility(false);
                                if (index !== menuItems.length - 1) {
                                    return;
                                }
                                setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE);

                                // In order for the file picker to open dynamically, the click
                                // function must be called from within a event handler that was initiated
                                // by the user on Safari.
                                if (Browser.isSafari()) {
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

export default compose(
    withNavigationFocus,
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${lodashGet(report, 'policyID')}`,
        },
    }),
)(AttachmentPickerWithMenuItems);
