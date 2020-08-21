import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
} from 'react-native';
import styles from '../../../style/StyleSheet';

class ChatSwitcherView extends React.Component {
    constructor(props) {
        super(props);

        this.clearSearch = this.clearSearch.bind(this);
        this.updateSearch = this.updateSearch.bind(this);

        this.state = {
            search: '',
        };
    }

    /**
     * Clear out the search in the state when the clear button is clicked
     */
    clearSearch() {
        this.setState({search: ''});
    }

    /**
     * Every time the text changes in the TextInput, update the search value in the state
     *
     * @param {string} text
     */
    updateSearch(text) {
        this.setState({search: text});
    }

    render() {
        return (
            <View style={[styles.flexRow]}>
                <TextInput
                    style={[styles.textInput, styles.textInputReversed, styles.flex1]}
                    value={this.state.search}
                    onChangeText={this.updateSearch}
                />
                <TouchableOpacity
                    style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                    onPress={this.clearSearch}
                    underlayColor="#fff"
                >
                    <Text>X</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

export default ChatSwitcherView;
