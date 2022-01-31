import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Dimensions} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import Popover from '../Popover';
import Tooltip from '../Tooltip';
import Icon from '../Icon';
import ONYXKEYS from '../../ONYXKEYS';
import EmojiPickerMenu from './EmojiPickerMenu';
import * as StyleUtils from '../../styles/StyleUtils';
import * as Expensicons from '../Icon/Expensicons';
import * as User from '../../libs/actions/User';
import * as EmojiUtils from '../../libs/EmojiUtils';
import getButtonState from '../../libs/getButtonState';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    /** Callback on emoji popover hide */
    onModalHide: PropTypes.func,

    /** Callback on before showing emoji picker */
    onBeforeShowEmojiPicker: PropTypes.func,

    /** Callback on emoji selection */
    onEmojiSelected: PropTypes.func.isRequired,
    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    onModalHide: () => {},
    onBeforeShowEmojiPicker: () => {},
};

class EmojiPicker extends React.Component {
    constructor(props) {
        super(props);

        this.emojiPopoverAnchor = null;
        this.emojiPopoverDimensionListener = null;
        this.hideEmojiPicker = this.hideEmojiPicker.bind(this);
        this.showEmojiPicker = this.showEmojiPicker.bind(this);
        this.selectEmoji = this.selectEmoji.bind(this);
        this.measureEmojiPopoverAnchorPosition = this.measureEmojiPopoverAnchorPosition.bind(this);
        this.setPreferredSkinTone = this.setPreferredSkinTone.bind(this);
        this.focusEmojiSearchInput = this.focusEmojiSearchInput.bind(this);

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
        this.props.onEmojiSelected(emoji);
    }

    hideEmojiPicker() {
        this.setState({isEmojiPickerVisible: false});
    }

    showEmojiPicker() {
        if (this.props.onBeforeShowEmojiPicker) {
            this.props.onBeforeShowEmojiPicker();
        }
        this.setState({isEmojiPickerVisible: true});
    }

    /**
     * This gets called onLayout to find the cooridnates of the Anchor for the Emoji Picker.
     */
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
                    onModalHide={this.props.onModalHide}
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
                <Pressable
                    style={({hovered, pressed}) => ([
                        styles.chatItemEmojiButton,
                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
                    ])}
                    ref={el => this.emojiPopoverAnchor = el}
                    onLayout={this.measureEmojiPopoverAnchorPosition}
                    onPress={this.showEmojiPicker}
                    disabled={this.props.isDisabled}
                >
                    {({hovered, pressed}) => (
                        <Tooltip text={this.props.translate('reportActionCompose.emoji')}>
                            <Icon
                                src={Expensicons.Emoji}
                                fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                            />
                        </Tooltip>
                    )}
                </Pressable>
            </>
        );
    }
}

EmojiPicker.propTypes = propTypes;
EmojiPicker.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        frequentlyUsedEmojis: {
            key: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
        },
    }),
)(EmojiPicker);
