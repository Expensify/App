import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

import ReportActionContextMenuItem from './ReportActionContextMenuItem';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';

const propTypes = {
    // Controls the visibility of this component.
    isVisible: PropTypes.bool,
};

const defaultProps = {
    isVisible: false,
};

const EmojiPickerMenu = (props) => {


    return props.isVisible && (
        <View style={[
            styles.flexRow,
            {backgroundColor: themeColors.componentBG},
            styles.flexWrap,
            styles.flex1,
            {width: 150},
            {height: 200},
        ]}
        >
            <Text>
                Smileys & People
            </Text>
            {emojis['Smileys & People'].map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
            <Text>
                Animals & Nature
            </Text>
            {emojis['Animals & Nature'].map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
            <Text>
                Travel & Places
            </Text>
            {emojis['Travel & Places'].map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
            <Text>
                Activities
            </Text>
            {emojis.Activities.map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
            <Text>
                Objects
            </Text>
            {emojis.Objects.map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
            <Text>
                Symbols
            </Text>
            {emojis.Symbols.map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
            <Text>
                Flags
            </Text>
            {emojis.Flags.map(emoji => (
                <EmojiPickerMenuItem
                    iconCode={emoji.code}
                />
            ))}
        </View>
    );
};

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

export default EmojiPickerMenu;
