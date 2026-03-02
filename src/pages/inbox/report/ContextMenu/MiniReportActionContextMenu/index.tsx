import React, {useEffect, useMemo, useRef} from 'react';
import type {RefObject} from 'react';
import {createPortal} from 'react-dom';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import BaseMiniContextMenuItem from '@components/BaseMiniContextMenuItem';
import Icon from '@components/Icon';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import getButtonState from '@libs/getButtonState';
import type {ActionDescriptor} from '@pages/inbox/report/ContextMenu/actions/ActionDescriptor';
import {useEmojiReactionData, useOverflowMenuAction} from '@pages/inbox/report/ContextMenu/actions/ContextMenuAction';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {ContextMenuPayloadContext} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useMiniContextMenuActions, useMiniContextMenuState} from '@pages/inbox/report/ContextMenu/MiniContextMenuProvider';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useContextMenuActions from '@pages/inbox/report/ContextMenu/useContextMenuActions';
import useContextMenuData from '@pages/inbox/report/ContextMenu/useContextMenuData';
import CONST from '@src/CONST';

const SLIDE_DURATION = 200;
const OVERSHOOT_EASING = Easing.bezier(0.34, 1.56, 0.64, 1);

function MiniContextMenuContent({visibleActionIDs}: {visibleActionIDs: Set<string>}) {
    const actions = useContextMenuActions(visibleActionIDs);
    const emojiData = useEmojiReactionData();
    const overflowMenu = useOverflowMenuAction();
    const StyleUtils = useStyleUtils();

    const hasEmoji = visibleActionIDs.has('emojiReaction') && !!emojiData.reportAction && !!emojiData.reportActionID;
    const needsOverflow = actions.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS;
    const visibleActions = needsOverflow ? actions.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1) : actions;

    return (
        <>
            {hasEmoji && !!emojiData.reportAction && !!emojiData.reportActionID && (
                <MiniQuickEmojiReactions
                    onEmojiSelected={(emoji, existingReactions, preferredSkinTone) =>
                        emojiData.interceptAnonymousUser(() => emojiData.toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))
                    }
                    onPressOpenPicker={emojiData.onPressOpenPicker}
                    onEmojiPickerClosed={emojiData.onEmojiPickerClosed}
                    reportActionID={emojiData.reportActionID}
                    reportAction={emojiData.reportAction}
                />
            )}
            {visibleActions.map((action: ActionDescriptor) => (
                <BaseMiniContextMenuItem
                    key={action.id}
                    isDelayButtonStateComplete
                    tooltipText={action.text}
                    onPress={action.onPress}
                    sentryLabel={action.sentryLabel ?? ''}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            small
                            src={action.icon}
                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                        />
                    )}
                </BaseMiniContextMenuItem>
            ))}
            {!!(needsOverflow && overflowMenu) &&
                (() => {
                    const {buttonRef, text, onPress, sentryLabel, icon} = overflowMenu;
                    return (
                        <BaseMiniContextMenuItem
                            ref={buttonRef}
                            isDelayButtonStateComplete
                            tooltipText={text}
                            onPress={onPress}
                            shouldPreventDefaultFocusOnPress={false}
                            sentryLabel={sentryLabel ?? ''}
                        >
                            {({hovered, pressed}) => (
                                <Icon
                                    small
                                    src={icon}
                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                />
                            )}
                        </BaseMiniContextMenuItem>
                    );
                })()}
        </>
    );
}

function MiniReportActionContextMenu() {
    const state = useMiniContextMenuState();
    const miniActions = useMiniContextMenuActions();
    const {hideMiniContextMenu, cancelHide} = miniActions;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();

    const isVisible = state?.isVisible ?? false;
    const wasVisibleRef = useRef(false);

    const baseTop = useSharedValue(0);
    const baseRight = useSharedValue(0);

    useEffect(() => {
        if (!state) {
            return;
        }

        if (state.isVisible) {
            const targetY = state.rowMeasurements.top + (state.displayAsGroup ? -8 : -4);
            const targetRight = window.innerWidth - state.rowMeasurements.right + 4;

            if (wasVisibleRef.current) {
                baseTop.set(withTiming(targetY, {duration: SLIDE_DURATION, easing: OVERSHOOT_EASING}));
                baseRight.set(withTiming(targetRight, {duration: SLIDE_DURATION}));
            } else {
                baseTop.set(targetY);
                baseRight.set(targetRight);
            }
        }
        wasVisibleRef.current = state.isVisible;
    }, [state, baseTop, baseRight]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const handleScroll = () => {
            hideMiniContextMenu({immediate: true});
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isVisible, hideMiniContextMenu]);

    const positionStyle = useAnimatedStyle(() => ({
        top: baseTop.get(),
        right: baseRight.get(),
    }));

    const data = useContextMenuData({
        reportID: state?.reportID,
        reportActionID: state?.reportActionID,
        originalReportID: state?.originalReportID,
        draftMessage: state?.draftMessage ?? '',
        selection: '',
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        anchor: state?.anchor,
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    const hideAndRun = (callback?: () => void) => {
        miniActions.release();
        callback?.();
    };

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<ContextMenuAnchor | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: '',
            contextMenuAnchor: anchorRef?.current ?? null,
            report: {
                reportID: state?.reportID,
                originalReportID: state?.originalReportID,
            },
            reportAction: {
                reportActionID: data.reportAction?.reportActionID,
                draftMessage: state?.draftMessage,
            },
            callbacks: {
                onShow: state?.checkIfContextMenuActive,
                onHide: () => {
                    state?.checkIfContextMenuActive?.();
                    miniActions.release();
                },
            },
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const payloadValue: ContextMenuPayloadContextValue = {
        ...data,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        reportAction: (data.reportAction ?? null) as NonNullable<typeof data.reportAction>,
        currentUserAccountID: data.currentUserPersonalDetails?.accountID,
        close: () => miniActions.release(),
        hideAndRun,
        transitionActionSheetState,
        openContextMenu: () => miniActions.keepOpen(),
        openOverflowMenu,
        setIsEmojiPickerActive: state?.setIsEmojiPickerActive,
    };

    if (!state) {
        return null;
    }

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(true, shouldUseNarrowLayout);

    return createPortal(
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <div
            onMouseEnter={cancelHide}
            onMouseLeave={() => hideMiniContextMenu()}
            data-selection-scraper-hidden-element={isVisible}
            style={{
                position: 'fixed',
                zIndex: 8,
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                cursor: 'default',
                userSelect: 'none',
                transitionProperty: 'opacity',
                transitionDuration: '150ms',
                transitionTimingFunction: 'ease-in-out',
            }}
        >
            <Animated.View style={[{position: 'absolute'}, positionStyle]}>
                <ContextMenuPayloadContext.Provider value={payloadValue}>
                    <View style={wrapperStyle}>
                        <MiniContextMenuContent visibleActionIDs={visibleActionIDs} />
                    </View>
                </ContextMenuPayloadContext.Provider>
            </Animated.View>
        </div>,
        document.body,
    );
}

export default MiniReportActionContextMenu;
