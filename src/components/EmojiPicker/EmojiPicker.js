import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {Dimensions, Keyboard} from 'react-native';
import _ from 'underscore';
import EmojiPickerMenu from './EmojiPickerMenu';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import PopoverWithMeasuredContent from '../PopoverWithMeasuredContent';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withViewportOffsetTop, {viewportOffsetTopPropTypes} from '../withViewportOffsetTop';
import compose from '../../libs/compose';
import * as StyleUtils from '../../styles/StyleUtils';
import calculateAnchorPosition from '../../libs/calculateAnchorPosition';

const DEFAULT_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

const propTypes = {
    ...windowDimensionsPropTypes,
    ...viewportOffsetTopPropTypes,
};

const EmojiPicker = forwardRef((props, ref) => {
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [emojiPopoverAnchorPosition, setEmojiPopoverAnchorPosition] = useState({
        horizontal: 0,
        vertical: 0,
    });
    const [reportAction, setReportAction] = useState({});
    const emojiPopoverAnchorOrigin = useRef(DEFAULT_ANCHOR_ORIGIN);
    const emojiPopoverAnchor = useRef(null);
    const onModalHide = useRef(() => {});
    const onEmojiSelected = useRef(() => {});
    const emojiSearchInput = useRef();

    useEffect(() => {
        if (isEmojiPickerVisible) {
            Keyboard.dismiss();
        }

        const emojiPopoverDimensionListener = Dimensions.addEventListener('change', () => {
            calculateAnchorPosition(emojiPopoverAnchor.current).then((value) => {
                setEmojiPopoverAnchorPosition(value);
            });
        });
        return () => {
            emojiPopoverDimensionListener.remove();
        };
    }, [isEmojiPickerVisible]);

    /**
     * Show the emoji picker menu.
     *
     * @param {Function} [onModalHideValue=() => {}] - Run a callback when Modal hides.
     * @param {Function} [onEmojiSelectedValue=() => {}] - Run a callback when Emoji selected.
     * @param {Element} emojiPopoverAnchorValue - Element to which Popover is anchored
     * @param {Object} [anchorOrigin=DEFAULT_ANCHOR_ORIGIN] - Anchor origin for Popover
     * @param {Function} [onWillShow=() => {}] - Run a callback when Popover will show
     * @param {Object} reportActionValue - ReportAction for EmojiPicker
     */
    const showEmojiPicker = (onModalHideValue, onEmojiSelectedValue, emojiPopoverAnchorValue, anchorOrigin, onWillShow = () => {}, reportActionValue) => {
        onModalHide.current = onModalHideValue;
        onEmojiSelected.current = onEmojiSelectedValue;
        emojiPopoverAnchor.current = emojiPopoverAnchorValue;

        if (emojiPopoverAnchor.current) {
            // Drop focus to avoid blue focus ring.
            emojiPopoverAnchor.current.blur();
        }

        calculateAnchorPosition(emojiPopoverAnchor.current).then((value) => {
            onWillShow();
            setIsEmojiPickerVisible(true);
            setEmojiPopoverAnchorPosition(value);
            emojiPopoverAnchorOrigin.current = anchorOrigin || DEFAULT_ANCHOR_ORIGIN;
            setReportAction(reportActionValue);
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
        // and in that function the emojiPopoverAnchor ref to will be set to null (synchronously)
        // thus we rely on that prop to prevent fast click / multiple emoji selection
        if (!emojiPopoverAnchor.current) {
            return;
        }

        hideEmojiPicker(false);
        if (_.isFunction(onEmojiSelected.current)) {
            onEmojiSelected.current(emoji, emojiObject);
        }
    };

    /**
     * Whether Context Menu is active for the Report Action.
     *
     * @param {Number|String} actionID
     * @return {Boolean}
     */
    const isActiveReportAction = (actionID) => Boolean(actionID) && reportAction.reportActionID === actionID;

    useImperativeHandle(ref, () => ({showEmojiPicker, isActiveReportAction, hideEmojiPicker, isEmojiPickerVisible}));

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
            popoverDimensions={{
                width: CONST.EMOJI_PICKER_SIZE.WIDTH,
                height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
            }}
            anchorAlignment={emojiPopoverAnchorOrigin.current}
            outerStyle={StyleUtils.getOuterModalStyle(props.windowHeight, props.viewportOffsetTop)}
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
export default compose(withViewportOffsetTop, withWindowDimensions)(EmojiPicker);
