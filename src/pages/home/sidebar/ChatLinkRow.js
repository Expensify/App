import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Image,
    Text,
    View,
    StyleSheet,
} from 'react-native';
import styles from '../../../styles/styles';
import ChatSwitcherOptionPropTypes from './ChatSwitcherOptionPropTypes';
import pencilIcon from '../../../../assets/images/icon-pencil.png';
import PressableLink from '../../../components/PressableLink';

const propTypes = {
    // Option to allow the user to choose from can be type 'report' or 'user'
    option: ChatSwitcherOptionPropTypes.isRequired,

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool.isRequired,

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelectRow: PropTypes.func.isRequired,

    // Denotes whether this row has been selected (for use in multiple selection mode)
    isSelected: PropTypes.bool,

    // Whether we should include the selected state for the row or not
    showSelectedState: PropTypes.bool,
};

const defaultProps = {
    isSelected: false,
    showSelectedState: false,
};

const ChatLinkRow = ({
    option,
    optionIsFocused,
    onSelectRow,
    isSelected,
    showSelectedState,
}) => {
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
                style={StyleSheet.flatten([
                    styles.chatLinkRowPressable,
                    styles.flexGrow1,
                    styles.chatSwitcherItemAvatarNameWrapper,
                ])}
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
                            <View style={[styles.chatSwitcherAvatar, styles.mr3]}>
                                <Image
                                    source={{uri: option.icon}}
                                    style={[styles.chatSwitcherAvatarImage]}
                                />
                            </View>
                        )
                    }
                    <View style={[styles.flex1]}>
                        {(option.text === option.alternateText || option.alternateText.length === 0) ? (
                            <Text style={[styles.chatSwitcherDisplayName, textUnreadStyle]} numberOfLines={1}>
                                {option.text}
                            </Text>
                        ) : (
                            <>
                                <Text style={[styles.chatSwitcherDisplayName, textUnreadStyle]} numberOfLines={1}>
                                    {option.text}
                                </Text>
                                <Text
                                    style={[textStyle, styles.textMicro, styles.chatSwitcherLogin]}
                                    numberOfLines={1}
                                >
                                    {option.alternateText}
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </PressableLink>
            {showSelectedState && isSelected && (
                <Text>Selected</Text>
            )}
            {showSelectedState && !isSelected && (
                <Text>Not Selected</Text>
            )}
            {option.hasDraftComment && (
                <Image
                    style={[styles.LHNPencilIcon]}
                    resizeMode="contain"
                    source={pencilIcon}
                />
            )}
        </View>
    );
};

ChatLinkRow.propTypes = propTypes;
ChatLinkRow.defaultProps = defaultProps;
ChatLinkRow.displayName = 'ChatLinkRow';

export default ChatLinkRow;
