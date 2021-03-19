import React from 'react';
import {FlatList, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';

const propTypes = {
    // Controls the visibility of this component.
    isVisible: PropTypes.bool,
    addEmojiToTextBox: PropTypes.func.isRequired,
};

const defaultProps = {
    isVisible: false,
};

const EmojiPickerMenu = props => (
    props.isVisible && (
        <FlatList
            data={emojis['Smileys & People']}
            renderItem={item => (
                <EmojiPickerMenuItem
                    onPress={props.addEmojiToTextBox}
                    emoji={item.item.code}
                />
            )}
            keyExtractor={item => (`emoji_picker_${item.keywords[0]}`)}
            numColumns={8}
            style={{height: 300}}
        />
    )
);

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

export default EmojiPickerMenu;
