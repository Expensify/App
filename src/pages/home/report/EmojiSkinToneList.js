import React, {Component} from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import {skinTones} from '../../../../assets/emojis';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';
import getSkinToneEmojiFromIndex from './EmojiPickerMenu/getSkinToneEmojiFromIndex';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';


const propTypes = {

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,

    /** Function to sync the selected skin tone with parent, onyx and nvp */
    updatePreferredSkinTone: PropTypes.func.isRequired,

    /** Props related to translation */
    ...withLocalizePropTypes,
};

class EmojiSkinToneList extends Component {
    constructor(props) {
        super(props);

        this.updateSelectedSkinTone = this.updateSelectedSkinTone.bind(this);

        this.state = {
            highlightedIndex: -1,
            isSkinToneListVisible: false,
        };
    }

    componentDidMount() {
        // Get the selected skinToneEmoji based on the index
        const selectedEmoji = getSkinToneEmojiFromIndex(this.props.preferredSkinTone);
        this.setState({highlightedIndex: selectedEmoji.skinTone});
    }

    /**
     * Pass the skinTone to props and hide the picker
     * @param {object} skinToneEmoji
     */
    updateSelectedSkinTone(skinToneEmoji) {
        this.setState(prev => ({isSkinToneListVisible: !prev.isSkinToneListVisible}));
        this.props.updatePreferredSkinTone(skinToneEmoji.skinTone);
    }

    render() {
        const selectedEmoji = getSkinToneEmojiFromIndex(this.props.preferredSkinTone);
        return (
            <View style={[styles.flexRow, styles.p1, styles.ph3]}>
                {
                    !this.state.isSkinToneListVisible && (
                        <Pressable
                            onPress={
                                () => this.setState(prev => ({isSkinToneListVisible: !prev.isSkinToneListVisible}))
                            }
                            style={[
                                styles.pv1,
                                styles.flex1,
                                styles.flexRow,
                                styles.alignSelfCenter,
                                styles.justifyContentStart,
                                styles.alignItemsCenter,
                            ]}
                        >
                            <Text style={[styles.emojiText, styles.ph1]}>
                                {selectedEmoji.code}
                            </Text>
                            <Text style={[styles.emojiSkinToneTitle]}>
                                {this.props.translate('emojiPicker.skinTonePickerLabel')}
                            </Text>
                        </Pressable>
                    )
                }
                {
                    this.state.isSkinToneListVisible && (
                        <View>
                            <View style={[styles.flexRow]}>
                                {
                                    skinTones.map(skinToneEmoji => (
                                        <EmojiPickerMenuItem
                                            onPress={() => this.updateSelectedSkinTone(skinToneEmoji)}
                                            onHover={() => this.setState({highlightedIndex: skinToneEmoji.skinTone})}
                                            key={skinToneEmoji.code}
                                            emojiItemStyle={styles.emojiSkinToneItem}
                                            emoji={skinToneEmoji.code}
                                            isHighlighted={skinToneEmoji.skinTone === this.state.highlightedIndex}
                                        />
                                    ))
                                }
                            </View>
                        </View>
                    )
                }
            </View>
        );
    }
}

EmojiSkinToneList.propTypes = propTypes;

export default compose(
    withLocalize,
)(EmojiSkinToneList);
