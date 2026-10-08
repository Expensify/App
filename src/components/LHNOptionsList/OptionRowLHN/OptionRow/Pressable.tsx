import Hoverable from '@components/Hoverable';
import {useLHNTooltipContext} from '@components/LHNOptionsList/LHNTooltipContext';
import useLHNRowProductTrainingTooltip from '@components/LHNOptionsList/OptionRowLHN/useLHNRowProductTrainingTooltip';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import SwipeableRow from '@components/SwipeableRow';
import getSwipeableRowAccessibilityProps from '@components/SwipeableRow/getSwipeableRowAccessibilityProps';
import SwipeableListContext from '@components/SwipeableRow/SwipeableListContext';
import type {SwipeableRowAction, SwipeableRowActions} from '@components/SwipeableRow/types';
import getActionBadgeText from '@components/utils/getActionBadgeText';
import getContextMenuAccessibilityHint from '@components/utils/getContextMenuAccessibilityHint';
import getContextMenuAccessibilityProps from '@components/utils/getContextMenuAccessibilityProps';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {markCommentAsUnread, readNewestAction, togglePinnedState} from '@libs/actions/Report';
import DomUtils from '@libs/DomUtils';
import {getIsOffline} from '@libs/NetworkState';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {OptionData} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ComponentRef, ReactNode} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, View} from 'react-native';

import React, {useContext, useRef, useState} from 'react';

const NO_SWIPE_ACCESSIBILITY_PROPS: ReturnType<typeof getSwipeableRowAccessibilityProps> = {};

type PressableProps = {
    /** Option data for the row. Source of accessibility text and the report ID used by press/context-menu actions. */
    optionItem: OptionData;

    /** Whether the row is the currently focused/active option. Drives the focused background and accessibility metadata. */
    isOptionFocused: boolean;

    onSelectRow: (optionItem: OptionData, popoverAnchor: React.RefObject<ComponentRef<typeof View> | null>) => void;

    /** Layout handler forwarded to the underlying pressable. */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Fires when the mouse enters the row. Hover state lives in the parent so leaves like Avatar can react. */
    onHoverIn?: () => void;

    /** Fires when the mouse leaves the row. */
    onHoverOut?: () => void;

    /** Row content. */
    children: ReactNode;

    /** Whether to show the "Mark as Done" state for this row. */
    shouldShowMarkAsDoneCopy?: boolean;
};

function Pressable({optionItem, isOptionFocused, onSelectRow, onLayout, onHoverIn, onHoverOut, children, shouldShowMarkAsDoneCopy}: PressableProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isScreenFocused} = useLHNTooltipContext();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {hideProductTrainingTooltip} = useLHNRowProductTrainingTooltip();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const popoverAnchor = useRef<ComponentRef<typeof View>>(null);
    const [isContextMenuActive, setIsContextMenuActive] = useState(false);

    const reportID = optionItem.reportID;
    const brickRoadIndicator = optionItem.brickRoadIndicator;
    const actionBadgeText = getActionBadgeText(optionItem.actionBadge, translate, shouldShowMarkAsDoneCopy);

    let accessibilityLabelForBadge = '';
    if (brickRoadIndicator) {
        accessibilityLabelForBadge = [translate('common.yourReviewIsRequired'), actionBadgeText].filter(Boolean).join(', ');
    } else if (optionItem.isPinned) {
        accessibilityLabelForBadge = translate('common.pinned');
    }

    const accessibilityLabel = [
        `${translate('accessibilityHints.navigatesToChat')} ${optionItem.text}`,
        optionItem.isUnread ? translate('common.unread') : '',
        optionItem.alternateText ?? '',
        accessibilityLabelForBadge,
    ]
        .filter(Boolean)
        .join('. ');
    const contextMenuHint = getContextMenuAccessibilityHint({translate});
    const {accessibilityLabel: accessibilityLabelWithContextMenuHint, accessibilityHint} = getContextMenuAccessibilityProps({
        accessibilityLabel,
        nativeAccessibilityHint: accessibilityLabel,
        contextMenuHint,
    });

    // reportID may be a number contrary to the type definition
    const testID = typeof reportID === 'number' ? String(reportID) : reportID;

    const onPress = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        hideProductTrainingTooltip();
        startSpan(`${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`, {
            name: 'OptionRowLHN',
            op: CONST.TELEMETRY.SPAN_OPEN_REPORT,
        });

        event?.preventDefault();
        // Enable Composer to focus on clicking the same chat after opening the context menu.
        ReportActionComposeFocusManager.focus();
        onSelectRow(optionItem, popoverAnchor);
    };

    const showPopover = (event: MouseEvent | GestureResponderEvent) => {
        if (!isScreenFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsContextMenuActive(true);
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT,
            event,
            selection: '',
            contextMenuAnchor: popoverAnchor.current,
            report: {
                reportID,
                originalReportID: reportID,
            },
            reportAction: {
                reportActionID: '-1',
            },
            callbacks: {
                onHide: () => setIsContextMenuActive(false),
            },
            withoutOverlay: false,
        });
    };

    // Swipe right toggles read state, swipe left pins; the same actions the long-press menu offers for a chat.
    // Built on demand: only a touched or swiped row, or a screen reader, needs them
    const getReadStateAction = (): SwipeableRowAction =>
        optionItem.isUnread
            ? {
                  key: 'markAsRead',
                  icon: 'Mail',
                  tint: 'blue',
                  label: translate('common.read'),
                  accessibilityLabel: translate('reportActionContextMenu.markAsRead'),
                  sentryLabel: CONST.SENTRY_LABEL.LHN.SWIPE_MARK_AS_READ,
                  onPress: () => readNewestAction(reportID, true, true),
              }
            : {
                  key: 'markAsUnread',
                  icon: 'ChatBubbleUnread',
                  tint: 'blue',
                  label: translate('common.unread'),
                  accessibilityLabel: translate('reportActionContextMenu.markAsUnread'),
                  sentryLabel: CONST.SENTRY_LABEL.LHN.SWIPE_MARK_AS_UNREAD,
                  // Read at press time instead of subscribing every row to the network state
                  onPress: () => markCommentAsUnread(reportID, undefined, undefined, currentUserAccountID, getIsOffline()),
              };
    const getPinAction = (): SwipeableRowAction => {
        const pinLabel = translate(optionItem.isPinned ? 'common.unPin' : 'common.pin');
        return {
            key: 'pin',
            icon: 'Pin',
            tint: 'tangerine',
            label: pinLabel,
            accessibilityLabel: pinLabel,
            sentryLabel: optionItem.isPinned ? CONST.SENTRY_LABEL.LHN.SWIPE_UNPIN : CONST.SENTRY_LABEL.LHN.SWIPE_PIN,
            onPress: () => togglePinnedState(reportID, !!optionItem.isPinned),
        };
    };
    const getSwipeActions = (): SwipeableRowActions => ({
        leading: [getReadStateAction()],
        trailing: [
            getPinAction(),
            {
                key: 'more',
                icon: 'ThreeDots',
                tint: 'ice',
                label: translate('common.more'),
                accessibilityLabel: translate('common.more'),
                sentryLabel: CONST.SENTRY_LABEL.LHN.SWIPE_MORE,
                onPress: (event) => {
                    if (!event) {
                        return;
                    }
                    showPopover(event);
                },
            },
        ],
    });

    // Screen readers get the same actions from the row's actions menu. "More" is left out: it is the long-press menu,
    // which screen readers already reach
    const isScreenReaderEnabled = !!useContext(SwipeableListContext)?.isScreenReaderEnabled;
    const swipeAccessibilityProps = isScreenReaderEnabled ? getSwipeableRowAccessibilityProps([getReadStateAction(), getPinAction()]) : NO_SWIPE_ACCESSIBILITY_PROPS;

    return (
        <SwipeableRow
            rowKey={reportID}
            getActions={getSwipeActions}
            isDisabled={!shouldUseNarrowLayout}
        >
            <Hoverable
                onHoverIn={onHoverIn}
                onHoverOut={onHoverOut}
            >
                {(hovered) => (
                    <PressableWithSecondaryInteraction
                        ref={popoverAnchor}
                        onPress={onPress}
                        onMouseDown={(event) => {
                            // Allow composer blur on right click
                            if (!event) {
                                return;
                            }
                            // Prevent composer blur on left click
                            event.preventDefault();
                        }}
                        testID={testID}
                        onSecondaryInteraction={(event) => {
                            showPopover(event);
                            // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                            if (DomUtils.getActiveElement()) {
                                (DomUtils.getActiveElement() as HTMLElement | null)?.blur();
                            }
                        }}
                        withoutFocusOnSecondaryInteraction
                        activeOpacity={variables.pressDimValue}
                        opacityAnimationDuration={variables.instantAnimationDuration}
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                            styles.sidebarLink,
                            styles.sidebarLinkInnerLHN,
                            StyleUtils.getBackgroundColorStyle(theme.sidebar),
                            isOptionFocused ? styles.sidebarLinkActive : null,
                            (hovered || isContextMenuActive) && !isOptionFocused ? styles.sidebarLinkHover : null,
                        ]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={accessibilityLabelWithContextMenuHint}
                        accessibilityHint={accessibilityHint}
                        onLayout={onLayout}
                        needsOffscreenAlphaCompositing={(optionItem?.icons?.length ?? 0) >= 2}
                        sentryLabel={CONST.SENTRY_LABEL.LHN.OPTION_ROW}
                        accessibilityActions={swipeAccessibilityProps.accessibilityActions}
                        onAccessibilityAction={swipeAccessibilityProps.onAccessibilityAction}
                    >
                        {children}
                    </PressableWithSecondaryInteraction>
                )}
            </Hoverable>
        </SwipeableRow>
    );
}

Pressable.displayName = 'OptionRow.Pressable';

export default Pressable;
