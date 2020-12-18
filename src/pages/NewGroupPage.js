import React from 'react';
import Str from 'expensify-common/lib/str';
import {View, SectionList, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ModalHeader from '../components/ModalHeader';
import styles from '../styles/styles';
import SubHeader from '../components/SubHeader';
import ChatLinkRow from './home/sidebar/ChatLinkRow';
import KeyboardSpacer from '../components/KeyboardSpacer';
import ONYXKEYS from '../ONYXKEYS';
import {getDefaultAvatar} from '../libs/actions/PersonalDetails';
import {filterChatSearchOptions, getRecentContactList, getContactList} from '../libs/SearchUtils';
import ChatSearchInput from '../components/ChatSearchInput';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import CONST from '../CONST';

class NewGroupPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateOptions = this.updateOptions.bind(this);
        this.selectOption = this.selectOption.bind(this);

        const recentUsers = getRecentContactList(props.reports);
        const contacts = getContactList(props.personalDetails);

        this.state = {
            contacts,
            recentUsers,
            selectedUsers: [],
            focusedIndex: 0,
            searchValue: '',
            isSearchValuePotentialUser: false,
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    updateOptions(searchValue) {
        const contactList = getContactList(this.props.personalDetails);
        let contacts = filterChatSearchOptions(searchValue, contactList);
        let isSearchValuePotentialUser = false;

        if (contacts.length === 0 && Str.isValidEmail(searchValue) || Str.isValidPhone(searchValue)) {
            // Check to see if the search value is a valid email or phone
            contacts = [{
                type: CONST.REPORT.SINGLE_USER_DM,
                login: this.state.searchValue,
                text: this.state.searchValue,
                alternateText: this.state.searchValue,
                icon: getDefaultAvatar(this.state.searchValue),
            }];

            isSearchValuePotentialUser = true;
        }

        this.setState({
            searchValue,
            contacts,
            isSearchValuePotentialUser,
        });
    }

    selectOption(option) {
        return;
        const {email} = this.props.session;
        fetchOrCreateChatReport([email, option.login]);
    }

    render() {
        const sections = [
            {
                title: undefined,
                data: this.state.selectedUsers,
                indexOffset: 0,
            },
            {
                title: 'RECENTS',
                data: this.state.recentUsers,
                indexOffset: this.state.selectedUsers.length,
            },
            {
                title: 'CONTACTS',
                data: this.state.contacts,
                indexOffset: this.state.selectedUsers.length + this.state.recentUsers.length,
            },
        ];

        const totalLengthOfData =
            this.state.selectedUsers.length +
            this.state.recentUsers.length +
            this.state.contacts.length;

        return (
            <View style={styles.flex1}>
                <ModalHeader title="New Group" />
                <View style={styles.p2}>
                    <ChatSearchInput
                        ref={el => this.textInput = el}
                        onChange={this.updateOptions}
                        value={this.state.searchValue}
                        placeholder="Name, email or phone number"
                        onEnterPress={() => {
                            // this.selectOption(this.state.contacts[this.state.focusedIndex]);
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
                            this.setState({
                                searchValue: '',
                                selectedUsers: [],
                                contacts: getContactList(this.props.personalDetails),
                                recentUsers: getRecentContactList(props.reports),
                                focusedIndex: 0,
                            });
                        }}
                    />
                </View>

                {/* From ChatSwitcherList */}
                <View style={[styles.flex1]}>
                    {this.state.contacts.length === 0 && (
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
                            />
                        )}
                        renderSectionHeader={({section: {title}}) => title && <SubHeader text={title} />}
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

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(NewGroupPage);
