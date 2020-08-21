import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles, {colors} from '../../../style/StyleSheet';
import WithIon from '../../../components/WithIon';
import IONKEYS from '../../../IONKEYS';
import Str from '../../../lib/Str';

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

        this.maxSearchResults = 10;

        this.updateSearch = this.updateSearch.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.state = {
            search: '',
            options: [],
        };
    }

    /**
     * Every time the text changes in the TextInput, update the search value in the state
     *
     * @param {string} value
     */
    updateSearch(value) {
        this.setState({search: value});

        // Search our full list of options. We want:
        // 1) Exact matches first
        // 2) beginning-of-string matches second
        // 3) middle-of-string matches last
        const matchRegexes = [
            new RegExp(`^${Str.escapeForRegExp(value)}$`, 'i'),
            new RegExp(`^${Str.escapeForRegExp(value)}`, 'i'),
            new RegExp(Str.escapeForRegExp(value), 'i'),
        ];

        // Use a Set so that duplicate values are automatically removed
        let matches = new Set();
        const searchOptions = _.chain(this.props.personalDetails)
            .values()
            .map(p => ({
                text: p.displayName,
                value: p.login,
                valueToSearch: p.displayNameWithEmail.replace(new RegExp(/&nbsp;/g), ''),
            }))
            .value();

        for (let i = 0; i < matchRegexes.length; i++) {
            if (matches.size < this.maxSearchResults) {
                for (let j = 0; j < searchOptions.length; j++) {
                    const option = searchOptions[j];
                    const isMatch = matchRegexes[i].test(option.valueToSearch);

                    // Don't include the disabled options that match the regex unless we specified we want them to show.
                    // If we want them to show then add them whether they match the regex or not.
                    // Make sure we don't include the same option twice
                    if (isMatch) {
                        matches.add(option);
                    }

                    if (matches.size === this.maxSearchResults) {
                        break;
                    }
                }
            } else {
                break;
            }
        }

        matches = Array.from(matches);

        const options = _(matches).map(option => ({
            focused: false,
            ...option
        }));

        this.setState({
            options,
        });
    }

    render() {
        return (
            <>
                <View style={[styles.flexRow]}>
                    <TextInput
                        style={[styles.textInput, styles.textInputReversed, styles.flex1]}
                        value={this.state.search}
                        onBlur={this.props.onBlur}
                        onChangeText={this.updateSearch}
                        onFocus={this.props.onFocus}
                        onKeyDown={this.handleKeyDown}
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

                {this.state.options.length > 0 && _.map(this.state.options, option => (
                    <TouchableOpacity key={option.value}>
                        <Text>
                            {option.focused && '> '}
                            {option.text}
                        </Text>
                    </TouchableOpacity>
                ))}
            </>
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
