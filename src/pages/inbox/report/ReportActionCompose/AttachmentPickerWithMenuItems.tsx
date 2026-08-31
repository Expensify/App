import AttachmentPicker from '@components/AttachmentPicker';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import Icon from '@components/Icon';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePopoverPosition from '@hooks/usePopoverPosition';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldShowEmptyReportConfirmation from '@hooks/useShouldShowEmptyReportConfirmation';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import getButtonState from '@libs/getButtonState';
import getIconForAction from '@libs/getIconForAction';
import Navigation from '@libs/Navigation/Navigation';
import {getDistanceExpenseTypeForPolicy} from '@libs/PolicyDistanceRatesUtils';
import {isGroupPolicyByType} from '@libs/PolicyUtils';
import {
    canCreateTaskInReport,
    getPayeeName,
    hasViolations as hasViolationsReportUtils,
    isPolicyExpenseChat,
    isReportOwner,
    isTeachersUniteReport,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import {startDistanceRequest, startMoneyRequest} from '@userActions/IOU/MoneyRequest';
import {close} from '@userActions/Modal';
import {createNewReport, setIsComposerFullSize} from '@userActions/Report';
import {clearOutTaskInfoAndNavigate} from '@userActions/Task';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {AnchorPosition} from '@src/styles';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import ExpandCollapseButton from './ExpandCollapseButton';

type MoneyRequestOptions = Record<
    Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.SPLIT_EXPENSE>,
    PopoverMenuItem[]
>;

type AttachmentPickerWithMenuItemsProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The personal details of the current user */
    currentUserPersonalDetails: OnyxTypes.PersonalDetails;

    /** Callback when the attachment is picked */
    onAttachmentPicked: (url: FileObject | FileObject[]) => void;

    /** Whether or not the full size composer is available */
    isFullComposerAvailable: boolean;

    /** Whether or not the composer is full size */
    isComposerFullSize: boolean;

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

    testID?: string;
};

/**
 * This includes the popover of options you see when pressing the + button in the composer.
 * It also contains the attachment picker, as the menu items need to be able to open it.
 */
function AttachmentPickerWithMenuItems({
    report,
    currentUserPersonalDetails,
    reportParticipantIDs,
    onAttachmentPicked,
    isFullComposerAvailable,
    isComposerFullSize,
    reportID,
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
    testID,
}: AttachmentPickerWithMenuItemsProps) {
    const icons = useMemoizedLazyExpensifyIcons([
        'Cash',
        'Coins',
        'Collapse',
        'Document',
        'Expand',
        'InvoiceGeneric',
        'Location',
        'MoneyCircle',
        'Paperclip',
        'Plus',
        'Receipt',
        'Task',
        'Transfer',
    ]);
    const isFocused = useIsFocused();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {calculatePopoverPosition} = usePopoverPosition();
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(null);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const distanceExpenseType = getDistanceExpenseTypeForPolicy(policy, lastDistanceExpenseType);
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: policy?.id,
        isDistanceRequest: true,
    });
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const {setIsLoaderVisible} = useFullScreenLoaderActions();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {accountID} = currentUserPersonalDetails;
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, accountID, '');
    const shouldShowEmptyReportConfirmation = useShouldShowEmptyReportConfirmation(report?.policyID);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const {getCurrencyDecimals} = useCurrencyListActions();

    const selectOption = useCallback(
        (onSelected: () => void, shouldRestrictAction: boolean) => {
            if (
                shouldRestrictAction &&
                policy &&
                policy.type !== CONST.POLICY.TYPE.PERSONAL &&
                shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)
            ) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                return;
            }

            onSelected();
        },
        [policy, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, amountOwed, accountID],
    );

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: report?.policyID,
        policyName: policy?.name ?? '',
        onConfirm: (shouldDismissEmptyReportsConfirmation) =>
            selectOption(
                () =>
                    createNewReport(
                        currentUserPersonalDetails,
                        isASAPSubmitBetaEnabled,
                        hasViolations,
                        policy,
                        betas,
                        isTrackIntentUser,
                        getCurrencyDecimals,
                        true,
                        shouldDismissEmptyReportsConfirmation,
                    ),
                true,
            ),
    });

    const handleCreateReport = () => {
        if (shouldShowEmptyReportConfirmation) {
            openCreateReportConfirmation();
        } else {
            createNewReport(currentUserPersonalDetails, isASAPSubmitBetaEnabled, hasViolations, policy, betas, isTrackIntentUser, getCurrencyDecimals, true, false);
        }
    };

    const isReportTeachersUnite = isTeachersUniteReport(report);

    /**
     * Returns the list of IOU Options
     */
    const moneyRequestOptions = useMemo(() => {
        const options: MoneyRequestOptions = {
            [CONST.IOU.TYPE.SPLIT]: [
                {
                    icon: icons.Transfer,
                    text: translate('iou.splitExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_SPLIT_EXPENSE,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SPLIT, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs), true),
                },
            ],
            [CONST.IOU.TYPE.SUBMIT]: [
                {
                    icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons),
                    text: translate('iou.createExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_CREATE_EXPENSE,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SUBMIT, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs), true),
                },
                {
                    icon: icons.Location,
                    text: translate('quickAction.recordDistance'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_TRACK_DISTANCE,
                    onSelected: () =>
                        selectOption(() => {
                            if (blockDistanceRequestIfNeeded()) {
                                return;
                            }
                            startDistanceRequest(CONST.IOU.TYPE.SUBMIT, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs, distanceExpenseType);
                        }, true),
                },
            ],
            [CONST.IOU.TYPE.PAY]: [
                {
                    icon: getIconForAction(CONST.IOU.TYPE.SEND, icons),
                    text: translate('iou.paySomeone', getPayeeName(report, translate, accountID)),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_PAY_SOMEONE,
                    onSelected: () => {
                        if (isDelegateAccessRestricted) {
                            close(() => {
                                showDelegateNoAccessModal();
                            });
                            return;
                        }
                        selectOption(() => startMoneyRequest(CONST.IOU.TYPE.PAY, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs), false);
                    },
                },
            ],
            [CONST.IOU.TYPE.TRACK]: [
                {
                    icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons),
                    text: translate('iou.createExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_CREATE_EXPENSE,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.TRACK, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs), true),
                },
                {
                    icon: icons.Location,
                    text: translate('iou.trackDistance'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_TRACK_DISTANCE,
                    onSelected: () =>
                        selectOption(() => {
                            if (blockDistanceRequestIfNeeded()) {
                                return;
                            }
                            startDistanceRequest(CONST.IOU.TYPE.TRACK, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs, distanceExpenseType);
                        }, true),
                },
            ],
            [CONST.IOU.TYPE.INVOICE]: [
                {
                    icon: icons.InvoiceGeneric,
                    text: translate('workspace.invoices.sendInvoice'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_SEND_INVOICE,
                    onSelected: () => selectOption(() => startMoneyRequest(CONST.IOU.TYPE.INVOICE, report?.reportID ?? String(CONST.DEFAULT_NUMBER_ID), draftTransactionIDs), false),
                },
            ],
        };

        const moneyRequestOptionsList = temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs ?? [], betas, isReportArchived, isRestrictedToPreferredPolicy).map(
            (option) => options[option],
        );

        return moneyRequestOptionsList.flat().filter((item, index, self) => index === self.findIndex((t) => t.text === item.text));
    }, [
        accountID,
        blockDistanceRequestIfNeeded,
        isDelegateAccessRestricted,
        isReportArchived,
        isRestrictedToPreferredPolicy,
        distanceExpenseType,
        policy,
        report,
        reportParticipantIDs,
        selectOption,
        shouldUseNarrowLayout,
        showDelegateNoAccessModal,
        translate,
        icons,
        betas,
        draftTransactionIDs,
    ]);

    const createReportOption: PopoverMenuItem[] = useMemo(() => {
        if (!isPolicyExpenseChat(report) || !isGroupPolicyByType(policy?.type) || !isReportOwner(report)) {
            return [];
        }

        return [
            {
                icon: icons.Document,
                text: translate('report.newReport.createReport'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_CREATE_REPORT,
                onSelected: () => selectOption(() => handleCreateReport(), true),
            },
        ];
    }, [icons.Document, handleCreateReport, policy?.type, report, selectOption, shouldUseNarrowLayout, translate]);

    /**
     * Determines if we can show the task option
     */
    const taskOption: PopoverMenuItem[] = useMemo(() => {
        if (!canCreateTaskInReport(report)) {
            return [];
        }

        return [
            {
                icon: icons.Task,
                text: translate('newTaskPage.assignTask'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_ASSIGN_TASK,
                onSelected: () => clearOutTaskInfoAndNavigate(currentUserPersonalDetails.accountID, undefined, reportID, report),
            },
        ];
    }, [report, translate, shouldUseNarrowLayout, currentUserPersonalDetails.accountID, reportID, icons.Task]);

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

    // Calculate anchor position when menu becomes visible
    useEffect(() => {
        if (!actionButtonRef.current || !isMenuVisible) {
            return;
        }

        calculatePopoverPosition(actionButtonRef as React.RefObject<View>, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        }).then((position) => {
            setPopoverAnchorPosition({...position, vertical: position.vertical - CONST.MODAL.POPOVER_MENU_PADDING});
        });
    }, [isMenuVisible, calculatePopoverPosition, actionButtonRef]);

    // 1. Limit the container width to a single column.
    const outerContainerStyles = styles.composerButtonColumn;

    // 2. If there isn't enough height for two buttons, the Expand/Collapse button wraps to the next column so that it's intentionally hidden.
    //    The Create button stays anchored to the bottom (flex-start in a reversed column) to match the Emoji and Send buttons.
    const innerContainerStyles = styles.composerButtonStack;

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
                        onPicked: onAttachmentPicked,
                        onCanceled: () => {
                            onCanceledAttachmentPicker?.();
                            setIsLoaderVisible(false);
                        },
                        onClosed: () => setIsLoaderVisible(false),
                    });
                };
                const menuItems = [
                    ...moneyRequestOptions,
                    ...(!isReportTeachersUnite ? createReportOption : []),
                    ...taskOption,
                    {
                        icon: icons.Paperclip,
                        text: translate('reportActionCompose.addAttachment'),
                        disabled: shouldDisableAttachmentItem,
                        sentryLabel: CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_MENU_ADD_ATTACHMENT,
                    },
                ];
                return (
                    <>
                        <View
                            testID={testID}
                            style={outerContainerStyles}
                        >
                            <View style={innerContainerStyles}>
                                <View style={createButtonContainerStyles}>
                                    <Tooltip text={translate('common.create')}>
                                        <PressableWithoutFeedback
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
                                            style={({hovered, pressed}) => [
                                                styles.composerSizeButton,
                                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered && !disabled, pressed && !disabled)),
                                            ]}
                                            disabled={disabled}
                                            role={CONST.ROLE.BUTTON}
                                            accessibilityLabel={translate('accessibilityHints.openActionsMenu')}
                                            sentryLabel={CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_CREATE_BUTTON}
                                        >
                                            {({hovered, pressed}) => (
                                                <Icon
                                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered && !disabled, pressed && !disabled))}
                                                    src={icons.Plus}
                                                />
                                            )}
                                        </PressableWithoutFeedback>
                                    </Tooltip>
                                </View>
                                <ExpandCollapseButton
                                    isFullComposerAvailable={isFullComposerAvailable}
                                    isComposerFullSize={isComposerFullSize}
                                    reportID={reportID}
                                    disabled={disabled}
                                    raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLikelyLayoutTriggered}
                                    setIsComposerFullSize={setIsComposerFullSize}
                                    style={expandCollapseButtonContainerStyles}
                                />
                            </View>
                        </View>
                        <PopoverMenu
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
                            anchorPosition={popoverAnchorPosition ?? {horizontal: 0, vertical: 0}}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                            }}
                            menuItems={menuItems}
                            anchorRef={actionButtonRef}
                            enableEdgeToEdgeBottomSafeAreaPadding
                        />
                    </>
                );
            }}
        </AttachmentPicker>
    );
}

export default AttachmentPickerWithMenuItems;
