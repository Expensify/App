import React, {useCallback, useContext, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef, RefObject} from 'react';
import {Dimensions, View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import {Actions, ActionSheetAwareScrollViewContext} from '@components/ActionSheetAwareScrollView';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import type {AnchorOrigin, EmojiPickerOnModalHide, EmojiPickerRef, EmojiPopoverAnchor, OnEmojiSelected, ShowEmojiPickerOptions} from '@libs/actions/EmojiPickerAction';
import {isMobileChrome} from '@libs/Browser';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import DomUtils from '@libs/DomUtils';
import refocusComposerAfterPreventFirstResponder from '@libs/refocusComposerAfterPreventFirstResponder';
import type {ComposerType} from '@libs/ReportActionComposeFocusManager';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import EmojiPickerMenu from './EmojiPickerMenu';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

type EmojiPickerProps = {
    viewportOffsetTop: number;
    ref?: ForwardedRef<EmojiPickerRef>;
};

function EmojiPicker({viewportOffsetTop, ref}: EmojiPickerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const actionSheetAwareScrollViewContext = useContext(ActionSheetAwareScrollViewContext);

    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [emojiPopoverAnchorPosition, setEmojiPopoverAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });
    const [emojiPopoverAnchorOrigin, setEmojiPopoverAnchorOrigin] = useState<AnchorOrigin>(DEFAULT_ANCHOR_ORIGIN);
    const [isWithoutOverlay, setIsWithoutOverlay] = useState(true);
    const [activeID, setActiveID] = useState<string | null>();
    const emojiPopoverAnchorRef = useRef<EmojiPopoverAnchor | null>(null);
    const emojiAnchorDimension = useRef({
        width: 0,
        height: 0,
    });
    const onModalHide = useRef<EmojiPickerOnModalHide>(() => {});
    const onEmojiSelected = useRef<OnEmojiSelected>(() => {});
    const activeEmoji = useRef<string | undefined>(undefined);
    const emojiSearchInput = useRef<BaseTextInputRef | null>(null);
    const composerToRefocusOnClose = useRef<ComposerType | undefined>(undefined);
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    /**
     * Get the popover anchor ref
     *
     * emojiPopoverAnchorRef contains either null or the ref object of the anchor element.
     * { current: { current: anchorElement } }
     *
     * Don't directly get the ref from emojiPopoverAnchorRef, instead use getEmojiPopoverAnchor()
     */
    const getEmojiPopoverAnchor = useCallback(() => emojiPopoverAnchorRef.current ?? (emojiPopoverAnchorRef as EmojiPopoverAnchor), []);

    /**
     * Show the emoji picker menu.
     *
     * @param [onModalHideValue=() => {}] - Run a callback when Modal hides.
     * @param [onEmojiSelectedValue=() => {}] - Run a callback when Emoji selected.
     * @param emojiPopoverAnchorValue - Element to which Popover is anchored
     * @param [anchorOrigin=DEFAULT_ANCHOR_ORIGIN] - Anchor origin for Popover
     * @param [onWillShow] - Run a callback when Popover will show
     * @param id - Unique id for EmojiPicker
     * @param activeEmojiValue - Selected emoji to be highlighted
     */
    const showEmojiPicker = ({
        onModalHide: onModalHideValue,
        onEmojiSelected: onEmojiSelectedValue,
        emojiPopoverAnchor: emojiPopoverAnchorValue,
        anchorOrigin,
        onWillShow = () => {},
        id = undefined,
        activeEmoji: activeEmojiValue,
        withoutOverlay = true,
        composerToRefocusOnClose: composerToRefocusOnCloseValue,
    }: ShowEmojiPickerOptions) => {
        actionSheetAwareScrollViewContext.transitionActionSheetState({
            type: Actions.TRANSITION_POPOVER,
        });

        composerToRefocusOnClose.current = composerToRefocusOnCloseValue;
        if (composerToRefocusOnCloseValue === 'main') {
            ReportActionComposeFocusManager.preventComposerFocusOnFirstResponderOnce();
        } else if (composerToRefocusOnCloseValue === 'edit') {
            ReportActionComposeFocusManager.preventEditComposerFocusOnFirstResponderOnce();
        }

        onModalHide.current = onModalHideValue;
        onEmojiSelected.current = onEmojiSelectedValue;
        activeEmoji.current = activeEmojiValue;
        setIsWithoutOverlay(withoutOverlay);
        emojiPopoverAnchorRef.current = emojiPopoverAnchorValue;
        const emojiPopoverAnchor = getEmojiPopoverAnchor();
        // Drop focus to avoid blue focus ring.
        emojiPopoverAnchor?.current?.blur();

        const anchorOriginValue = anchorOrigin ?? DEFAULT_ANCHOR_ORIGIN;

        // It's possible that the anchor is inside an active modal (e.g., add emoji reaction in report context menu).
        // So, we need to get the anchor position first before closing the active modal which will also destroy the anchor.
        KeyboardUtils.dismiss(true).then(() =>
            calculateAnchorPosition(emojiPopoverAnchor?.current, anchorOriginValue).then((value) => {
                close(() => {
                    onWillShow?.();
                    setIsEmojiPickerVisible(true);
                    setEmojiPopoverAnchorPosition({
                        horizontal: value.horizontal,
                        vertical: value.vertical,
                    });
                    emojiAnchorDimension.current = {
                        width: value.width,
                        height: value.height,
                    };
                    setEmojiPopoverAnchorOrigin(anchorOriginValue);
                    setActiveID(id);
                });
            }),
        );
    };

    /**
     * Hide the emoji picker menu.
     */
    const hideEmojiPicker = useCallback(
        (isNavigating?: boolean) => {
            const activeElementId = DomUtils.getActiveElement()?.id;
            if (activeElementId !== CONST.COMPOSER.NATIVE_ID) {
                blurActiveElement();
            }
            const currOnModalHide = onModalHide.current;
            onModalHide.current = () => {
                if (currOnModalHide) {
                    currOnModalHide(!!isNavigating);
                }

                emojiPopoverAnchorRef.current = null;
            };
            setIsEmojiPickerVisible(false);
            actionSheetAwareScrollViewContext.transitionActionSheetState({
                type: Actions.CLOSE_POPOVER,
            });
        },
        [actionSheetAwareScrollViewContext],
    );

    const handleModalHide = () => {
        onModalHide.current();

        refocusComposerAfterPreventFirstResponder(composerToRefocusOnClose.current).then(() => {
            composerToRefocusOnClose.current = undefined;
        });
    };

    /**
     * Focus the search input in the emoji picker.
     */
    const focusEmojiSearchInput = () => {
        if (!emojiSearchInput.current) {
            return;
        }
        emojiSearchInput.current.focus();
    };

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     */
    const selectEmoji = (emoji: string, emojiObject: Emoji, preferredSkinTone: number) => {
        // Prevent fast click / multiple emoji selection;
        // The first click will hide the emoji picker by calling the hideEmojiPicker() function
        if (!isEmojiPickerVisible) {
            return;
        }

        hideEmojiPicker(false);
        if (typeof onEmojiSelected.current === 'function') {
            onEmojiSelected.current(emoji, emojiObject, preferredSkinTone);
        }
    };

    /**
     * Whether emoji picker is active for the given id.
     */
    const isActive = (id: string) => !!id && id === activeID;

    const clearActive = () => setActiveID(null);

    const resetEmojiPopoverAnchor = () => (emojiPopoverAnchorRef.current = null);

    useImperativeHandle(ref, () => ({showEmojiPicker, isActive, clearActive, hideEmojiPicker, isEmojiPickerVisible, resetEmojiPopoverAnchor}));

    useEffect(() => {
        const emojiPopoverDimensionListener = Dimensions.addEventListener('change', () => {
            const emojiPopoverAnchor = getEmojiPopoverAnchor();
            if (!emojiPopoverAnchor?.current) {
                // In small screen width, the window size change might be due to keyboard open/hide, we should avoid hide EmojiPicker in those cases
                if (isEmojiPickerVisible && !shouldUseNarrowLayout) {
                    hideEmojiPicker();
                }
                return;
            }
            calculateAnchorPosition(emojiPopoverAnchor?.current, emojiPopoverAnchorOrigin).then((value) => {
                setEmojiPopoverAnchorPosition({
                    horizontal: value.horizontal,
                    vertical: value.vertical,
                });
                emojiAnchorDimension.current = {
                    width: value.width,
                    height: value.height,
                };
            });
        });
        return () => {
            if (!emojiPopoverDimensionListener) {
                return;
            }
            emojiPopoverDimensionListener.remove();
        };
    }, [isEmojiPickerVisible, shouldUseNarrowLayout, emojiPopoverAnchorOrigin, getEmojiPopoverAnchor, hideEmojiPicker]);

    return (
        <PopoverWithMeasuredContent
            shouldHandleNavigationBack={isMobileChrome()}
            isVisible={isEmojiPickerVisible}
            onClose={hideEmojiPicker}
            onModalShow={focusEmojiSearchInput}
            onModalHide={handleModalHide}
            shouldSetModalVisibility={false}
            anchorPosition={{
                vertical: emojiPopoverAnchorPosition.vertical,
                horizontal: emojiPopoverAnchorPosition.horizontal,
            }}
            anchorRef={getEmojiPopoverAnchor() as RefObject<View | HTMLDivElement>}
            withoutOverlay={isWithoutOverlay}
            popoverDimensions={{
                width: CONST.EMOJI_PICKER_SIZE.WIDTH,
                height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
            }}
            anchorAlignment={emojiPopoverAnchorOrigin}
            outerStyle={StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)}
            innerContainerStyle={styles.popoverInnerContainer}
            anchorDimensions={emojiAnchorDimension.current}
            avoidKeyboard
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSkipRemeasurement
        >
            <FocusTrapForModal active={isEmojiPickerVisible}>
                <View>
                    <EmojiPickerMenu
                        onEmojiSelected={selectEmoji}
                        activeEmoji={activeEmoji.current}
                        ref={(el) => {
                            emojiSearchInput.current = el;
                        }}
                    />
                </View>
            </FocusTrapForModal>
        </PopoverWithMeasuredContent>
    );
}

export default withViewportOffsetTop(EmojiPicker);
