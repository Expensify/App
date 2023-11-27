import PropTypes from 'prop-types';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Dimensions} from 'react-native';
import _ from 'underscore';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';
import calculateAnchorPosition from '@libs/calculateAnchorPosition';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import EmojiPickerMenu from './EmojiPickerMenu';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

const propTypes = {
    viewportOffsetTop: PropTypes.number.isRequired,
};

const EmojiPicker = forwardRef((props, ref) => {
    const styles = useThemeStyles();
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [emojiPopoverAnchorPosition, setEmojiPopoverAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });
    const [emojiPopoverAnchorOrigin, setEmojiPopoverAnchorOrigin] = useState(DEFAULT_ANCHOR_ORIGIN);
    const [activeID, setActiveID] = useState();
    const emojiPopoverAnchor = useRef(null);
    const onModalHide = useRef(() => {});
    const onEmojiSelected = useRef(() => {});
    const emojiSearchInput = useRef();
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();

    /**
     * Show the emoji picker menu.
     *
     * @param {Function} [onModalHideValue=() => {}] - Run a callback when Modal hides.
     * @param {Function} [onEmojiSelectedValue=() => {}] - Run a callback when Emoji selected.
     * @param {Element} emojiPopoverAnchorValue - Element to which Popover is anchored
     * @param {Object} [anchorOrigin=DEFAULT_ANCHOR_ORIGIN] - Anchor origin for Popover
     * @param {Function} [onWillShow=() => {}] - Run a callback when Popover will show
     * @param {String} id - Unique id for EmojiPicker
     */
    const showEmojiPicker = (onModalHideValue, onEmojiSelectedValue, emojiPopoverAnchorValue, anchorOrigin, onWillShow = () => {}, id) => {
        onModalHide.current = onModalHideValue;
        onEmojiSelected.current = onEmojiSelectedValue;
        emojiPopoverAnchor.current = emojiPopoverAnchorValue;
        if (emojiPopoverAnchor.current && emojiPopoverAnchor.current.blur) {
            // Drop focus to avoid blue focus ring.
            emojiPopoverAnchor.current.blur();
        }

        const anchorOriginValue = anchorOrigin || DEFAULT_ANCHOR_ORIGIN;

        calculateAnchorPosition(emojiPopoverAnchor.current, anchorOriginValue).then((value) => {
            onWillShow();
            setIsEmojiPickerVisible(true);
            setEmojiPopoverAnchorPosition(value);
            setEmojiPopoverAnchorOrigin(anchorOriginValue);
            setActiveID(id);
        });
    };

    /**
     * Hide the emoji picker menu.
     *
     * @param {Boolean} isNavigating
     */
    const hideEmojiPicker = (isNavigating) => {
        if (isNavigating) {
            onModalHide.current = () => {};
        }
        emojiPopoverAnchor.current = null;
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
     *
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    const selectEmoji = (emoji, emojiObject) => {
        // Prevent fast click / multiple emoji selection;
        // The first click will hide the emoji picker by calling the hideEmojiPicker() function
        if (!isEmojiPickerVisible) {
            return;
        }

        hideEmojiPicker(false);
        if (_.isFunction(onEmojiSelected.current)) {
            onEmojiSelected.current(emoji, emojiObject);
        }
    };

    /**
     * Whether emoji picker is active for the given id.
     *
     * @param {String} id
     * @return {Boolean}
     */
    const isActive = (id) => Boolean(id) && id === activeID;

    const clearActive = () => setActiveID(null);

    const resetEmojiPopoverAnchor = () => (emojiPopoverAnchor.current = null);

    useImperativeHandle(ref, () => ({showEmojiPicker, isActive, clearActive, hideEmojiPicker, isEmojiPickerVisible, resetEmojiPopoverAnchor}));

    useEffect(() => {
        const emojiPopoverDimensionListener = Dimensions.addEventListener('change', () => {
            if (!emojiPopoverAnchor.current) {
                // In small screen width, the window size change might be due to keyboard open/hide, we should avoid hide EmojiPicker in those cases
                if (isEmojiPickerVisible && !isSmallScreenWidth) {
                    hideEmojiPicker();
                }
                return;
            }
            calculateAnchorPosition(emojiPopoverAnchor.current, emojiPopoverAnchorOrigin).then((value) => {
                setEmojiPopoverAnchorPosition(value);
            });
        });
        return () => {
            if (!emojiPopoverDimensionListener) {
                return;
            }
            emojiPopoverDimensionListener.remove();
        };
    }, [isEmojiPickerVisible, isSmallScreenWidth, emojiPopoverAnchorOrigin]);

    // There is no way to disable animations, and they are really laggy, because there are so many
    // emojis. The best alternative is to set it to 1ms so it just "pops" in and out
    return (
        <PopoverWithMeasuredContent
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
            anchorRef={emojiPopoverAnchor}
            withoutOverlay
            popoverDimensions={{
                width: CONST.EMOJI_PICKER_SIZE.WIDTH,
                height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
            }}
            anchorAlignment={emojiPopoverAnchorOrigin}
            outerStyle={StyleUtils.getOuterModalStyle(windowHeight, props.viewportOffsetTop)}
            innerContainerStyle={styles.popoverInnerContainer}
            avoidKeyboard
        >
            <EmojiPickerMenu
                onEmojiSelected={selectEmoji}
                ref={(el) => (emojiSearchInput.current = el)}
            />
        </PopoverWithMeasuredContent>
    );
});

EmojiPicker.propTypes = propTypes;
EmojiPicker.displayName = 'EmojiPicker';
export default withViewportOffsetTop(EmojiPicker);
