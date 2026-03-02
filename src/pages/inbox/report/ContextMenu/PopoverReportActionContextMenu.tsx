import type {ForwardedRef, RefObject} from 'react';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
/* eslint-disable no-restricted-imports */
import type {EmitterSubscription, GestureResponderEvent, NativeTouchEvent, Text as RNText, View as ViewType} from 'react-native';
import {Dimensions, View} from 'react-native';
import {Actions, useActionSheetAwareScrollViewActions} from '@components/ActionSheetAwareScrollView';
import FocusableMenuItem from '@components/FocusableMenuItem';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import {ModalActions, useModal} from '@components/Modal/Global/ModalContext';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRestoreInputFocus from '@hooks/useRestoreInputFocus';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import CONST from '@src/CONST';
import {ORDERED_ACTION_SHOULD_SHOW} from './actions/actionConfig';
import type {ActionDescriptor} from './actions/ActionDescriptor';
import {useEmojiReactionData} from './actions/ContextMenuAction';
import ConfirmDeleteReportActionModal from './ConfirmDeleteReportActionModal';
import type {ContextMenuPayloadContextValue} from './ContextMenuPayloadProvider';
import {ContextMenuPayloadContext} from './ContextMenuPayloadProvider';
import type {ContextMenuAnchor, ContextMenuType, ReportActionContextMenu} from './ReportActionContextMenu';
import {showContextMenu} from './ReportActionContextMenu';
import useContextMenuActions from './useContextMenuActions';
import useContextMenuData from './useContextMenuData';

function extractPointerEvent(event: GestureResponderEvent | MouseEvent): MouseEvent | NativeTouchEvent {
    if ('nativeEvent' in event) {
        return event.nativeEvent;
    }
    return event;
}

type PopoverPosition = {
    anchorHorizontal: number;
    anchorVertical: number;
    anchorWidth: number;
    anchorHeight: number;
};

type PopoverContextMenuState = {
    type: ContextMenuType;
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    selection: string;
    draftMessage: string | undefined;
    isOverflowMenu: boolean;
    withoutOverlay: boolean;
    position: PopoverPosition;
    contextMenuTargetNode: HTMLDivElement | null;
    onEmojiPickerToggle: ((state: boolean) => void) | undefined;
};

type PopoverReportActionContextMenuProps = {
    ref?: ForwardedRef<ReportActionContextMenu>;
};

function PopoverContextMenuContent({
    isPopoverVisible,
    localShouldKeepOpen,
    visibleActionIDs,
    setLocalShouldKeepOpen,
}: {
    isPopoverVisible: boolean;
    localShouldKeepOpen: boolean;
    visibleActionIDs: Set<string>;
    setLocalShouldKeepOpen: (val: boolean) => void;
}) {
    const actions = useContextMenuActions(visibleActionIDs);
    const emojiData = useEmojiReactionData();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const shouldKeepOpen = localShouldKeepOpen;
    const shouldEnableArrowNavigation = isPopoverVisible || shouldKeepOpen;

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

    return (
        <FocusTrapForModal active={!isSmallScreenWidth && (isPopoverVisible || shouldKeepOpen)}>
            <View>
                {hasEmoji && emojiData.reportActionID != null && (
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
                {actions.map((action: ActionDescriptor, i: number) => (
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
    );
}

function PopoverReportActionContextMenu({ref}: PopoverReportActionContextMenuProps) {
    const {transitionActionSheetState} = useActionSheetAwareScrollViewActions();
    const modalContext = useModal();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();

    const [menuState, setMenuState] = useState<PopoverContextMenuState | null>(null);
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [isContextMenuOpening, setIsContextMenuOpening] = useState(false);
    const [composerToRefocusOnClose, setComposerToRefocusOnClose] = useState<ComposerType>();
    const [localShouldKeepOpen, setLocalShouldKeepOpen] = useState(false);

    const reportActionID = menuState?.reportActionID;

    const cursorRelativePosition = useRef({horizontal: 0, vertical: 0});
    const instanceIDRef = useRef('');

    const contentRef = useRef<ViewType>(null);
    const anchorRef = useRef<ViewType | HTMLDivElement | null>(null);
    const dimensionsEventListener = useRef<EmitterSubscription | null>(null);
    const contextMenuAnchorRef = useRef<ContextMenuAnchor>(null);

    const onPopoverShow = useRef(() => {});
    const onPopoverHide = useRef(() => {});
    const onPopoverHideActionCallback = useRef(() => {});

    useRestoreInputFocus(isPopoverVisible);

    const getContextMenuMeasuredLocation = () =>
        new Promise<{x: number; y: number}>((resolve) => {
            if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                contextMenuAnchorRef.current.measureInWindow((x, y) => resolve({x, y}));
            } else {
                resolve({x: 0, y: 0});
            }
        });

    const measureContextMenuAnchorPosition = () => {
        if (!isPopoverVisible) {
            return;
        }

        getContextMenuMeasuredLocation().then(({x, y}) => {
            if (!x || !y) {
                return;
            }

            setMenuState((prev) => {
                if (!prev) {
                    return prev;
                }
                return {
                    ...prev,
                    position: {
                        ...prev.position,
                        anchorHorizontal: cursorRelativePosition.current.horizontal + x,
                        anchorVertical: cursorRelativePosition.current.vertical + y,
                    },
                };
            });
        });
    };

    useEffect(() => {
        dimensionsEventListener.current = Dimensions.addEventListener('change', measureContextMenuAnchorPosition);

        return () => {
            if (!dimensionsEventListener.current) {
                return;
            }
            dimensionsEventListener.current.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPopoverVisible]);

    const isActiveReportAction: ReportActionContextMenu['isActiveReportAction'] = (actionID) => !!actionID && reportActionID === String(actionID);

    const clearActiveReportAction = () => {
        setMenuState(null);
    };

    const showContextMenuHandler: ReportActionContextMenu['showContextMenu'] = (showContextMenuParams) => {
        const {
            type,
            event,
            selection,
            contextMenuAnchor,
            report: currentReport = {},
            reportAction: reportActionParam = {},
            callbacks = {},
            shouldCloseOnTarget = false,
            isOverflowMenu = false,
            withoutOverlay = true,
        } = showContextMenuParams;
        if (ReportActionComposeFocusManager.isFocused()) {
            setComposerToRefocusOnClose('main');
        } else if (ReportActionComposeFocusManager.isEditFocused()) {
            setComposerToRefocusOnClose('edit');
        }

        const {reportID: showReportID, originalReportID: showOriginalReportID} = currentReport;
        const {reportActionID: showReportActionID, draftMessage} = reportActionParam;
        const {onShow = () => {}, onHide = () => {}, setIsEmojiPickerActive = () => {}} = callbacks;
        setIsContextMenuOpening(true);

        const {pageX = 0, pageY = 0} = extractPointerEvent(event);
        contextMenuAnchorRef.current = contextMenuAnchor;
        const targetNode = event.target as HTMLDivElement;
        if (shouldCloseOnTarget) {
            anchorRef.current = targetNode;
        } else {
            anchorRef.current = null;
        }

        onPopoverShow.current = onShow;
        onPopoverHide.current = onHide;

        new Promise<PopoverPosition>((resolve) => {
            const anchor = contextMenuAnchorRef.current;
            const useAnchorPosition = isOverflowMenu || (anchor != null && !pageX && !pageY);
            if (useAnchorPosition && anchor) {
                calculateAnchorPosition(anchor).then((position) => {
                    resolve({
                        anchorHorizontal: position.horizontal,
                        anchorVertical: position.vertical,
                        anchorWidth: position.width,
                        anchorHeight: position.height,
                    });
                });
            } else {
                getContextMenuMeasuredLocation().then(({x, y}) => {
                    cursorRelativePosition.current = {
                        horizontal: pageX - x,
                        vertical: pageY - y,
                    };
                    resolve({
                        anchorHorizontal: pageX,
                        anchorVertical: pageY,
                        anchorWidth: 0,
                        anchorHeight: 0,
                    });
                });
            }
        }).then((position) => {
            setMenuState({
                type,
                reportID: showReportID,
                reportActionID: showReportActionID,
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                originalReportID: showOriginalReportID || undefined,
                selection,
                draftMessage,
                isOverflowMenu,
                withoutOverlay,
                position,
                contextMenuTargetNode: targetNode,
                onEmojiPickerToggle: setIsEmojiPickerActive,
            });
            setIsPopoverVisible(true);
        });
    };

    const runAndResetOnPopoverShow = () => {
        instanceIDRef.current = Math.random().toString(36).slice(2, 7);
        onPopoverShow.current();
        onPopoverShow.current = () => {};
        setTimeout(() => {
            setIsContextMenuOpening(false);
        }, CONST.ANIMATED_TRANSITION);
    };

    const runAndResetCallback = (callback: () => void) => {
        callback();
        return () => {};
    };

    const runAndResetOnPopoverHide = () => {
        setMenuState(null);
        instanceIDRef.current = '';

        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };

    const hideContextMenuHandler: ReportActionContextMenu['hideContextMenu'] = (hideContextMenuParams) => {
        const {callbacks = {}} = hideContextMenuParams ?? {};

        if (typeof callbacks.onHide === 'function') {
            onPopoverHideActionCallback.current = callbacks.onHide;
        }

        setIsPopoverVisible(false);

        transitionActionSheetState({
            type: Actions.CLOSE_POPOVER,
        });

        refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose).then(() => {
            setComposerToRefocusOnClose(undefined);
        });
    };

    const isDeleteModalActiveRef = useRef(false);

    const hideDeleteModal = () => {
        if (!isDeleteModalActiveRef.current) {
            return;
        }
        modalContext.closeModal();
    };

    const showDeleteModal: ReportActionContextMenu['showDeleteModal'] = (
        showReportID,
        showReportAction,
        _shouldSetModalVisibility,
        onConfirm = () => {},
        onCancel = () => {},
        actionSourceReportID = undefined,
    ) => {
        if (!showReportID || !showReportAction?.reportActionID) {
            return;
        }

        setMenuState((prev) => ({
            ...(prev ?? {
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION as ContextMenuType,
                selection: '',
                draftMessage: undefined,
                isOverflowMenu: false,
                withoutOverlay: true,
                position: {anchorHorizontal: 0, anchorVertical: 0, anchorWidth: 0, anchorHeight: 0},
                contextMenuTargetNode: null,
                onEmojiPickerToggle: undefined,
            }),
            reportID: showReportID,
            reportActionID: showReportAction.reportActionID,
            originalReportID: prev?.originalReportID,
        }));

        isDeleteModalActiveRef.current = true;
        modalContext
            .showModal({
                component: ConfirmDeleteReportActionModal,
                props: {
                    reportID: showReportID,
                    reportActionID: showReportAction.reportActionID,
                    actionSourceReportID,
                },
            })
            .then((result) => {
                isDeleteModalActiveRef.current = false;
                if (result.action === ModalActions.CONFIRM) {
                    onConfirm();
                } else {
                    onCancel();
                }
                clearActiveReportAction();
            });
    };

    useImperativeHandle(ref, () => ({
        showContextMenu: showContextMenuHandler,
        hideContextMenu: hideContextMenuHandler,
        showDeleteModal,
        hideDeleteModal,
        isActiveReportAction,
        instanceIDRef,
        runAndResetOnPopoverHide,
        clearActiveReportAction,
        contentRef,
        isContextMenuOpening,
        composerToRefocusOnCloseEmojiPicker: composerToRefocusOnClose,
    }));

    const data = useContextMenuData({
        reportID: menuState?.reportID,
        reportActionID: menuState?.reportActionID,
        originalReportID: menuState?.originalReportID,
        draftMessage: menuState?.draftMessage ?? '',
        selection: menuState?.selection ?? '',
        type: menuState?.type ?? CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        anchor: {current: menuState?.contextMenuTargetNode ?? null},
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    const hideAndRun = (callback?: () => void) => {
        import('@pages/inbox/report/ContextMenu/ReportActionContextMenu').then(({hideContextMenu: hideCtx}) => {
            hideCtx(false, callback);
        });
    };

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRefParam: RefObject<ViewType | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: menuState?.selection ?? '',
            contextMenuAnchor: anchorRefParam?.current as ViewType | RNText | null,
            report: {
                reportID: menuState?.reportID,
                originalReportID: menuState?.originalReportID,
            },
            reportAction: {
                reportActionID: data.reportAction?.reportActionID,
                draftMessage: menuState?.draftMessage,
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

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const payloadValue: ContextMenuPayloadContextValue = {
        ...data,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        reportAction: (data.reportAction ?? null) as NonNullable<typeof data.reportAction>,
        currentUserAccountID: data.currentUserPersonalDetails?.accountID,
        close: () => setLocalShouldKeepOpen(false),
        hideAndRun,
        transitionActionSheetState,
        openContextMenu: () => setLocalShouldKeepOpen(true),
        openOverflowMenu,
        setIsEmojiPickerActive: menuState?.onEmojiPickerToggle,
    };

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <PopoverWithMeasuredContent
            isVisible={isPopoverVisible}
            onClose={() => hideContextMenuHandler()}
            onModalShow={runAndResetOnPopoverShow}
            onModalHide={runAndResetOnPopoverHide}
            anchorPosition={{
                horizontal: menuState?.position.anchorHorizontal ?? 0,
                vertical: menuState?.position.anchorVertical ?? 0,
            }}
            animationIn="fadeIn"
            disableAnimation={false}
            shouldSetModalVisibility={false}
            fullscreen
            withoutOverlay={menuState?.withoutOverlay ?? true}
            anchorDimensions={{
                width: menuState?.position.anchorWidth ?? 0,
                height: menuState?.position.anchorHeight ?? 0,
            }}
            anchorRef={anchorRef}
            shouldSwitchPositionIfOverflow={menuState?.isOverflowMenu ?? false}
        >
            <ContextMenuPayloadContext.Provider value={payloadValue}>
                <View
                    ref={contentRef}
                    style={wrapperStyle}
                >
                    <PopoverContextMenuContent
                        isPopoverVisible={isPopoverVisible}
                        localShouldKeepOpen={localShouldKeepOpen}
                        visibleActionIDs={visibleActionIDs}
                        setLocalShouldKeepOpen={setLocalShouldKeepOpen}
                    />
                </View>
            </ContextMenuPayloadContext.Provider>
        </PopoverWithMeasuredContent>
    );
}

export default PopoverReportActionContextMenu;
