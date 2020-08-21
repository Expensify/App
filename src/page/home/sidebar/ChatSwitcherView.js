import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
} from 'react-native';
import PropTypes from 'prop-types';
import styles, {colors} from '../../../style/StyleSheet';
import WithIon from '../../../components/WithIon';
import IONKEYS from '../../../IONKEYS';

const propTypes = {
    // A method that is triggered when the TextInput gets focus
    onFocus: PropTypes.func.isRequired,

    // A method that is triggered when the TextInput loses focus
    onBlur: PropTypes.func.isRequired,

    /* Ion Props */

    // All of the personal details for everyone
    // Eslint is disabled here because personalDetails is an object where they keys are email addresses
    // so it can't be documented in proptypes
    // eslint-disable-next-line react/forbid-prop-types
    personalDetails: PropTypes.object,
};
const defaultProps = {
    personalDetails: {},
};

class ChatSwitcherView extends React.Component {
    constructor(props) {
        super(props);

        this.updateSearch = this.updateSearch.bind(this);

        this.state = {
            search: '',
        };
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
        console.log(this.props.personalDetails);
        return (
            <View style={[styles.flexRow]}>
                <TextInput
                    style={[styles.textInput, styles.textInputReversed, styles.flex1]}
                    value={this.state.search}
                    onBlur={this.props.onBlur}
                    onChangeText={this.updateSearch}
                    onFocus={this.props.onFocus}
                    placeholder="Find or start a chat"
                    placeholderTextColor={colors.textSupporting}
                />
                <TouchableOpacity
                    style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                    onPress={() => this.setState({search: ''})}
                    underlayColor="#fff"
                >
                    <Text>X</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

ChatSwitcherView.propTypes = propTypes;
ChatSwitcherView.defaultProps = defaultProps;

export default WithIon({
    personalDetails: {
        key: `^${IONKEYS.PERSONAL_DETAILS}$`,
    },
})(ChatSwitcherView);
