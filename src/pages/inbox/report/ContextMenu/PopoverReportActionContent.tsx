import type {RefObject} from 'react';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {ActionID} from './actions/actionConfig';
import {ORDERED_ACTION_SHOULD_SHOW} from './actions/actionConfig';
import type {ContextMenuAction} from './actions/actionTypes';
import {CONTEXT_MENU_ICON_NAMES} from './actions/actionTypes';
import createCopyEmailAction from './actions/copyEmailAction';
import createCopyLinkAction from './actions/copyLinkAction';
import createCopyMessageAction from './actions/copyMessageAction';
import createCopyOnyxDataAction from './actions/copyOnyxDataAction';
import createCopyToClipboardAction from './actions/copyToClipboardAction';
import createCopyURLAction from './actions/copyURLAction';
import createDebugAction from './actions/debugAction';
import createDeleteAction from './actions/deleteAction';
import createDownloadAction from './actions/downloadAction';
import createEditAction from './actions/editAction';
import createEmojiReactionData from './actions/emojiReactionAction';
import createExplainAction from './actions/explainAction';
import createFlagAsOffensiveAction from './actions/flagAsOffensiveAction';
import createHoldAction from './actions/holdAction';
import createJoinThreadAction from './actions/joinThreadAction';
import createLeaveThreadAction from './actions/leaveThreadAction';
import createMarkAsReadAction from './actions/markAsReadAction';
import createMarkAsUnreadAction from './actions/markAsUnreadAction';
import createOverflowMenuAction from './actions/overflowMenuAction';
import createPinAction from './actions/pinAction';
import createReplyInThreadAction from './actions/replyInThreadAction';
import createUnholdAction from './actions/unholdAction';
import createUnpinAction from './actions/unpinAction';
import type {PopoverContentProps} from './PopoverContextMenu';
import {showContextMenu} from './ReportActionContextMenu';
import useReportActionContextMenuData from './useReportActionContextMenuData';

function PopoverReportActionContent({menuState, hideAndRun, setLocalShouldKeepOpen, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const overflowMenuRef = useRef<ViewType>(null);

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);

    const data = useReportActionContextMenuData({
        reportID: menuState.reportID,
        reportActionID: menuState.reportActionID,
        originalReportID: menuState.originalReportID,
        draftMessage: menuState.draftMessage ?? '',
        selection: menuState.selection ?? '',
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        anchor: {current: menuState.contextMenuTargetNode ?? null},
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRefParam: RefObject<ViewType | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: menuState.selection ?? '',
            contextMenuAnchor: anchorRefParam?.current as ViewType | RNText | null,
            report: {
                reportID: menuState.reportID,
                originalReportID: menuState.originalReportID,
            },
            reportAction: {
                reportActionID: data.reportAction?.reportActionID,
                draftMessage: menuState.draftMessage,
            },
            callbacks: {
                onShow: undefined,
                onHide: () => {
                    setLocalShouldKeepOpen(false);
                },
            },
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const reportAction = (data.reportAction ?? null) as NonNullable<typeof data.reportAction>;
    const currentUserAccountID = data.currentUserPersonalDetails?.accountID ?? 0;
    const {interceptAnonymousUser, translate} = data;

    /* eslint-disable react-hooks/refs -- factory functions store refs for later use, they don't read .current during render */
    const allActions: ContextMenuAction[] = [
        createReplyInThreadAction({
            childReport: data.childReport,
            reportAction,
            originalReport: data.originalReport,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            chatBubbleReplyIcon: icons.ChatBubbleReply,
        }),
        createMarkAsUnreadAction({
            reportID: data.reportID,
            reportActions: data.reportActions,
            reportAction,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            chatBubbleUnreadIcon: icons.ChatBubbleUnread,
            checkmarkIcon: icons.Checkmark,
        }),
        createExplainAction({
            childReport: data.childReport,
            originalReport: data.originalReport,
            reportAction,
            currentUserPersonalDetails: data.currentUserPersonalDetails,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            conciergeIcon: icons.Concierge,
        }),
        createMarkAsReadAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            mailIcon: icons.Mail,
            checkmarkIcon: icons.Checkmark,
        }),
        createEditAction({
            reportID: data.reportID,
            reportAction,
            moneyRequestAction: data.moneyRequestAction,
            draftMessage: data.draftMessage,
            introSelected: data.introSelected,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            pencilIcon: icons.Pencil,
        }),
        createUnholdAction({
            moneyRequestAction: data.moneyRequestAction,
            isDelegateAccessRestricted: data.isDelegateAccessRestricted,
            showDelegateNoAccessModal: data.showDelegateNoAccessModal,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            stopwatchIcon: icons.Stopwatch,
        }),
        createHoldAction({
            moneyRequestAction: data.moneyRequestAction,
            isDelegateAccessRestricted: data.isDelegateAccessRestricted,
            showDelegateNoAccessModal: data.showDelegateNoAccessModal,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            stopwatchIcon: icons.Stopwatch,
        }),
        createJoinThreadAction({
            reportAction,
            originalReport: data.originalReport,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            bellIcon: icons.Bell,
        }),
        createLeaveThreadAction({
            reportAction,
            originalReport: data.originalReport,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            exitIcon: icons.Exit,
        }),
        createCopyURLAction({
            selection: data.selection,
            interceptAnonymousUser,
            translate,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createCopyToClipboardAction({
            selection: data.selection,
            interceptAnonymousUser,
            translate,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createCopyEmailAction({
            selection: data.selection,
            interceptAnonymousUser,
            translate,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createCopyMessageAction({
            reportAction,
            transaction: data.transaction,
            selection: data.selection,
            report: data.report,
            card: data.card,
            originalReport: data.originalReport,
            isHarvestReport: data.isHarvestReport,
            isTryNewDotNVPDismissed: data.isTryNewDotNVPDismissed,
            movedFromReport: data.movedFromReport,
            movedToReport: data.movedToReport,
            childReport: data.childReport,
            policy: data.policy,
            getLocalDateFromDatetime: data.getLocalDateFromDatetime,
            policyTags: data.policyTags,
            translate,
            harvestReport: data.harvestReport,
            currentUserPersonalDetails: data.currentUserPersonalDetails,
            interceptAnonymousUser,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createCopyLinkAction({
            reportAction,
            originalReportID: data.originalReportID,
            interceptAnonymousUser,
            translate,
            linkCopyIcon: icons.LinkCopy,
            checkmarkIcon: icons.Checkmark,
        }),
        createPinAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            pinIcon: icons.Pin,
        }),
        createUnpinAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            pinIcon: icons.Pin,
        }),
        createFlagAsOffensiveAction({
            reportID: data.reportID,
            reportAction,
            hideAndRun,
            translate,
            flagIcon: icons.Flag,
        }),
        createDownloadAction({
            reportAction,
            encryptedAuthToken: data.encryptedAuthToken,
            interceptAnonymousUser,
            download: data.download,
            translate,
            downloadIcon: icons.Download,
        }),
        createCopyOnyxDataAction({
            report: data.report,
            interceptAnonymousUser,
            translate,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createDebugAction({
            reportID: data.reportID,
            reportAction,
            interceptAnonymousUser,
            translate,
            bugIcon: icons.Bug,
        }),
        createDeleteAction({
            reportID: data.reportID,
            reportAction,
            moneyRequestAction: data.moneyRequestAction,
            hideAndRun,
            translate,
            trashcanIcon: icons.Trashcan,
        }),
    ];

    const overflowMenu = createOverflowMenuAction(
        {
            openOverflowMenu,
            openContextMenu: () => setLocalShouldKeepOpen(true),
            interceptAnonymousUser,
            translate,
            threeDotsIcon: icons.ThreeDots,
        },
        overflowMenuRef,
    );
    const actionsWithOverflow = [...allActions, overflowMenu];
    const actions = actionsWithOverflow.filter((action) => visibleActionIDs.has(action.id as ActionID));

    const emojiData = createEmojiReactionData({
        reportID: data.reportID,
        reportAction: data.reportAction,
        currentUserAccountID,
        openContextMenu: () => setLocalShouldKeepOpen(true),
        setIsEmojiPickerActive: menuState.onEmojiPickerToggle,
        hideAndRun,
        interceptAnonymousUser,
    });
    /* eslint-enable react-hooks/refs */

    const contentActionIndexes = actions
        .map((action, index) => {
            const entry = ORDERED_ACTION_SHOULD_SHOW.find((e) => e.id === action.id);
            return entry?.isContentAction ? index : undefined;
        })
        .filter((index): index is number => index !== undefined);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: contentActionIndexes,
        maxIndex: actions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const hasEmoji = visibleActionIDs.has('emojiReaction');
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            <FocusTrapForModal active={!shouldUseNarrowLayout && shouldEnableArrowNavigation}>
                <View>
                    {hasEmoji && emojiData.reportActionID != null && emojiData.reportAction != null && (
                        <QuickEmojiReactions
                            closeContextMenu={emojiData.closeContextMenu}
                            onEmojiSelected={(emoji, existingReactions, preferredSkinTone) =>
                                emojiData.interceptAnonymousUser(() => emojiData.toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))
                            }
                            reportActionID={emojiData.reportActionID}
                            reportAction={emojiData.reportAction}
                            setIsEmojiPickerActive={(active) => {
                                if (!active) {
                                    return;
                                }
                                setLocalShouldKeepOpen(true);
                            }}
                        />
                    )}
                    {actions.map((action: ContextMenuAction, i: number) => (
                        <FocusableMenuItem
                            key={action.id}
                            title={action.text}
                            icon={action.icon}
                            onPress={action.onPress}
                            wrapperStyle={[styles.pr8]}
                            description={action.description ?? ''}
                            descriptionTextStyle={styles.breakWord}
                            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
                            isAnonymousAction={action.isAnonymousAction}
                            focused={focusedIndex === i}
                            interactive
                            onFocus={() => setFocusedIndex(i)}
                            onBlur={() => (i === actions.length - 1 || i === 1) && setFocusedIndex(-1)}
                            disabled={action.disabled}
                            shouldShowLoadingSpinnerIcon={action.shouldShowLoadingSpinnerIcon}
                            sentryLabel={action.sentryLabel}
                        />
                    ))}
                </View>
            </FocusTrapForModal>
        </View>
    );
}

export default PopoverReportActionContent;
