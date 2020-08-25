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
import iconX from '../../../../assets/images/icon-x.png';
import logoCircle from '../../../../assets/images/expensify-logo-round.png';

const propTypes = {
    // A method that is triggered when the TextInput gets focus
    onFocus: PropTypes.func.isRequired,

    // A method that is triggered when the TextInput loses focus
    onBlur: PropTypes.func.isRequired,

    /* Ion Props */

    // All of the personal details for everyone
    // The keys of this object are the logins of the users, and the values are an object
    // with their details
    personalDetails: PropTypes.objectOf(PropTypes.shape({
        // The login of the person (either email or phone number)
        login: PropTypes.string.isRequired,

        // The URL of the person's avatar (there should already be a default avatarURL if
        // the person doesn't have their own avatar uploaded yet)
        avatarURL: PropTypes.string.isRequired,

        // The first name of the person
        firstName: PropTypes.string,

        // The last name of the person
        lastName: PropTypes.string,

        // The combination of `${firstName} ${lastName}` (could be an empty string)
        fullName: PropTypes.string,

        // This is either the user's full name, or their login if full name is an empty string
        displayName: PropTypes.string.isRequired,

        // Either the user's full name and their login, or just the login if the full name is empty
        // `${fullName} (${login})`
        displayNameWithEmail: PropTypes.string.isRequired,
    })),
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
        this.triggerOnBlurCallback = this.triggerOnBlurCallback.bind(this);
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
     *
     * @param {boolean} blurAfterReset
     */
    reset(blurAfterReset = true) {
        this.setState({
            search: '',
            options: [],
            focusedIndex: 0,
        }, () => {
            if (blurAfterReset) {
                this.textInput.blur();
                this.props.onBlur();
                this.enableKeyboardShortcut();
            }
        });
    }

    /**
     * Trigger the on blur callback from the props if there is no search value present
     */
    triggerOnBlurCallback() {
        if (this.state.search === '') {
            return;
        }
        this.reset();
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
        if (value === '') {
            this.reset(false);
            return;
        }

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
        const searchOptions = _.values(this.props.personalDetails);

        for (let i = 0; i < matchRegexes.length; i++) {
            if (matches.size < this.maxSearchResults) {
                for (let j = 0; j < searchOptions.length; j++) {
                    const option = searchOptions[j];
                    const valueToSearch = option.displayNameWithEmail.replace(new RegExp(/&nbsp;/g), '');
                    const isMatch = matchRegexes[i].test(valueToSearch);

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
                <View style={[styles.flexRow, styles.mb4]}>
                    {this.state.search === '' && (
                        <View style={[styles.mr2, styles.ml2]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.sidebarHeaderLogo]}
                                source={logoCircle}
                            />
                        </View>
                    )}

                    <TextInput
                        ref={el => this.textInput = el}
                        style={[styles.textInput, styles.textInputReversed, styles.flex1, styles.mr2]}
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

                    {this.state.search !== '' && (
                        <TouchableOpacity
                            style={[styles.chatSwitcherInputClear]}
                            onPress={this.reset}
                            underlayColor={colors.componentBG}
                        >
                            <Image
                                resizeMode="contain"
                                style={[styles.chatSwitcherInputClearIcon]}
                                source={iconX}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.chatSwitcherItemList]}>
                    {this.state.options.length > 0 && _.map(this.state.options, (option, i) => {
                        const textStyle = i === this.state.focusedIndex
                            ? styles.sidebarLinkActiveText
                            : styles.sidebarLinkText;
                        return (
                            <TouchableOpacity
                                key={option.login}
                                onPress={() => this.selectOption(option)}
                            >
                                <View
                                    style={[
                                        styles.flexRow,
                                        styles.mb2,
                                        styles.alignItemsCenter,
                                        styles.chatSwitcherItem,
                                        i === this.state.focusedIndex ? styles.chatSwitcherItemFocused : null
                                    ]}
                                >
                                    <Image
                                        source={{uri: option.avatarURL}}
                                        style={[styles.chatSwitcherAvatarImage, styles.mr2]}
                                    />
                                    <View>
                                        {option.fullName === '' ? (
                                            <Text style={[textStyle, styles.h3]} numberOfLines={1}>
                                                {option.login}
                                            </Text>
                                        ) : (
                                            <>
                                                <Text style={[textStyle, styles.h3]} numberOfLines={1}>
                                                    {option.fullName}
                                                </Text>
                                                <Text style={[textStyle, styles.textMicro]} numberOfLines={1}>
                                                    {option.login}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
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
