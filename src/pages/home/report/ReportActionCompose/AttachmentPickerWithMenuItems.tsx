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
import * as Report from '@userActions/Report';
import * as Task from '@userActions/Task';
import DelegateNoAccessModal from '@src/components/DelegateNoAccessModal';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import useDelegateUserDetails from '@src/hooks/useDelegateUserDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyRequestOptions = Record<Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>, PopoverMenuItem>;

type AttachmentPickerWithMenuItemsProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Callback to open the file in the modal */
    displayFileInModal: (url: FileObject) => void;

    /** Whether or not the full size composer is available */
    isFullComposerAvailable: boolean;

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
    onCanceledAttachmentPicker: () => void;

    /** Called when the menu with the items is closed after it was open */
    onMenuClosed: () => void;

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
};

/**
 * This includes the popover of options you see when pressing the + button in the composer.
 * It also contains the attachment picker, as the menu items need to be able to open it.
 */
function AttachmentPickerWithMenuItems({
    report,
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
    onCanceledAttachmentPicker,
    onMenuClosed,
    onAddActionPressed,
    onItemSelected,
    actionButtonRef,
    raiseIsScrollLikelyLayoutTriggered,
}: AttachmentPickerWithMenuItemsProps) {
    const isFocused = useIsFocused();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isDelegateAccessRestricted, delegatorEmail} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);

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
                icon: getIconForAction(CONST.IOU.TYPE.REQUEST),
                text: translate('iou.submitExpense'),
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
                icon: getIconForAction(CONST.IOU.TYPE.TRACK),
                text: translate('iou.trackExpense'),
                onSelected: () => selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.TRACK, report?.reportID ?? '-1'), true),
            },
            [CONST.IOU.TYPE.INVOICE]: {
                icon: Expensicons.InvoiceGeneric,
                text: translate('workspace.invoices.sendInvoice'),
                onSelected: () => selectOption(() => IOU.startMoneyRequest(CONST.IOU.TYPE.INVOICE, report?.reportID ?? '-1'), false),
            },
        };

        return ReportUtils.temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs ?? []).map((option) => ({
            ...options[option],
        }));
    }, [translate, report, policy, reportParticipantIDs, isDelegateAccessRestricted]);

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

    const getMenuItems = useCallback(
        (triggerAttachmentPicker: () => void) => {
            return [
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
                    shouldCallAfterModalHide: true,
                },
            ];
        },
        [moneyRequestOptions, taskOption, translate],
    );

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
                const menuItems = getMenuItems(triggerAttachmentPicker);
                return (
                    <>
                        <View style={[styles.dFlex, styles.flexColumn, isFullComposerAvailable || isComposerFullSize ? styles.justifyContentBetween : styles.justifyContentCenter]}>
                            {isComposerFullSize && (
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
                            )}
                            {!isComposerFullSize && isFullComposerAvailable && (
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
                                if (index === menuItems.length - 1 && Browser.isSafari()) {
                                    triggerAttachmentPicker();
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
                            delegatorEmail={delegatorEmail ?? ''}
                        />
                    </>
                );
            }}
        </AttachmentPicker>
    );
}

AttachmentPickerWithMenuItems.displayName = 'AttachmentPickerWithMenuItems';

export default AttachmentPickerWithMenuItems;
