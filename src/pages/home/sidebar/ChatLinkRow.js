import _ from 'underscore';
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
import ROUTES from '../../../ROUTES';
import PressableLink from '../../../components/PressableLink';

const propTypes = {
    // Option to allow the user to choose from can be type 'report' or 'user'
    option: ChatSwitcherOptionPropTypes.isRequired,

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool.isRequired,

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelectRow: PropTypes.func.isRequired,

    // Callback that adds a user to the pending list of Group DM users
    onAddToGroup: PropTypes.func,

    // A flag to indicate whether this comes from the Chat Switcher so we can display the group button
    isChatSwitcher: PropTypes.bool,
};

const defaultProps = {
    onAddToGroup: () => {},
    isChatSwitcher: false,
};

const ChatLinkRow = ({
    option,
    optionIsFocused,
    onSelectRow,
    onAddToGroup,
    isChatSwitcher,
}) => {
    const isUserRow = option.type === 'user';
    const textStyle = optionIsFocused
        ? styles.sidebarLinkActiveText
        : styles.sidebarLinkText;
    const textUnreadStyle = option.isUnread
        ? [textStyle, styles.sidebarLinkTextUnread] : [textStyle];
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
            <PressableLink
                onClick={() => onSelectRow(option)}
                to={ROUTES.getReportRoute(option.reportID)}
                style={styles.textDecorationNoLine}
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
                            !_.isEmpty(option.icon)
                            && (
                                <View style={[styles.chatSwitcherAvatar, styles.mr2]}>
                                    <Image
                                        source={{uri: option.icon}}
                                        style={[styles.chatSwitcherAvatarImage]}
                                    />
                                </View>
                            )
                        }
                        <View style={styles.chatSwitcherUserText}>
                            {option.text === option.alternateText ? (
                                <Text style={textUnreadStyle} numberOfLines={1}>
                                    {option.alternateText}
                                </Text>
                            ) : (
                                <>
                                    <Text style={textUnreadStyle} numberOfLines={1}>
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
            </PressableLink>
            {isUserRow && isChatSwitcher && (
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

ChatLinkRow.propTypes = propTypes;
ChatLinkRow.defaultProps = defaultProps;
ChatLinkRow.displayName = 'ChatLinkRow';

export default ChatLinkRow;
