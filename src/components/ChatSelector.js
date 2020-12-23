import _ from 'underscore';
import React from 'react';
import Str from 'expensify-common/lib/str';
import {View, SectionList, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ModalHeader from './ModalHeader';
import styles from '../styles/styles';
import SubHeader from './SubHeader';
import ChatLinkRow from '../pages/home/sidebar/ChatLinkRow';
import KeyboardSpacer from './KeyboardSpacer';
import ONYXKEYS from '../ONYXKEYS';
import {getDefaultAvatar} from '../libs/actions/PersonalDetails';
import {filterChatSearchOptions, getChatSearchState} from '../libs/SearchUtils';
import ChatSearchInput from '../components/ChatSearchInput';
import CONST from '../CONST';

const propTypes = {
    selectedOptions: PropTypes.array,
    canSelectMultipleOptions: PropTypes.bool,
    showContacts: PropTypes.bool,
    showRecents: PropTypes.bool,
    headerTitle: PropTypes.string.isRequired,
};

const defaultProps = {
    selectedOptions: [],
    canSelectMultipleOptions: false,
    showContacts: true,
    showRecents: false,
};

class ChatSelector extends React.Component {
    constructor(props) {
        super(props);

        this.updateOptions = this.updateOptions.bind(this);
        this.selectOption = this.selectOption.bind(this);

        const {contacts, recentUsers} = this.getInitialOptions();

        this.state = {
            contacts,
            recentUsers,
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

    getInitialOptions() {
        const personalDetails = this.props.showContacts ? this.props.personalDetails : {};
        const reports = this.props.showRecents ? this.props.reports : {};
        const selectedOptions = this.props.canSelectMultipleOptions ? this.props.selectedOptions : [];
        return getChatSearchState(personalDetails, reports, selectedOptions);
    }

    updateOptions(searchValue) {
        const {contacts, recentUsers} = this.getInitialOptions();
        let filteredContacts = filterChatSearchOptions(searchValue, contacts);
        let filteredRecentUsers = filterChatSearchOptions(searchValue, recentUsers);
        const totalResultsLength = filteredContacts.length + filteredRecentUsers.length;
        let userToInvite = null;

        if (totalResultsLength === 0 && Str.isValidEmail(searchValue) || Str.isValidPhone(searchValue)) {
            // Check to see if the search value is a valid email or phone
            userToInvite = {
                type: CONST.REPORT.SINGLE_USER_DM,
                login: searchValue,
                text: searchValue,
                alternateText: searchValue,
                icon: getDefaultAvatar(searchValue),
            };
        }

        this.setState({
            searchValue,
            contacts: filteredContacts,
            recentUsers: filteredRecentUsers,
            userToInvite,
        });
    }

    selectOption(option) {
        this.props.onSelectOption(option);
    }

    render() {
        const hasSelectableOptions = (this.state.recentUsers.length + this.state.contacts.length) > 0;
        const sections = [
            {
                title: undefined,
                data: this.props.selectedOptions,
                indexOffset: 0,
                shouldShow: true,
            },
        ];

        if (this.props.showRecents) {
            sections.push({
                title: 'RECENTS',
                data: this.state.recentUsers,
                indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
                shouldShow: hasSelectableOptions,
            });
        }

        if (this.props.showContacts) {
            sections.push(            {
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

        const totalLengthOfData =
            this.props.selectedOptions.length +
            this.state.recentUsers.length +
            this.state.contacts.length;

        return (
            <View style={styles.flex1}>
                <ModalHeader title={this.props.headerTitle} />
                <View style={styles.p2}>
                    <ChatSearchInput
                        ref={el => this.textInput = el}
                        onChange={this.updateOptions}
                        value={this.state.searchValue}
                        placeholder="Name, email or phone number"
                        onEnterPress={() => {
                            const allOptions = this.props.selectedOptions
                                .concat(this.state.recentUsers, this.state.contacts);
                            this.selectOption(allOptions[this.state.focusedIndex]);
                        }}
                        onArrowDownPress={() => {
                            let newFocusedIndex = this.state.focusedIndex + 1;

                            // Wrap around to the top of the list
                            if (newFocusedIndex > totalLengthOfData - 1) {
                                newFocusedIndex = 0;
                            }

                            this.setState({focusedIndex: newFocusedIndex});
                        }}
                        onArrowUpPress={() => {
                            let newFocusedIndex = this.state.focusedIndex - 1;

                            // Wrap around to the bottom of the list
                            if (newFocusedIndex < 0) {
                                newFocusedIndex = totalLengthOfData - 1;
                            }

                            this.setState({focusedIndex: newFocusedIndex});
                        }}
                        onEscapePress={() => {
                            const {contacts, recentUsers} = this.getInitialOptions();
                            this.setState({
                                searchValue: '',
                                contacts,
                                recentUsers,
                                focusedIndex: 0,
                            });
                        }}
                    />
                </View>

                {/* From ChatSwitcherList */}
                <View style={[styles.flex1]}>
                    {!hasSelectableOptions && (
                        <View style={[styles.ph2]}>
                            <Text style={[styles.textLabel]}>
                                Don't see who you're looking for? Type their email or phone number to invite them to chat.
                            </Text>
                        </View>
                    )}
                    <SectionList
                        contentContainerStyle={styles.flex1}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                        sections={sections}
                        keyExtractor={option => option.keyForList}
                        renderItem={({item, index, section}) => (
                            <ChatLinkRow
                                option={item}
                                optionIsFocused={this.state.focusedIndex === (index + section.indexOffset)}
                                onSelectRow={this.selectOption}
                                isChatSwitcher={false}
                                isSelected={_.find(this.props.selectedOptions, (option) => option.login === item.login)}
                                showSelectedState={this.props.canSelectMultipleOptions}
                            />
                        )}
                        renderSectionHeader={({section: {title, shouldShow}}) => {
                            if (title && shouldShow) {
                                return <SubHeader text={title} />;
                            }

                            return <View style={styles.mt1}/>;
                        }}
                        extraData={this.state.focusedIndex}
                        ListFooterComponent={View}
                        ListFooterComponentStyle={[styles.p1]}
                    />
                    <KeyboardSpacer />
                </View>
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
