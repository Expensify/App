import React from 'react';
import PropTypes from 'prop-types';
import {View, FlatList} from 'react-native';
import styles from '../../../styles/styles';
import ChatSwitcherOptionPropTypes from './ChatSwitcherOptionPropTypes';
import ChatLinkRow from './ChatLinkRow';
import KeyboardSpacer from '../../../components/KeyboardSpacer';

const propTypes = {
    // The index of the option that is currently in focus
    focusedIndex: PropTypes.number.isRequired,

    // An array of options to allow the user to choose from
    options: PropTypes.arrayOf(ChatSwitcherOptionPropTypes),

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelectRow: PropTypes.func.isRequired,

    // Callback that adds a user to the pending list of Group DM users
    onAddToGroup: PropTypes.func.isRequired,
};
const defaultProps = {
    options: [],
};

const ChatSwitcherList = ({
    focusedIndex,
    options,
    onSelectRow,
    onAddToGroup,
}) => (
    options.length > 0 && (
        <View style={[styles.flex1]}>
            <FlatList
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                data={options}
                keyExtractor={option => option.keyForList}
                renderItem={({item, index}) => (
                    <ChatLinkRow
                        option={item}
                        optionIsFocused={index === focusedIndex}
                        onSelectRow={onSelectRow}
                        onAddToGroup={onAddToGroup}
                        isChatSwitcher
                    />
                )}
                extraData={focusedIndex}
                ListFooterComponent={View}
                ListFooterComponentStyle={[styles.p3]}
            />
            <KeyboardSpacer />
        </View>
    )
);

ChatSwitcherList.propTypes = propTypes;
ChatSwitcherList.defaultProps = defaultProps;
ChatSwitcherList.displayName = 'ChatSwitcherList';

export default ChatSwitcherList;
