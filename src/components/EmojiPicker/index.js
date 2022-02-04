import React from 'react';
import {Dimensions} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '../../libs/compose';
import Popover from '../Popover';
import ONYXKEYS from '../../ONYXKEYS';
import EmojiPickerMenu from './EmojiPickerMenu';
import * as User from '../../libs/actions/User';
import * as EmojiUtils from '../../libs/EmojiUtils';
import CONST from '../../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

class EmojiPicker extends React.Component {
    constructor(props) {
        super(props);

        this.hideEmojiPicker = this.hideEmojiPicker.bind(this);
        this.showEmojiPicker = this.showEmojiPicker.bind(this);
        this.selectEmoji = this.selectEmoji.bind(this);
        this.measureEmojiPopoverAnchorPosition = this.measureEmojiPopoverAnchorPosition.bind(this);
        this.setPreferredSkinTone = this.setPreferredSkinTone.bind(this);
        this.focusEmojiSearchInput = this.focusEmojiSearchInput.bind(this);
        this.onModalHide = () => {};
        this.onEmojiSelected = () => {};

        this.state = {
            isEmojiPickerVisible: false,

            // The horizontal and vertical position (relative to the window) where the emoji popover will display.
            emojiPopoverAnchorPosition: {
                horizontal: 0,
                vertical: 0,
            },
        };
    }

    componentDidMount() {
        this.emojiPopoverDimensionListener = Dimensions.addEventListener('change', this.measureEmojiPopoverAnchorPosition);
    }

    componentWillUnmount() {
        if (!this.emojiPopoverDimensionListener) {
            return;
        }
        this.emojiPopoverDimensionListener.remove();
    }

    /**
     * Update preferredSkinTone and sync with Onyx, NVP.
     * @param {Number|String} skinTone
     */
    setPreferredSkinTone(skinTone) {
        if (skinTone === this.props.preferredSkinTone) {
            return;
        }

        User.setPreferredSkinTone(skinTone);
    }

    /**
     * Callback for the emoji picker to add whatever emoji is chosen into the main input
     *
     * @param {String} emoji
     * @param {Object} emojiObject
     */
    selectEmoji(emoji, emojiObject) {
        EmojiUtils.addToFrequentlyUsedEmojis(this.props.frequentlyUsedEmojis, emojiObject);
        this.hideEmojiPicker();
        if (_.isFunction(this.onEmojiSelected)) {
            this.onEmojiSelected(emoji);
        }
    }

    hideEmojiPicker() {
        this.setState({isEmojiPickerVisible: false});
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Function} [onModalHide=() => {}] - Run a callback when Modal hides.
     * @param {Function} [onEmojiSelected=() => {}] - Run a callback when Emoji selected.
     * @param {Function} [onBeforeShowEmojiPicker=() => {}] - Run a callback before showing EmojiPicker
     * @param {Element} emojiPopoverAnchor - Element to which Popover is anchored
     */
    showEmojiPicker(onModalHide, onEmojiSelected, onBeforeShowEmojiPicker, emojiPopoverAnchor) {
        if (_.isFunction(onBeforeShowEmojiPicker)) {
            onBeforeShowEmojiPicker();
        }

        this.onModalHide = onModalHide;
        this.onEmojiSelected = onEmojiSelected;
        this.emojiPopoverAnchor = emojiPopoverAnchor;

        this.setState({isEmojiPickerVisible: true});
        this.measureEmojiPopoverAnchorPosition();
    }

    measureEmojiPopoverAnchorPosition() {
        if (!this.emojiPopoverAnchor) {
            return;
        }

        this.emojiPopoverAnchor.measureInWindow((x, y, width) => this.setState({
            emojiPopoverAnchorPosition: {horizontal: x + width, vertical: y},
        }));
    }

    /**
     * Focus the search input in the emoji picker.
     */
    focusEmojiSearchInput() {
        if (!this.emojiSearchInput) {
            return;
        }
        this.emojiSearchInput.focus();
    }

    render() {
        return (
            <>
                {

                    // There is no way to disable animations and they are really laggy, because there are so many
                    // emojis. The best alternative is to set it to 1ms so it just "pops" in and out
                }
                <Popover
                    isVisible={this.state.isEmojiPickerVisible}
                    onClose={this.hideEmojiPicker}
                    onModalShow={this.focusEmojiSearchInput}
                    onModalHide={this.onModalHide}
                    hideModalContentWhileAnimating
                    animationInTiming={1}
                    animationOutTiming={1}
                    anchorPosition={{
                        bottom: this.props.windowHeight - this.state.emojiPopoverAnchorPosition.vertical,
                        left: this.state.emojiPopoverAnchorPosition.horizontal - CONST.EMOJI_PICKER_SIZE,
                    }}
                >
                    <EmojiPickerMenu
                        onEmojiSelected={this.selectEmoji}
                        ref={el => this.emojiSearchInput = el}
                        preferredSkinTone={this.props.preferredSkinTone}
                        updatePreferredSkinTone={this.setPreferredSkinTone}
                        frequentlyUsedEmojis={this.props.frequentlyUsedEmojis}
                    />
                </Popover>
            </>
        );
    }
}

EmojiPicker.propTypes = propTypes;

export default compose(
    withWindowDimensions,
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        frequentlyUsedEmojis: {
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
        },
    }),
)(EmojiPicker);
