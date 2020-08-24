import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text, Image,
} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles, {colors} from '../../../style/StyleSheet';
import WithIon from '../../../components/WithIon';
import IONKEYS from '../../../IONKEYS';
import Str from '../../../lib/Str';
import KeyboardShortcut from '../../../lib/KeyboardShortcut';

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

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.reset = this.reset.bind(this);
        this.updateSearch = this.updateSearch.bind(this);

        this.state = {
            search: '',
            options: [],
            focusedIndex: 0,
        };
    }

    componentDidMount() {
        this.enableKeyboardShortcut();
    }

    componentWillUnmount() {
        this.disableKeyboardShortcut();
    }

    /**
     * Listen for the Command+K key being pressed so the focus can be given to the chat switcher
     */
    enableKeyboardShortcut() {
        // Command + K
        KeyboardShortcut.subscribe('K', () => {
            if (this.textInput) {
                this.textInput.focus();
            }
        }, ['meta'], true);
    }

    /**
     * Stop listening to the keyboard shortcut
     */
    disableKeyboardShortcut() {
        KeyboardShortcut.unsubscribe('K');
    }

    /**
     * Reset the component to it's default state and blur the input
     */
    reset() {
        this.setState({
            search: '',
            options: [],
            focusedIndex: 0,
        }, () => {
            this.textInput.blur();
            this.props.onBlur();
            this.enableKeyboardShortcut();
        });
    }

    /**
     * Trigger the on blur callback from the props if there is no search value present
     */
    triggerOnBlurCallback() {
        if (this.state.search === '') {
            return;
        }
        this.props.onBlur();
    }

    /**
     * Redirect to the chat that was selected
     *
     * @param {object} option
     * @param {string} option.value
     */
    selectOption(option) {
        console.log('selected option', option);
        // @TODO need to get the report ID for that person and then redirect to it
        this.reset();
    }

    /**
     * When arrow keys are pressed, the focused option needs to change
     * When enter key is pressed, the highlighted option is selected
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        let newFocusedIndex;

        switch (e.key) {
            case 'Enter':
                // Select the focused option
                this.selectOption(this.state.options[this.state.focusedIndex]);
                e.preventDefault();
                break;

            case 'ArrowDown':
                newFocusedIndex = this.state.focusedIndex + 1;

                // Wrap around to the top of the list
                if (newFocusedIndex > this.state.options.length - 1) {
                    newFocusedIndex = 0;
                }

                this.setState({focusedIndex: newFocusedIndex});
                e.preventDefault();
                break;

            case 'ArrowUp':
                newFocusedIndex = this.state.focusedIndex - 1;

                // Wrap around to the bottom of the list
                if (newFocusedIndex < 0) {
                    newFocusedIndex = this.state.options.length - 1;
                }

                this.setState({focusedIndex: newFocusedIndex});
                e.preventDefault();
                break;

            case 'Tab':
            case 'Escape':
                this.reset();
                break;

            default:
                break;
        }
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

        // Because we want to regexes above to be listed in a specific order, the for loop below will end up adding
        // duplicate options to the list (because one option can match multiple regex patterns).
        // A Set is used here so that duplicate values are automatically removed.
        const matches = new Set();
        const searchOptions = _.chain(this.props.personalDetails)
            .values()
            .map(p => ({
                text: p.displayName,
                value: p.login,
                valueToSearch: p.displayNameWithEmail.replace(new RegExp(/&nbsp;/g), ''),
                image: p.avatarURL,
            }))
            .value();

        for (let i = 0; i < matchRegexes.length; i++) {
            if (matches.size < this.maxSearchResults) {
                for (let j = 0; j < searchOptions.length; j++) {
                    const option = searchOptions[j];
                    const isMatch = matchRegexes[i].test(option.valueToSearch);

                    // Make sure we don't include the same option twice (automatically handled be using a `Set`)
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

        this.setState({
            options: Array.from(matches),
        });
    }

    render() {
        return (
            <>
                <View style={[styles.flexRow]}>
                    <TextInput
                        ref={el => this.textInput = el}
                        style={[styles.textInput, styles.textInputReversed, styles.flex1]}
                        value={this.state.search}
                        onBlur={this.triggerOnBlurCallback}
                        onChangeText={this.updateSearch}
                        onFocus={() => {
                            this.props.onFocus();
                            this.disableKeyboardShortcut();
                        }}
                        onKeyPress={this.handleKeyPress}
                        placeholder="Find or start a chat"
                        placeholderTextColor={colors.textSupporting}
                    />
                    <TouchableOpacity
                        style={[styles.chatItemSubmitButton, styles.buttonSuccess]}
                        onPress={this.reset}
                        underlayColor="#fff"
                    >
                        <Text>X</Text>
                    </TouchableOpacity>
                </View>

                {this.state.options.length > 0 && _.map(this.state.options, (option, i) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => this.selectOption(option)}
                    >
                        <View
                            style={[
                                styles.flexRow,
                                styles.mb2,
                                styles.p1,
                                i === this.state.focusedIndex ? styles.chatViewItemFocused : null
                            ]}
                        >
                            <Image
                                source={{uri: option.image}}
                                style={[styles.chatViewImage]}
                            />
                            <Text
                                style={[i === this.state.focusedIndex
                                    ? styles.sidebarLinkActiveText
                                    : styles.sidebarLinkText
                                ]}
                            >
                                {option.text}
                            </Text>
                        </View>
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
