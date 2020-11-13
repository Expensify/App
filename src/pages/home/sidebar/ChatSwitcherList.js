import React from 'react';
import PropTypes from 'prop-types';
import {View, FlatList} from 'react-native';
import styles from '../../../styles/StyleSheet';
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
    <View style={[styles.flex1]}>
        <FlatList
            showsVerticalScrollIndicator={false}
            data={options}
            keyExtractor={option => (option.type === 'user' ? option.alternateText : String(option.reportID))}
            renderItem={({item, index}) => (
                <ChatLinkRow
                    option={item}
                    optionIsFocused={index === focusedIndex}
                    onSelectRow={onSelectRow}
                    onAddToGroup={onAddToGroup}
                    isChatSwitcher="true"
                />
            )}
            extraData={focusedIndex}
            ListFooterComponent={View}
            ListFooterComponentStyle={[styles.p1]}
        />
        <KeyboardSpacer />
    </View>
);

ChatSwitcherList.propTypes = propTypes;
ChatSwitcherList.defaultProps = defaultProps;
ChatSwitcherList.displayName = 'ChatSwitcherList';

export default ChatSwitcherList;
