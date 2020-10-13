import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import withIon from '../../../components/withIon';
import IONKEYS from '../../../IONKEYS';
import Str from '../../../libs/Str';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import ChatSwitcherList from './ChatSwitcherList';
import ChatSwitcherSearchForm from './ChatSwitcherSearchForm';
import {fetchOrCreateChatReport} from '../../../libs/actions/Report';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';

const personalDetailsPropTypes = PropTypes.shape({
    // The login of the person (either email or phone number)
    login: PropTypes.string.isRequired,

    // The URL of the person's avatar (there should already be a default avatarURL if
    // the person doesn't have their own avatar uploaded yet)
    avatarURL: PropTypes.string.isRequired,

    // This is either the user's full name, or their login if full name is an empty string
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    // A method that is triggered when the TextInput gets focus
    onFocus: PropTypes.func.isRequired,

    // A method that is triggered when the TextInput loses focus
    onBlur: PropTypes.func.isRequired,

    /* Ion Props */

    // All of the personal details for everyone
    // The keys of this object are the logins of the users, and the values are an object
    // with their details
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    // All reports that have been shared with the user
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }),

    // The personal details of the person who is currently logged in
    session: PropTypes.shape({
        // The email of the person who is currently logged in
        email: PropTypes.string.isRequired,
    }),
};
const defaultProps = {
    personalDetails: {},
    reports: {},
    session: null,
};

class ChatSwitcherView extends React.Component {
    constructor(props) {
        super(props);

        this.maxSearchResults = 10;

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.reset = this.reset.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.selectReport = this.selectReport.bind(this);
        this.triggerOnFocusCallback = this.triggerOnFocusCallback.bind(this);
        this.updateSearch = this.updateSearch.bind(this);

        this.state = {
            search: '',
            options: [],
            focusedIndex: 0,
            isLogoVisible: true,
            isClearButtonVisible: false,
        };
    }

    componentDidMount() {
        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            if (this.textInput) {
                this.props.onFocus();
                this.textInput.focus();
            }
        }, ['meta'], true);
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
    }

    /**
     * Fetch the chat report and then redirect to the new report
     *
     * @param {object} option
     * @param {string} option.login
     */
    selectUser(option) {
        fetchOrCreateChatReport([this.props.session.email, option.login]);
        this.reset();
    }

    /**
     * Fetch the chat report and then redirect to the new report
     *
     * @param {object} option
     * @param {string} option.reportID
     */
    selectReport(option) {
        redirect(ROUTES.getReportRoute(option.reportID));
        this.reset();
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
            isLogoVisible: blurAfterReset,
            isClearButtonVisible: !blurAfterReset,
        }, () => {
            if (blurAfterReset) {
                this.textInput.blur();
                this.props.onBlur();
            }
        });
    }

    /**
     * When the text input gets focus, the onFocus() callback needs to be called, the keyboard shortcut is disabled
     * and the logo is hidden
     */
    triggerOnFocusCallback() {
        this.props.onFocus();
        this.setState({
            isLogoVisible: false,
            isClearButtonVisible: true,
        });
    }

    /**
     * When arrow keys are pressed, the focused option needs to change
     * When enter key is pressed, the highlighted option is selected
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        let newFocusedIndex;
        let option;

        switch (e.key) {
            case 'Enter':
                // Call the selected option's callback and pass the option itself
                option = this.state.options[this.state.focusedIndex];
                option.callback(option);
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

        // Get a list of all users we can send messages to and make their details generic
        const personalDetailOptions = _.chain(this.props.personalDetails)
            .values()
            .map(personalDetail => ({
                text: personalDetail.displayName,
                alternateText: personalDetail.login,
                searchText: personalDetail.displayName === personalDetail.login ? personalDetail.login
                    : `${personalDetail.displayName} ${personalDetail.login}`,
                icon: personalDetail.avatarURL,
                login: personalDetail.login,
                callback: this.selectUser,
            }))
            .value();

        // Get a list of all reports we can send messages to
        // Filter the reports to only group chats
        // Make the report details generic
        const reportOptions = _.chain(this.props.reports)
            .values()
            .filter(report => report.reportNameValuePairs && report.reportNameValuePairs.type === 'expense')
            .map(report => ({
                text: report.reportName,
                alternateText: report.reportName,
                searchText: report.reportName,
                reportID: report.reportID,
                callback: this.selectReport,
            }))
            .value();

        const searchOptions = _.union(personalDetailOptions, reportOptions);

        for (let i = 0; i < matchRegexes.length; i++) {
            if (matches.size < this.maxSearchResults) {
                for (let j = 0; j < searchOptions.length; j++) {
                    const option = searchOptions[j];
                    const valueToSearch = option.searchText.replace(new RegExp(/&nbsp;/g), '');
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
                <ChatSwitcherSearchForm
                    ref={el => this.textInput = el}
                    isClearButtonVisible={this.state.isClearButtonVisible}
                    isLogoVisible={this.state.isLogoVisible}
                    searchValue={this.state.search}
                    onBlur={() => {
                        if (this.state.search === '') {
                            this.reset();
                        }
                    }}
                    onChangeText={this.updateSearch}
                    onClearButtonClick={this.reset}
                    onFocus={this.triggerOnFocusCallback}
                    onKeyPress={this.handleKeyPress}
                />

                <ChatSwitcherList
                    focusedIndex={this.state.focusedIndex}
                    options={this.state.options}
                />
            </>
        );
    }
}

ChatSwitcherView.propTypes = propTypes;
ChatSwitcherView.defaultProps = defaultProps;

export default withIon({
    personalDetails: {
        key: IONKEYS.PERSONAL_DETAILS,
    },
    reports: {
        key: IONKEYS.COLLECTION.REPORT
    },
    session: {
        key: IONKEYS.SESSION,
    },
})(ChatSwitcherView);
