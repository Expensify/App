import React from 'react';
import Str from 'expensify-common/lib/str';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import TextInputWithFocusStyles from './TextInputWithFocusStyles';
import {getDefaultAvatar} from '../libs/actions/PersonalDetails';
import {getChatListOptions} from '../libs/ChatSearchUtils';
import ChatSectionList from './ChatSectionList';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    selectedOptions: PropTypes.arrayOf(PropTypes.string),
    canSelectMultipleOptions: PropTypes.bool,
    showContacts: PropTypes.bool,
    showRecentChats: PropTypes.bool,
    placeholderText: PropTypes.string,
    hideSectionHeaders: PropTypes.bool,
    includeGroupChats: PropTypes.bool,
    canInviteUsers: PropTypes.bool,
    numberOfRecentChatsToShow: PropTypes.number,
    onSelectOption: PropTypes.func,
    onFocus: PropTypes.func,
    onBackspacePress: PropTypes.func,
};

const defaultProps = {
    selectedOptions: [],
    canSelectMultipleOptions: false,
    showContacts: false,
    showRecentChats: false,
    numberOfRecentChatsToShow: 5,
    placeholderText: 'Name, email or phone number',
    hideSectionHeaders: false,
    includeGroupChats: false,
    canInviteUsers: false,
    onSelectOption: () => {},
    onFocus: () => {},
    onBackspacePress: () => {},
};

class ChatSelector extends React.Component {
    constructor(props) {
        super(props);

        this.updateOptions = this.updateOptions.bind(this);
        this.selectOption = this.selectOption.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

        const {contacts, recentChats} = this.getChatListOptions();

        this.state = {
            contacts,
            recentChats,
            focusedIndex: 0,
            searchValue: '',
            userToInvite: null,
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedOptions.length !== this.props.selectedOptions.length) {
            this.updateOptions(this.state.searchValue);
        }
    }

    getChatListOptions(searchValue = '') {
        const selectedOptions = this.props.canSelectMultipleOptions ? this.props.selectedOptions : [];
        return getChatListOptions(
            this.props.personalDetails,
            this.props.reports,
            {},
            {
                searchValue,
                includeContacts: this.props.showContacts,
                includeRecentChats: this.props.showRecentChats,
                includeGroupChats: this.props.includeGroupChats,
                numberOfRecentChatsToShow: this.props.numberOfRecentChatsToShow,
                selectedOptions,
            }
        );
    }

    updateOptions(searchValue) {
        const {contacts, recentChats} = this.getChatListOptions(searchValue);
        const totalResultsLength = contacts.length + recentChats.length;
        let userToInvite = null;

        if (
            this.props.canInviteUsers
            && totalResultsLength === 0
            && (Str.isValidEmail(searchValue) || Str.isValidPhone(searchValue))
        ) {
            // Check to see if the search value is a valid email or phone
            userToInvite = {
                login: searchValue,
                text: searchValue,
                alternateText: searchValue,
                icon: getDefaultAvatar(searchValue),
            };
        }

        this.setState({
            searchValue,
            contacts,
            recentChats,
            userToInvite,
        });
    }

    selectOption(option) {
        this.props.onSelectOption(option);
    }

    /**
     * Delegate key presses to specific callbacks
     *
     * @param {SyntheticEvent} e
     */
    handleKeyPress(e) {
        const totalLengthOfData = this.props.selectedOptions.length
            + this.state.recentChats.length
            + this.state.contacts.length;

        switch (e.nativeEvent.key) {
            case 'Enter': {
                const allOptions = this.props.selectedOptions
                    .concat(this.state.recentChats, this.state.contacts);
                this.selectOption(allOptions[this.state.focusedIndex]);
                e.preventDefault();
                break;
            }

            case 'Backspace': {
                this.props.onBackspacePress();
                break;
            }

            case 'ArrowDown': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex + 1;

                    // Wrap around to the top of the list
                    if (newFocusedIndex > totalLengthOfData - 1) {
                        newFocusedIndex = 0;
                    }

                    return {focusedIndex: newFocusedIndex};
                });


                e.preventDefault();
                break;
            }

            case 'ArrowUp': {
                this.setState((prevState) => {
                    let newFocusedIndex = prevState.focusedIndex - 1;

                    // Wrap around to the bottom of the list
                    if (newFocusedIndex < 0) {
                        newFocusedIndex = totalLengthOfData - 1;
                    }

                    return {focusedIndex: newFocusedIndex};
                });
                e.preventDefault();
                break;
            }

            case 'Tab':
            case 'Escape': {
                const {contacts, recentChats} = this.getChatListOptions('');
                this.setState({
                    searchValue: '',
                    contacts,
                    recentChats,
                    focusedIndex: 0,
                });
                break;
            }

            default:
                this.props.onFocus(e);
        }
    }

    render() {
        const hasSelectableOptions = (this.state.recentChats.length + this.state.contacts.length) > 0;
        const sections = [
            {
                title: undefined,
                data: this.props.selectedOptions,
                indexOffset: 0,
                shouldShow: true,
            },
        ];

        if (this.props.showRecentChats) {
            sections.push({
                title: 'RECENTS',
                data: this.state.recentChats,
                indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
                shouldShow: hasSelectableOptions,
            });
        }

        if (this.props.showContacts) {
            sections.push({
                title: 'CONTACTS',
                data: this.state.contacts,
                indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
                shouldShow: hasSelectableOptions,
            });
        }

        if (this.state.userToInvite) {
            sections.push({
                title: undefined,
                data: [this.state.userToInvite],
                indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
                shouldShow: !hasSelectableOptions,
            });
        }

        return (
            <View style={styles.flex1}>
                <View style={styles.p2}>
                    <TextInputWithFocusStyles
                        styleFocusIn={[styles.textInputReversedFocus]}
                        ref={el => this.textInput = el}
                        style={[styles.textInput, styles.flex1]}
                        value={this.state.searchValue}
                        onChangeText={this.updateOptions}
                        onKeyPress={this.handleKeyPress}
                        placeholder={this.props.placeholderText}
                        placeholderTextColor={themeColors.textSupporting}
                    />
                </View>
                <ChatSectionList
                    sections={sections}
                    onSelectRow={this.selectOption}
                    headerMessage={
                        (!hasSelectableOptions && this.props.canInviteUsers)
                            // eslint-disable-next-line max-len
                            ? 'Don\'t see who you\'re looking for? Type their email or phone number to invite them to chat.'
                            : ''
                    }
                    focusedIndex={this.state.focusedIndex}
                    selectedOptions={this.props.selectedOptions}
                    canSelectMultipleOptions={this.props.canSelectMultipleOptions}
                    hideSectionHeaders={this.props.hideSectionHeaders}
                />
            </View>
        );
    }
}

ChatSelector.propTypes = propTypes;
ChatSelector.defaultProps = defaultProps;

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(ChatSelector);
