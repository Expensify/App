import React, {useState, useEffect, useRef} from 'react';
import {Dimensions, Keyboard} from 'react-native';
import _ from 'underscore';
import EmojiPickerMenu from './EmojiPickerMenu';
import CONST from '../../CONST';
import PopoverWithMeasuredContent from '../PopoverWithMeasuredContent';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

function EmojiPicker () {
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [emojiPopoverAnchorPosition, setEmojiPopoverAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });
    const [emojiPopoverAnchorOrigin, setEmojiPopoverAnchorOrigin] = useState(DEFAULT_ANCHOR_ORIGIN);
    const [onModalHide, setOnModalHide] = useState(() => {});
    const [onEmojiSelected, setOnEmojiSelected] = useState(() => {});
    const [emojiPopoverAnchor, setEmojiPopoverAnchor] = useState(null);
    const emojiSearchInput = useRef();

    function measureEmojiPopoverAnchorPosition() {
        return new Promise((resolve) => {
            if (!emojiPopoverAnchor) {
                return resolve({horizontal: 0, vertical: 0});
            }
            emojiPopoverAnchor.measureInWindow((x, y, width) => resolve({horizontal: x + width, vertical: y}));
        });
    }

    function measureEmojiPopoverAnchorPositionAndUpdateState() {
        measureEmojiPopoverAnchorPosition().then((value) => {
            setEmojiPopoverAnchorPosition(value);
        });
    }

    useEffect(() => {
        if (isEmojiPickerVisible) {
            Keyboard.dismiss();
        }

        const emojiPopoverDimensionListener = Dimensions.addEventListener('change', measureEmojiPopoverAnchorPositionAndUpdateState);
        return () => {
            emojiPopoverDimensionListener.remove();
        }
    }, [isEmojiPickerVisible]);

    /**
     * Hide the emoji picker menu.
     *
     * @param {Boolean} isNavigating
     */
    const hideEmojiPicker = (isNavigating) => {
        if (isNavigating) {
            setOnModalHide( () => {});
        }
        setEmojiPopoverAnchor(null);
        setIsEmojiPickerVisible(false);
    }

    /**
     * Focus the search input in the emoji picker.
     */
    const focusEmojiSearchInput = () => {
        if (!emojiSearchInput) {
            return;
        }
        emojiSearchInput.focus();
    }

    /**
     * Show the emoji picker menu.
     *
     * @param {Function} [onModalHideValue=() => {}] - Run a callback when Modal hides.
     * @param {Function} [onEmojiSelectedValue=() => {}] - Run a callback when Emoji selected.
     * @param {Element} emojiPopoverAnchorValue - Element to which Popover is anchored
     * @param {Object} [anchorOrigin=DEFAULT_ANCHOR_ORIGIN] - Anchor origin for Popover
     * @param {Function} [onWillShow=() => {}] - Run a callback when Popover will show
     */
    function showEmojiPicker(onModalHideValue, onEmojiSelectedValue, emojiPopoverAnchorValue, anchorOrigin, onWillShow = () => {}) {
        setOnModalHide(onModalHideValue);
        setOnEmojiSelected(onEmojiSelectedValue);
        setEmojiPopoverAnchor(emojiPopoverAnchorValue);

        if (emojiPopoverAnchor) {
            // Drop focus to avoid blue focus ring.
            emojiPopoverAnchor.blur();
        }

        measureEmojiPopoverAnchorPosition().then((value) => {
            onWillShow();
            setIsEmojiPickerVisible(true);
            setEmojiPopoverAnchorPosition(value);
            setEmojiPopoverAnchorOrigin(anchorOrigin || DEFAULT_ANCHOR_ORIGIN);
        });
    }

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    const selectEmoji = (emoji, emojiObject) => {
        // Prevent fast click / multiple emoji selection;
        // The first click will hide the emoji picker by calling the hideEmojiPicker() function
        // and in that function the emojiPopoverAnchor prop to will be set to null (synchronously)
        // thus we rely on that prop to prevent fast click / multiple emoji selection
        if (!emojiPopoverAnchor) {
            return;
        }

        hideEmojiPicker();
        if (_.isFunction(onEmojiSelected)) {
            onEmojiSelected(emoji, emojiObject);
        }
    }

    // There is no way to disable animations and they are really laggy, because there are so many
    // emojis. The best alternative is to set it to 1ms so it just "pops" in and out
    return (
        <PopoverWithMeasuredContent
            isVisible={isEmojiPickerVisible}
            onClose={hideEmojiPicker}
            onModalShow={focusEmojiSearchInput}
            onModalHide={onModalHide}
            hideModalContentWhileAnimating
            shouldSetModalVisibility={false}
            animationInTiming={1}
            animationOutTiming={1}
            anchorPosition={{
                vertical: emojiPopoverAnchorPosition.vertical,
                horizontal: emojiPopoverAnchorPosition.horizontal,
            }}
            popoverDimensions={{
                width: CONST.EMOJI_PICKER_SIZE.WIDTH,
                height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
            }}
            anchorAlignment={emojiPopoverAnchorOrigin}
        >
            <EmojiPickerMenu
                onEmojiSelected={selectEmoji}
                ref={emojiSearchInput}
            />
        </PopoverWithMeasuredContent>
    );
}

export default EmojiPicker;
