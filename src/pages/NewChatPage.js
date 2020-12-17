import React from 'react';
import {View, FlatList} from 'react-native';
import ModalHeader from '../components/ModalHeader';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import TextInputWithFocusStyles from '../components/TextInputWithFocusStyles';
import SubHeader from '../components/SubHeader';
import ChatLinkRow from './home/sidebar/ChatLinkRow';
import KeyboardSpacer from '../components/KeyboardSpacer';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import {getContactList} from '../libs/actions/PersonalDetails';
import {filterChatSearchOptions} from '../libs/SearchUtils';

class NewChatPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateOptions = this.updateOptions.bind(this);
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
        const options = filterChatSearchOptions(searchValue, this.state.options);
        this.setState({searchValue, options});
    }

    render() {
        return (
            <View style={styles.flex1}>
                <ModalHeader title="New Chat" />
                <View style={styles.p2}>
                    <TextInputWithFocusStyles
                        styleFocusIn={[styles.textInputReversedFocus]}
                        ref={el => this.textInput = el}
                        style={[styles.textInput, styles.flex1]}
                        value={this.state.searchValue}
                        onChangeText={this.updateOptions}
                        // onFocus={this.props.onFocus}
                        // onKeyPress={this.props.onKeyPress}
                        placeholder="Name, email or phone number"
                        placeholderTextColor={themeColors.textSupporting}
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
                                onSelectRow={() => {}}
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
})(NewChatPage);
