import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashOrderby from 'lodash.orderby';
import lodashGet from 'lodash.get';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../../ONYXKEYS';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import ChatSwitcherList from './ChatSwitcherList';
import ChatSwitcherSearchForm from './ChatSwitcherSearchForm';
import {fetchOrCreateChatReport} from '../../../libs/actions/Report';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/StyleSheet';
import * as ChatSwitcher from '../../../libs/actions/ChatSwitcher';

const OPTION_TYPE = {
    USER: 'user',
    REPORT: 'report',
};

const MAX_GROUP_DM_LENGTH = 8;

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
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    /* Onyx Props */

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

    isSidebarAnimating: PropTypes.bool,
    isChatSwitcherActive: PropTypes.bool,
};
const defaultProps = {
    personalDetails: {},
    reports: {},
    session: null,
    isSidebarAnimating: false,
    isChatSwitcherActive: false,
};

class ChatSwitcherView extends React.Component {
    constructor(props) {
        super(props);

        this.maxSearchResults = 10;

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.reset = this.reset.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.selectReport = this.selectReport.bind(this);
        this.getChatReportsOptions = this.getChatReportsOptions.bind(this);
        this.triggerOnFocusCallback = this.triggerOnFocusCallback.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
        this.selectRow = this.selectRow.bind(this);
        this.addUserToGroup = this.addUserToGroup.bind(this);
        this.removeUserFromGroup = this.removeUserFromGroup.bind(this);
        this.startGroupChat = this.startGroupChat.bind(this);
        this.state = {
            search: '',
            options: [],
            focusedIndex: 0,
            isLogoVisible: true,
            isClearButtonVisible: false,
            groupUsers: [],
        };
    }

    componentDidMount() {
        // Listen for the Command+K key being pressed so the focus can be given to the chat switcher
        KeyboardShortcut.subscribe('K', () => {
            ChatSwitcher.show();
            this.textInput.focus();
        }, ['meta'], true);
    }

    componentDidUpdate(prevProps) {
        // Check if the sidebar was animating but is no longer animating and
        // if the chat switcher is active then focus the input
        if (prevProps.isSidebarAnimating
                && !this.props.isSidebarAnimating
                && this.props.isChatSwitcherActive
        ) {
            this.textInput.focus();
        }
    }

    componentWillUnmount() {
        KeyboardShortcut.unsubscribe('K');
    }

    /**
     * Get the chat report options created from props.report. Additionally these chat report options will also determine
     * if its a 1:1 DM or not. If it is a 1:1 DM we'll save the DM participant login and the type as user.
     *
     * @param {Boolean} sortByLastVisited
     * @param {Boolean} excludeGroupDMs
     * @returns {Object}
     */
    getChatReportsOptions(sortByLastVisited = true, excludeGroupDMs = false) {
        const chatReports = sortByLastVisited
            ? lodashOrderby(this.props.reports, ['lastVisitedTimestamp'], ['desc'])
            : this.props.reports;

        return _.chain(chatReports)
            .values()
            .filter((report) => {
                if (_.isEmpty(report.reportName)) {
                    return false;
                }
                if (sortByLastVisited && !report.lastVisitedTimestamp) {
                    return false;
                }
                if (excludeGroupDMs) {
                    const participants = lodashGet(report, 'participants', []);
                    const isGroupDM = participants.length > 0;
                    return !isGroupDM;
                }
                return true;
            })
            .map((report) => {
                const participants = lodashGet(report, 'participants', []);
                const isSingleUserPrivateDMReport = participants.length === 1;
                const login = isSingleUserPrivateDMReport ? report.participants[0] : '';
                return {
                    text: report.reportName,
                    alternateText: report.reportName,
                    searchText: report.reportName === login ? login
                        : `${report.reportName} ${login}`,
                    reportID: report.reportID,
                    participants,
                    icon: report.icon,
                    login,
                    type: isSingleUserPrivateDMReport ? OPTION_TYPE.USER : OPTION_TYPE.REPORT,
                    isUnread: report.unreadActionCount > 0,
                };
            })
            .value();
    }

    /**
     * Fires the correct method for the option type selected.
     *
     * @param {Object} option
     */
    selectRow(option) {
        switch (option.type) {
            case OPTION_TYPE.USER:
                this.selectUser(option);
                break;
            case OPTION_TYPE.REPORT:
                this.selectReport(option);
                break;
            default:
        }
    }

    /**
     * Adds a user to the groupUsers array and
     * updates the options.
     *
     * @param {Object} option
     */
    addUserToGroup(option) {
        this.setState(prevState => ({
            groupUsers: [...prevState.groupUsers, option],
            search: '',
        }), () => {
            this.updateSearch('');
            this.textInput.clear();
            this.textInput.focus();
        });
    }

    /**
     * Removes a user from the groupUsers array and
     * updates the options.
     *
     * @param {Object} [optionToRemove] remove last when no option provided
     */
    removeUserFromGroup(optionToRemove) {
        const selectedOption = !optionToRemove
            ? _.last(this.state.groupUsers)
            : optionToRemove;

        this.setState(prevState => ({
            groupUsers: _.reduce(prevState.groupUsers, (users, option) => (
                option.login === selectedOption.login
                    ? users
                    : [...users, option]
            ), []),
        }), () => {
            this.updateSearch(this.state.search);
            this.textInput.focus();
        });
    }

    /**
     * Begins the group
     */
    startGroupChat() {
        const userLogins = _.map(this.state.groupUsers, option => option.login);
        fetchOrCreateChatReport([this.props.session.email, ...userLogins]);
        this.props.onLinkClick();
        this.reset();
    }

    /**
     * Fetch the chat report and then redirect to the new report
     *
     * @param {object} selectedOption
     * @param {string} selectedOption.login
     */
    selectUser(selectedOption) {
        // If there are group users saved start a group chat between
        // the user that was just selected and everyone in the list
        if (this.state.groupUsers.length > 0) {
            const userLogins = _.map(this.state.groupUsers, option => option.login);
            fetchOrCreateChatReport([this.props.session.email, ...userLogins, selectedOption.login]);
        } else {
            fetchOrCreateChatReport([this.props.session.email, selectedOption.login]);
        }

        this.props.onLinkClick();
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
        this.props.onLinkClick();
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
            options: this.getChatReportsOptions(),
            focusedIndex: 0,
            isLogoVisible: blurAfterReset,
            isClearButtonVisible: !blurAfterReset,
            groupUsers: [],
        }, () => {
            if (blurAfterReset) {
                this.textInput.blur();
                ChatSwitcher.hide();
            }
        });
    }

    /**
     * When the text input gets focus, the onFocus() callback needs to be called, the keyboard shortcut is disabled
     * and the logo is hidden
     */
    triggerOnFocusCallback() {
        ChatSwitcher.show();
        this.setState(prevState => ({
            isLogoVisible: false,
            isClearButtonVisible: true,
            options: prevState.search === '' ? this.getChatReportsOptions() : prevState.options,
        }));
    }

    /**
     * When arrow keys are pressed, the focused option needs to change
     * When enter key is pressed, the highlighted option is selected
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        let newFocusedIndex;

        switch (e.nativeEvent.key) {
            case 'Enter':
                // Pass the option to the selectRow method which
                // will fire the correct callback for the option type.
                this.selectRow(this.state.options[this.state.focusedIndex]);
                e.preventDefault();
                break;
            case 'Backspace':
                if (this.state.groupUsers.length > 0 && this.state.search === '') {
                    // Remove the last user
                    this.removeUserFromGroup();
                }
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
            if (this.state.groupUsers.length > 0) {
                // If we have groupLogins we only want to reset the options not
                // the entire state which would clear out the list of groupUsers
                this.setState({options: [], search: ''});
                return;
            }

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

        // If we have at least one group user then let's only get 1:1 DM chat options since we cannot add group
        // DMs at this point. We don't want to sort our chatReportOptions by lastVisited since we'll let the regex
        // matches order our options.
        const isGroupChat = this.state.groupUsers.length > 0;
        const chatReportOptions = this.getChatReportsOptions(false, isGroupChat);

        // Get a list of all users we can send messages to and make their details generic. We will also reject any
        // personalDetails logins that exist in chatReportOptions which will remove our dupes since we'll use
        // chatReportOptions as our first source of truth if the 1:1 chat DM exists there.
        const personalDetailOptions = _.chain(this.props.personalDetails)
            .values()
            .reject(personalDetail => _.findWhere(chatReportOptions, {login: personalDetail.login}))
            .map(personalDetail => ({
                text: personalDetail.displayName,
                alternateText: personalDetail.login,
                searchText: personalDetail.displayName === personalDetail.login ? personalDetail.login
                    : `${personalDetail.displayName} ${personalDetail.login}`,
                icon: personalDetail.avatarURL,
                login: personalDetail.login,
                type: OPTION_TYPE.USER,
            }))
            .value();

        const searchOptions = _.union(chatReportOptions, personalDetailOptions);

        for (let i = 0; i < matchRegexes.length; i++) {
            if (matches.size < this.maxSearchResults) {
                for (let j = 0; j < searchOptions.length; j++) {
                    const option = searchOptions[j];
                    const valueToSearch = option.searchText.replace(new RegExp(/&nbsp;/g), '');
                    const isMatch = matchRegexes[i].test(valueToSearch);

                    // We must also filter out any users who are already in the Group DM list
                    // so they can't be selected more than once
                    const isInGroupUsers = _.some(this.state.groupUsers, groupOption => (
                        groupOption.login === option.login
                    ));

                    // Make sure we don't include the same option twice (automatically handled by using a `Set`)
                    if (isMatch && !isInGroupUsers) {
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
                    onChangeText={this.updateSearch}
                    onClearButtonClick={() => this.reset()}
                    onFocus={this.triggerOnFocusCallback}
                    onKeyPress={this.handleKeyPress}
                    groupUsers={this.state.groupUsers}
                    onRemoveFromGroup={this.removeUserFromGroup}
                    onConfirmUsers={this.startGroupChat}
                />

                {this.state.groupUsers.length === MAX_GROUP_DM_LENGTH
                    ? (
                        <View style={[styles.chatSwitcherMessage]}>
                            <Text style={[styles.h4, styles.mb1, styles.colorReversed]}>
                                Maximum participants reached
                            </Text>
                            <Text style={[styles.textLabel, styles.colorMutedReversed]}>
                                {'You\'ve reached the maximum number of participants for a group chat.'}
                            </Text>
                        </View>
                    )
                    : (
                        <ChatSwitcherList
                            focusedIndex={this.state.focusedIndex}
                            options={this.state.options}
                            onSelectRow={this.selectRow}
                            onAddToGroup={this.addUserToGroup}
                        />
                    )}
            </>
        );
    }
}

ChatSwitcherView.propTypes = propTypes;
ChatSwitcherView.defaultProps = defaultProps;

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    isSidebarAnimating: {
        key: ONYXKEYS.IS_SIDEBAR_ANIMATING,
        initFromStoredValues: false,
    },
})(ChatSwitcherView);
