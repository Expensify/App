import React from 'react';
import Str from 'expensify-common/lib/str';
import {View, FlatList, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ModalHeader from '../components/ModalHeader';
import styles from '../styles/styles';
import SubHeader from '../components/SubHeader';
import ChatLinkRow from './home/sidebar/ChatLinkRow';
import KeyboardSpacer from '../components/KeyboardSpacer';
import ONYXKEYS from '../ONYXKEYS';
import {getDefaultAvatar} from '../libs/actions/PersonalDetails';
import {filterChatSearchOptions, getChatSearchState} from '../libs/SearchUtils';
import ChatSearchInput from '../components/ChatSearchInput';
import {fetchOrCreateChatReport} from '../libs/actions/Report';
import CONST from '../CONST';

class NewChatPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateOptions = this.updateOptions.bind(this);
        this.selectOption = this.selectOption.bind(this);

        const {contacts} = getChatSearchState(props.personalDetails);
        this.state = {
            options: contacts,
            focusedIndex: 0,
            searchValue: '',
            isSearchValuePotentialUser: false,
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    updateOptions(searchValue) {
        const {contacts} = getChatSearchState(props.personalDetails);
        let options = filterChatSearchOptions(searchValue, contacts);
        let isSearchValuePotentialUser = false;

        if (options.length === 0 && Str.isValidEmail(searchValue) || Str.isValidPhone(searchValue)) {
            // Check to see if the search value is a valid email or phone
            options = [{
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
            options,
            isSearchValuePotentialUser,
        });
    }

    selectOption(option) {
        const {email} = this.props.session;
        fetchOrCreateChatReport([email, option.login]);
    }

    render() {
        return (
            <View style={styles.flex1}>
                <ModalHeader title="New Chat" />
                <View style={styles.p2}>
                    <ChatSearchInput
                        ref={el => this.textInput = el}
                        onChange={this.updateOptions}
                        value={this.state.searchValue}
                        placeholder="Name, email or phone number"
                        onEnterPress={() => {
                            this.selectOption(this.state.options[this.state.focusedIndex]);
                        }}
                        onArrowDownPress={() => {
                            let newFocusedIndex = this.state.focusedIndex + 1;

                            // Wrap around to the top of the list
                            if (newFocusedIndex > this.state.options.length - 1) {
                                newFocusedIndex = 0;
                            }

                            this.setState({focusedIndex: newFocusedIndex});
                        }}
                        onArrowUpPress={() => {
                            let newFocusedIndex = this.state.focusedIndex - 1;

                            // Wrap around to the bottom of the list
                            if (newFocusedIndex < 0) {
                                newFocusedIndex = this.state.options.length - 1;
                            }

                            this.setState({focusedIndex: newFocusedIndex});
                        }}
                        onEscapePress={() => {
                            const {contacts} = getChatSearchState(this.props.personalDetails);
                            this.setState({
                                searchValue: '',
                                options: contacts,
                                focusedIndex: 0,
                            });
                        }}
                    />
                </View>

                {!this.state.isSearchValuePotentialUser && this.state.options.length > 0 && (
                    <SubHeader text="CONTACTS" />
                )}

                {/* From ChatSwitcherList */}
                <View style={[styles.flex1]}>
                    {this.state.options.length === 0 && (
                        <View style={[styles.ph2]}>
                            <Text style={[styles.textLabel]}>
                                Don't see who you're looking for? Type their email or phone number to invite them to chat.
                            </Text>
                        </View>
                    )}
                    <FlatList
                        contentContainerStyle={styles.flex1}
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                        data={this.state.options}
                        keyExtractor={option => option.keyForList}
                        renderItem={({item, index}) => (
                            <ChatLinkRow
                                option={item}
                                optionIsFocused={index === this.state.focusedIndex}
                                onSelectRow={this.selectOption}
                                isChatSwitcher={false}
                            />
                        )}
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
})(NewChatPage);
