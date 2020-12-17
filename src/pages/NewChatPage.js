import React from 'react';
import {View, FlatList} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ModalHeader from '../components/ModalHeader';
import styles from '../styles/styles';
import SubHeader from '../components/SubHeader';
import ChatLinkRow from './home/sidebar/ChatLinkRow';
import KeyboardSpacer from '../components/KeyboardSpacer';
import ONYXKEYS from '../ONYXKEYS';
import {getContactList} from '../libs/actions/PersonalDetails';
import {filterChatSearchOptions} from '../libs/SearchUtils';
import ChatSearchInput from '../components/ChatSearchInput';
import {fetchOrCreateChatReport} from '../libs/actions/Report';

class NewChatPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateOptions = this.updateOptions.bind(this);
        this.selectOption = this.selectOption.bind(this);

        this.state = {
            options: getContactList(props.personalDetails),
            focusedIndex: 0,
            searchValue: '',
        };
    }

    componentDidMount() {
        this.textInput.focus();
    }

    updateOptions(searchValue) {
        const contactList = getContactList(this.props.personalDetails);
        this.setState({
            searchValue,
            options: filterChatSearchOptions(searchValue, contactList)
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
                            this.setState({
                                searchValue: '',
                                options: getContactList(this.props.personalDetails),
                                focusedIndex: 0,
                            });
                        }}
                    />
                </View>
                <SubHeader text="CONTACTS" />

                {/* From ChatSwitcherList */}
                <View style={[styles.flex1]}>
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
