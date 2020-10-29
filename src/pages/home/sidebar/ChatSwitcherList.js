import React from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import styles from '../../../styles/StyleSheet';
import ChatSwitcherOptionPropTypes from './ChatSwitcherOptionPropTypes';
import ChatSwitcherRow from './ChatSwitcherRow';

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
    <FlatList
        contentContainerStyle={[styles.chatSwitcherItemList]}
        data={options}
        keyExtractor={option => (option.type === 'user' ? option.alternateText : String(option.reportID))}
        renderItem={({item, index}) => (
            <ChatSwitcherRow
                option={item}
                optionIsFocused={index === focusedIndex}
                onSelectRow={onSelectRow}
                onAddToGroup={onAddToGroup}
            />
        )}
        extraData={focusedIndex}
    />
);

ChatSwitcherList.propTypes = propTypes;
ChatSwitcherList.defaultProps = defaultProps;
ChatSwitcherList.displayName = 'ChatSwitcherList';

export default ChatSwitcherList;
