import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef, RefObject} from 'react';
import {Dimensions, View} from 'react-native';
import type {Emoji} from '@assets/emojis/types';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {AnchorOrigin, EmojiPickerRef, EmojiPopoverAnchor, OnEmojiSelected, OnModalHideValue, OnWillShowPicker} from '@libs/actions/EmojiPickerAction';
import * as Browser from '@libs/Browser';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import EmojiPickerMenu from './EmojiPickerMenu';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

type EmojiPickerProps = {
    viewportOffsetTop: number;
};

function EmojiPicker({viewportOffsetTop}: EmojiPickerProps, ref: ForwardedRef<EmojiPickerRef>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [emojiPopoverAnchorPosition, setEmojiPopoverAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });
    const [emojiPopoverAnchorOrigin, setEmojiPopoverAnchorOrigin] = useState<AnchorOrigin>(DEFAULT_ANCHOR_ORIGIN);
    const [activeID, setActiveID] = useState<string | null>();
    const emojiPopoverAnchorRef = useRef<EmojiPopoverAnchor | null>(null);
    const emojiAnchorDimension = useRef({
        width: 0,
        height: 0,
    });
    const onModalHide = useRef<OnModalHideValue>(() => {});
    const onEmojiSelected = useRef<OnEmojiSelected>(() => {});
    const activeEmoji = useRef<string | undefined>();
    const emojiSearchInput = useRef<BaseTextInputRef | null>();
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
    const getEmojiPopoverAnchor = useCallback(() => emojiPopoverAnchorRef.current ?? emojiPopoverAnchorRef?.current, []);

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
    const showEmojiPicker = (
        onModalHideValue: OnModalHideValue,
        onEmojiSelectedValue: OnEmojiSelected,
        emojiPopoverAnchorValue: EmojiPopoverAnchor,
        anchorOrigin?: AnchorOrigin,
        onWillShow?: OnWillShowPicker,
        id?: string,
        activeEmojiValue?: string,
    ) => {
        onModalHide.current = onModalHideValue;
        onEmojiSelected.current = onEmojiSelectedValue;
        activeEmoji.current = activeEmojiValue;
        emojiPopoverAnchorRef.current = emojiPopoverAnchorValue;
        const emojiPopoverAnchor = getEmojiPopoverAnchor();
        // Drop focus to avoid blue focus ring.
        emojiPopoverAnchor?.current?.blur();

        const anchorOriginValue = anchorOrigin ?? DEFAULT_ANCHOR_ORIGIN;

        // It's possible that the anchor is inside an active modal (e.g., add emoji reaction in report context menu).
        // So, we need to get the anchor position first before closing the active modal which will also destroy the anchor.
        calculateAnchorPosition(emojiPopoverAnchor?.current, anchorOriginValue).then((value) => {
            Modal.close(() => {
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
        });
    };

    /**
     * Hide the emoji picker menu.
     */
    const hideEmojiPicker = (isNavigating?: boolean) => {
        const currOnModalHide = onModalHide.current;
        onModalHide.current = () => {
            if (currOnModalHide) {
                currOnModalHide(!!isNavigating);
            }
            // eslint-disable-next-line react-compiler/react-compiler
            emojiPopoverAnchorRef.current = null;
        };
        setIsEmojiPickerVisible(false);
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
    const selectEmoji = (emoji: string, emojiObject: Emoji) => {
        // Prevent fast click / multiple emoji selection;
        // The first click will hide the emoji picker by calling the hideEmojiPicker() function
        if (!isEmojiPickerVisible) {
            return;
        }

        hideEmojiPicker(false);
        if (typeof onEmojiSelected.current === 'function') {
            onEmojiSelected.current(emoji, emojiObject);
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
    }, [isEmojiPickerVisible, shouldUseNarrowLayout, emojiPopoverAnchorOrigin, getEmojiPopoverAnchor]);

    // There is no way to disable animations, and they are really laggy, because there are so many
    // emojis. The best alternative is to set it to 1ms so it just "pops" in and out
    return (
        <PopoverWithMeasuredContent
            shouldHandleNavigationBack={Browser.isMobileChrome()}
            isVisible={isEmojiPickerVisible}
            onClose={hideEmojiPicker}
            onModalShow={focusEmojiSearchInput}
            onModalHide={onModalHide.current}
            hideModalContentWhileAnimating
            shouldSetModalVisibility={false}
            animationInTiming={1}
            animationOutTiming={1}
            anchorPosition={{
                vertical: emojiPopoverAnchorPosition.vertical,
                horizontal: emojiPopoverAnchorPosition.horizontal,
            }}
            anchorRef={getEmojiPopoverAnchor() as RefObject<View | HTMLDivElement>}
            withoutOverlay
            popoverDimensions={{
                width: CONST.EMOJI_PICKER_SIZE.WIDTH,
                height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
            }}
            anchorAlignment={emojiPopoverAnchorOrigin}
            outerStyle={StyleUtils.getOuterModalStyle(windowHeight, viewportOffsetTop)}
            innerContainerStyle={styles.popoverInnerContainer}
            anchorDimensions={emojiAnchorDimension.current}
            avoidKeyboard
            shoudSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
        >
            <FocusTrapForModal active={isEmojiPickerVisible}>
                <View>
                    <EmojiPickerMenu
                        onEmojiSelected={selectEmoji}
                        activeEmoji={activeEmoji.current}
                        ref={(el) => (emojiSearchInput.current = el)}
                    />
                </View>
            </FocusTrapForModal>
        </PopoverWithMeasuredContent>
    );
}

EmojiPicker.displayName = 'EmojiPicker';
export default withViewportOffsetTop(forwardRef(EmojiPicker));
