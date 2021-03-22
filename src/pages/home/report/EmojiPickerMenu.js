import React, {Component} from 'react';
import {FlatList, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import emojis from '../../../../assets/emojis';
import EmojiPickerMenuItem from './EmojiPickerMenuItem';
import TextInputFocusable from '../../../components/TextInputFocusable';

const propTypes = {
    // Controls the visibility of this component.
    isVisible: PropTypes.bool,
    addEmojiToTextBox: PropTypes.func.isRequired,
};

const defaultProps = {
    isVisible: false,
};

class EmojiPickerMenu extends Component {
    constructor(props) {
        super(props);

        this.filterEmojis = this.filterEmojis.bind(this);
        const headerIndices = [];
        emojis.forEach((emoji, index) => {
            if (emoji.header) {
                headerIndices.push(index);
            }
        });
        this.state = {
            filteredEmojis: emojis,
            headerIndices,
        };
    }

    filterEmojis(searchTerm) {
        if (searchTerm === '') {
            this.setState({filteredEmojis: emojis});
            return;
        }
        const newFilteredEmojiList = [];
        emojis.forEach((emoji) => {
            if (!emoji.header) {
                emoji.keywords.forEach((keyword) => {
                    if (keyword.includes(searchTerm)) {
                        newFilteredEmojiList.push(emoji);
                    }
                });
            }
        });

        this.setState({filteredEmojis: newFilteredEmojiList});
    }

    renderItem({item}, addEmojiToTextBox) {
        if (item.header) {
            return (
                <Text style={{fontWeight: 'bold', flex: 1}}>
                    {item.code}
                </Text>
            );
        }

        return (
            <EmojiPickerMenuItem
                onPress={addEmojiToTextBox}
                emoji={item.code}
            />
        );
    }

    render() {
        return (
            this.props.isVisible && (
                <>
                    <TextInputFocusable
                        textAlignVertical="top"
                        placeholder="Search"
                        placeholderTextColor={themeColors.textSupporting}
                        onChangeText={this.filterEmojis}
                        style={[styles.textInputCompose, styles.flex4]}
                        onFocus={() => this.setIsFocused(true)}
                        onBlur={() => this.setIsFocused(false)}
                        defaultValue=""
                    />
                    <FlatList
                        data={this.state.filteredEmojis}
                        renderItem={item => this.renderItem(item, this.props.addEmojiToTextBox)}
                        keyExtractor={item => (`emoji_picker_${item.code}`)}
                        numColumns={8}
                        style={{height: 300}}
                        extraData={this.state.filteredEmojis}
                        stickyHeaderIndecies={this.state.headerIndices}
                    />
                </>
            ));
    }
}

EmojiPickerMenu.propTypes = propTypes;
EmojiPickerMenu.defaultProps = defaultProps;

export default EmojiPickerMenu;
