import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AttachmentPicker from '@components/AttachmentPicker';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import {useFullScreenLoader} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isSafari} from '@libs/Browser';
import getIconForAction from '@libs/getIconForAction';
import Navigation from '@libs/Navigation/Navigation';
import {canCreateTaskInReport, getPayeeName, isPaidGroupPolicy, isPolicyExpenseChat, isReportOwner, temporary_getMoneyRequestOptions} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import {startMoneyRequest} from '@userActions/IOU';
import {close} from '@userActions/Modal';
import {createNewReport, setIsComposerFullSize} from '@userActions/Report';
import {clearOutTaskInfoAndNavigate} from '@userActions/Task';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyRequestOptions = Record<
    Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.SPLIT_EXPENSE>,
    PopoverMenuItem[]
>;

type AttachmentPickerWithMenuItemsProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The personal details of the current user */
    currentUserPersonalDetails: OnyxTypes.PersonalDetails;

    /** Callback to open the file in the modal */
    displayFilesInModal: (files: FileObject[]) => void;

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
    onCanceledAttachmentPicker?: () => void;

    /** Called when the menu with the items is closed after it was open */
    onMenuClosed?: () => void;

    /** Called when the add action button is pressed */
    onAddActionPressed: () => void;

    /** Called when the menu item is selected */
    onItemSelected: () => void;

    /** A ref for the add action button */
    actionButtonRef: React.RefObject<HTMLDivElement | View | null>;

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
    currentUserPersonalDetails,
    reportParticipantIDs,
    displayFilesInModal,
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
    shouldDisableAttachmentItem,
}: AttachmentPickerWithMenuItemsProps) {
    const isFocused = useIsFocused();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const {isProduction} = useEnvironment();
    const {isBetaEnabled} = usePermissions();
    const {setIsLoaderVisible} = useFullScreenLoader();
    const isReportArchived = useReportIsArchived(report?.reportID);

    const isManualDistanceTrackingEnabled = isBetaEnabled(CONST.BETAS.MANUAL_DISTANCE);

    const selectOption = useCallback(
        (onSelected: () => void, shouldRestrictAction: boolean) => {
            if (shouldRestrictAction && policy && shouldRestrictUserBillableActions(policy.id)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                return;
            }

            onSelected();
        },
        [policy],
    );

    const teacherUnitePolicyID = isProduction ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
    const isTeachersUniteReport = report?.policyID === teacherUnitePolicyID;

    /**
     * Returns the list of IOU Options
     */
    const moneyRequestOptions = useMemo(() => {
        const options: MoneyRequestOptions = {
            [CONST.IOU.TYPE.SPLIT]: [
                {
                    icon: Expensicons.Transfer,
                    text: translate('iou.splitExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SPLIT, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)), true),
                },
            ],
            [CONST.IOU.TYPE.SUBMIT]: [
                {
                    icon: getIconForAction(CONST.IOU.TYPE.CREATE),
                    text: translate('iou.createExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SUBMIT, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)), true),
                },
                ...(isManualDistanceTrackingEnabled
                    ? [
                          {
                              icon: Expensicons.Location,
                              text: translate('quickAction.recordDistance'),
                              shouldCallAfterModalHide: shouldUseNarrowLayout,
                              onSelected: () => selectOption(() => null, true),
                          },
                      ]
                    : []),
            ],
            [CONST.IOU.TYPE.PAY]: [
                {
                    icon: getIconForAction(CONST.IOU.TYPE.SEND),
                    text: translate('iou.paySomeone', {name: getPayeeName(report)}),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: () => {
                        if (isDelegateAccessRestricted) {
                            close(() => {
                                showDelegateNoAccessModal();
                            });
                            return;
                        }
                        selectOption(() => startMoneyRequest(CONST.IOU.TYPE.PAY, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)), false);
                    },
                },
            ],
            [CONST.IOU.TYPE.TRACK]: [
                {
                    icon: getIconForAction(CONST.IOU.TYPE.CREATE),
                    text: translate('iou.createExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.TRACK, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)), true),
                },
                ...(isManualDistanceTrackingEnabled
                    ? [
                          {
                              icon: Expensicons.Location,
                              text: translate('iou.trackDistance'),
                              shouldCallAfterModalHide: shouldUseNarrowLayout,
                              onSelected: () => selectOption(() => null, true),
                          },
                      ]
                    : []),
            ],
            [CONST.IOU.TYPE.INVOICE]: [
                {
                    icon: Expensicons.InvoiceGeneric,
                    text: translate('workspace.invoices.sendInvoice'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.INVOICE, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)), false),
                },
            ],
        };

        const moneyRequestOptionsList = temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs ?? []).map((option) => options[option], isReportArchived);

        return moneyRequestOptionsList.flat().filter((item, index, self) => index === self.findIndex((t) => t.text === item.text));
    }, [
        translate,
        shouldUseNarrowLayout,
        report,
        policy,
        reportParticipantIDs,
        selectOption,
        isDelegateAccessRestricted,
        showDelegateNoAccessModal,
        isManualDistanceTrackingEnabled,
        isReportArchived,
    ]);

    const createReportOption: PopoverMenuItem[] = useMemo(() => {
        if (!isPolicyExpenseChat(report) || !isPaidGroupPolicy(report) || !isReportOwner(report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Document,
                text: translate('report.newReport.createReport'),
                onSelected: () => selectOption(() => createNewReport(currentUserPersonalDetails, report?.policyID, true), true),
            },
        ];
    }, [currentUserPersonalDetails, report, selectOption, translate]);

    /**
     * Determines if we can show the task option
     */
    const taskOption: PopoverMenuItem[] = useMemo(() => {
        if (!canCreateTaskInReport(report)) {
            return [];
        }

        return [
            {
                icon: Expensicons.Task,
                text: translate('newTaskPage.assignTask'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: () => clearOutTaskInfoAndNavigate(reportID, report),
            },
        ];
    }, [report, reportID, translate, shouldUseNarrowLayout]);

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
        <AttachmentPicker
            allowMultiple
            onOpenPicker={() => setIsLoaderVisible(true)}
            fileLimit={CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT}
            shouldValidateImage={false}
        >
            {({openPicker}) => {
                const triggerAttachmentPicker = () => {
                    onTriggerAttachmentPicker();
                    openPicker({
                        onPicked: (data) => displayFilesInModal(data),
                        onCanceled: () => {
                            onCanceledAttachmentPicker?.();
                            setIsLoaderVisible(false);
                        },
                        onClosed: () => setIsLoaderVisible(false),
                    });
                };
                const menuItems = [
                    ...moneyRequestOptions,
                    ...(!isTeachersUniteReport ? createReportOption : []),
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
                                {(isFullComposerAvailable || isComposerFullSize) && (
                                    <View style={expandCollapseButtonContainerStyles}>
                                        {isComposerFullSize ? (
                                            <Tooltip
                                                text={translate('reportActionCompose.collapse')}
                                                key="composer-collapse"
                                            >
                                                <PressableWithFeedback
                                                    onPress={(e) => {
                                                        e?.preventDefault();
                                                        raiseIsScrollLikelyLayoutTriggered();
                                                        setIsComposerFullSize(reportID, false);
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
                                            <Tooltip
                                                text={translate('reportActionCompose.expand')}
                                                key="composer-expand"
                                            >
                                                <PressableWithFeedback
                                                    onPress={(e) => {
                                                        e?.preventDefault();
                                                        raiseIsScrollLikelyLayoutTriggered();
                                                        setIsComposerFullSize(reportID, true);
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
                                )}
                            </View>
                        </View>
                        <PopoverMenu
                            animationInTiming={menuItems.length * 50}
                            // The menu should close 2/3 of the time it took to open
                            animationOutTiming={menuItems.length * 50 * 0.66}
                            isVisible={isMenuVisible && isFocused}
                            onClose={onPopoverMenuClose}
                            onItemSelected={(item, index) => {
                                setMenuVisibility(false);
                                onItemSelected();

                                // In order for the file picker to open dynamically, the click
                                // function must be called from within a event handler that was initiated
                                // by the user on Safari.
                                if (index === menuItems.length - 1) {
                                    if (isSafari()) {
                                        triggerAttachmentPicker();
                                        return;
                                    }
                                    close(() => {
                                        triggerAttachmentPicker();
                                    });
                                }
                            }}
                            anchorPosition={styles.createMenuPositionReportActionCompose(shouldUseNarrowLayout, windowHeight, windowWidth)}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                            }}
                            menuItems={menuItems}
                            anchorRef={actionButtonRef}
                        />
                    </>
                );
            }}
        </AttachmentPicker>
    );
}

AttachmentPickerWithMenuItems.displayName = 'AttachmentPickerWithMenuItems';

export default AttachmentPickerWithMenuItems;
