import React from 'react';
import PropTypes from 'prop-types';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import styles from '../../../styles/StyleSheet';
import ChatSwitcherOptionPropTypes from './ChatSwitcherOptionPropTypes';

const propTypes = {
    // Option to allow the user to choose from can be type 'report' or 'user'
    option: ChatSwitcherOptionPropTypes.isRequired,

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool.isRequired,

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelectRow: PropTypes.func.isRequired,

    // Callback that adds a user to the pending list of Group DM users
    onAddToGroup: PropTypes.func,
};

const defaultProps = {
    onAddToGroup: ()=>{},
};

const ChatSwitcherRow = ({
    option,
    optionIsFocused,
    onSelectRow,
    onAddToGroup,
}) => {
    const isUserRow = option.type === 'user';
    const textStyle = optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    return (
        <View
            style={[
                styles.flexRow,
                styles.alignItemsCenter,
                styles.flexJustifySpaceBetween,
                styles.sidebarLink,
                styles.sidebarLinkInner,
                optionIsFocused ? styles.sidebarLinkActive : null
            ]}
        >
            <TouchableOpacity
                onPress={() => onSelectRow(option)}
                style={[
                    styles.flexGrow1,
                    styles.chatSwitcherItemAvatarNameWrapper,
                ]}
            >
                <View
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                    ]}
                >
                    {
                        option.icon
                        && (
                            <View style={[styles.chatSwitcherAvatar, styles.mr2]}>
                                <Image
                                    source={{uri: option.icon}}
                                    style={[styles.chatSwitcherAvatarImage]}
                                />
                            </View>
                        )
                    }
                    <View style={[styles.flex1]}>
                        {option.text === option.alternateText ? (
                            <Text style={[textStyle]} numberOfLines={1}>
                                {option.alternateText}
                            </Text>
                        ) : (
                            <>
                                <Text style={[textStyle]} numberOfLines={1}>
                                    {option.text}
                                </Text>
                                <Text style={[textStyle, styles.textMicro]} numberOfLines={1}>
                                    {option.alternateText}
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
            {isUserRow && (
                <View>
                    <TouchableOpacity
                        style={[styles.chatSwitcherItemButton]}
                        onPress={() => onAddToGroup(option)}
                    >
                        <Text
                            style={[styles.chatSwitcherItemButtonText]}
                            numberOfLines={1}
                        >
                            Add
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

ChatSwitcherRow.propTypes = propTypes;
ChatSwitcherRow.displayName = 'ChatSwitcherRow';

export default ChatSwitcherRow;
