import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import AttachmentPicker from '@components/AttachmentPicker';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import getIconForAction from '@libs/getIconForAction';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as IOU from '@userActions/IOU';
import * as Modal from '@userActions/Modal';
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import DelegateNoAccessModal from '@src/components/DelegateNoAccessModal';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import useDelegateUserDetails from '@src/hooks/useDelegateUserDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyRequestOptions = Record<Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE>, PopoverMenuItem>;

type AttachmentPickerWithMenuItemsProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Callback to open the file in the modal */
    displayFileInModal: (url: FileObject) => void;

    /** Whether or not the composer is full size */
    isComposerFullSize: boolean;

    /** Whether or not the user is blocked from concierge */
    isBlockedFromConcierge: boolean;

    /** Whether or not the attachment picker is disabled */
    disabled?: boolean;

    /** Sets the menu visibility */
    setMenuVisibility: (isVisible: boolean) => void;

    /** Whether or not the menu is visible */
    isMenuVisible: boolean;

    /** Report ID */
    reportID: string;

    /** Called when opening the attachment picker */
    onTriggerAttachmentPicker: () => void;

    /** Called when cancelling the attachment picker */
    onCanceledAttachmentPicker?: () => void;

    /** Called when the menu with the items is closed after it was open */
    onMenuClosed?: () => void;

    /** Called when the add action button is pressed */
    onAddActionPressed: () => void;

    /** Called when the menu item is selected */
    onItemSelected: () => void;

    /** A ref for the add action button */
    actionButtonRef: React.RefObject<HTMLDivElement | View>;

    /** A function that toggles isScrollLikelyLayoutTriggered flag for a certain period of time */
    raiseIsScrollLikelyLayoutTriggered: () => void;

    /** The personal details of everyone in the report */
    reportParticipantIDs?: number[];

    shouldDisableAttachmentItem?: boolean;
};

/**
 * This includes the popover of options you see when pressing the + button in the composer.
 * It also contains the attachment picker, as the menu items need to be able to open it.
 */
function AttachmentPickerWithMenuItems({
    report,
    reportParticipantIDs,
    displayFileInModal,
    isComposerFullSize,
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
    raiseIsScrollLikelyLayoutTriggered,
    shouldDisableAttachmentItem,
}: AttachmentPickerWithMenuItemsProps) {
    const isFocused = useIsFocused();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const {canUseCombinedTrackSubmit} = usePermissions();

    /**
     * Returns the list of IOU Options
     */
    const moneyRequestOptions = useMemo(() => {
        const selectOption = (onSelected: () => void, shouldRestrictAction: boolean) => {
            if (shouldRestrictAction && policy && SubscriptionUtils.shouldRestrictUserBillableActions(policy.id)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                return;
            }

            onSelected();
        };

        const options: MoneyRequestOptions = {
            [CONST.IOU.TYPE.SPLIT]: {
                icon: Expensicons.Transfer,
                text: translate('iou.splitExpense'),
                onSelected: () => selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.SPLIT, report?.reportID ?? '-1'), true),
            },
            [CONST.IOU.TYPE.SUBMIT]: {
                icon: canUseCombinedTrackSubmit ? getIconForAction(CONST.IOU.TYPE.CREATE) : getIconForAction(CONST.IOU.TYPE.REQUEST),
                text: canUseCombinedTrackSubmit ? translate('iou.createExpense') : translate('iou.submitExpense'),
                onSelected: () => selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.SUBMIT, report?.reportID ?? '-1'), true),
            },
            [CONST.IOU.TYPE.PAY]: {
                icon: getIconForAction(CONST.IOU.TYPE.SEND),
                text: translate('iou.paySomeone', {name: ReportUtils.getPayeeName(report)}),
                onSelected: () => {
                    if (isDelegateAccessRestricted) {
                        setIsNoDelegateAccessMenuVisible(true);
                        return;
                    }
                    selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.PAY, report?.reportID ?? '-1'), false);
                },
            },
            [CONST.IOU.TYPE.TRACK]: {
                icon: canUseCombinedTrackSubmit ? getIconForAction(CONST.IOU.TYPE.CREATE) : getIconForAction(CONST.IOU.TYPE.TRACK),
                text: canUseCombinedTrackSubmit ? translate('iou.createExpense') : translate('iou.trackExpense'),
                onSelected: () => selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK, report?.reportID ?? '-1'), true),
            },
            [CONST.IOU.TYPE.INVOICE]: {
                icon: Expensicons.InvoiceGeneric,
                text: translate('workspace.invoices.sendInvoice'),
                onSelected: () => selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.INVOICE, report?.reportID ?? '-1'), false),
            },
        };

        const moneyRequestOptionsList = ReportUtils.temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs ?? []).map((option) => ({
            ...options[option],
        }));

        return canUseCombinedTrackSubmit
            ? // Removes track option for the workspace with the canUseCombinedTrackSubmit enabled
              moneyRequestOptionsList.filter((item, index, self) => index === self.findIndex((t) => t.text === item.text))
            : moneyRequestOptionsList;
    }, [translate, canUseCombinedTrackSubmit, report, policy, reportParticipantIDs, isDelegateAccessRestricted]);

    /**
     * Determines if we can show the task option
     */
    const taskOption: PopoverMenuItem[] = useMemo(() => {
        if (!ReportUtils.canCreateTaskInReport(report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: translate('newTaskPage.assignTask'),
                onSelected: () => Task.clearOutTaskInfoAndNavigate(reportID, report),
            },
        ];
    }, [report, reportID, translate]);

    const onPopoverMenuClose = () => {
        setMenuVisibility(false);
        onMenuClosed?.();
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

    // 1. Limit the container width to a single column.
    const outerContainerStyles = [{flexBasis: styles.composerSizeButton.width + styles.composerSizeButton.marginHorizontal * 2}, styles.flexGrow0, styles.flexShrink0];

    // 2. If there isn't enough height for two buttons, the Expand/Collapse button wraps to the next column so that it's intentionally hidden,
    //    and the Create button is centered vertically.
    const innerContainerStyles = [
        styles.dFlex,
        styles.flexColumnReverse,
        styles.flexWrap,
        styles.justifyContentCenter,
        styles.pAbsolute,
        styles.h100,
        styles.w100,
        styles.overflowHidden,
        {paddingVertical: styles.composerSizeButton.marginHorizontal},
    ];

    // 3. If there is enough height for two buttons, the Expand/Collapse button is at the top.
    const expandCollapseButtonContainerStyles = [styles.flexGrow1, styles.flexShrink0];

    // 4. And the Create button is at the bottom.
    const createButtonContainerStyles = [styles.flexGrow0, styles.flexShrink0];

    return (
        <AttachmentPicker>
            {({openPicker}) => {
                const triggerAttachmentPicker = () => {
                    onTriggerAttachmentPicker();
                    openPicker({
                        onPicked: (data) => displayFileInModal(data.at(0) ?? {}),
                        onCanceled: onCanceledAttachmentPicker,
                    });
                };
                const menuItems = [
                    ...moneyRequestOptions,
                    ...taskOption,
                    {
                        icon: Expensicons.Paperclip,
                        text: translate('reportActionCompose.addAttachment'),
                        disabled: shouldDisableAttachmentItem,
                    },
                ];
                return (
                    <>
                        <View style={outerContainerStyles}>
                            <View style={innerContainerStyles}>
                                <View style={createButtonContainerStyles}>
                                    <Tooltip text={translate('common.create')}>
                                        <PressableWithFeedback
                                            ref={actionButtonRef}
                                            onPress={(e) => {
                                                e?.preventDefault();
                                                if (!isFocused) {
                                                    return;
                                                }
                                                onAddActionPressed();

                                                // Drop focus to avoid blue focus ring.
                                                actionButtonRef.current?.blur();
                                                setMenuVisibility(!isMenuVisible);
                                            }}
                                            style={styles.composerSizeButton}
                                            disabled={isBlockedFromConcierge || disabled}
                                            role={CONST.ROLE.BUTTON}
                                            accessibilityLabel={translate('common.create')}
                                        >
                                            <Icon
                                                fill={theme.icon}
                                                src={Expensicons.Plus}
                                            />
                                        </PressableWithFeedback>
                                    </Tooltip>
                                </View>
                                <View style={expandCollapseButtonContainerStyles}>
                                    {isComposerFullSize ? (
                                        <Tooltip text={translate('reportActionCompose.collapse')}>
                                            <PressableWithFeedback
                                                onPress={(e) => {
                                                    e?.preventDefault();
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
                                    ) : (
                                        <Tooltip text={translate('reportActionCompose.expand')}>
                                            <PressableWithFeedback
                                                onPress={(e) => {
                                                    e?.preventDefault();
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
                                </View>
                            </View>
                        </View>
                        <PopoverMenu
                            animationInTiming={CONST.ANIMATION_IN_TIMING}
                            isVisible={isMenuVisible && isFocused}
                            onClose={onPopoverMenuClose}
                            onItemSelected={(item, index) => {
                                setMenuVisibility(false);
                                onItemSelected();

                                // In order for the file picker to open dynamically, the click
                                // function must be called from within a event handler that was initiated
                                // by the user on Safari.
                                if (index === menuItems.length - 1) {
                                    if (Browser.isSafari()) {
                                        triggerAttachmentPicker();
                                        return;
                                    }
                                    Modal.close(() => {
                                        triggerAttachmentPicker();
                                    });
                                }
                            }}
                            anchorPosition={styles.createMenuPositionReportActionCompose(shouldUseNarrowLayout, windowHeight, windowWidth)}
                            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
                            menuItems={menuItems}
                            withoutOverlay
                            anchorRef={actionButtonRef}
                        />
                        <DelegateNoAccessModal
                            isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                            onClose={() => setIsNoDelegateAccessMenuVisible(false)}
                        />
                    </>
                );
            }}
        </AttachmentPicker>
    );
}

AttachmentPickerWithMenuItems.displayName = 'AttachmentPickerWithMenuItems';

export default AttachmentPickerWithMenuItems;
