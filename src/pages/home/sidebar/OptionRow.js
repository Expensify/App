import _ from 'underscore';
import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import styles from '../../../styles/styles';
import optionPropTypes from './optionPropTypes';
import Icon from '../../../components/Icon';
import {Pencil, PinCircle} from '../../../components/Icon/Expensicons';
import MultipleAvatars from '../../../components/MultipleAvatars';

const propTypes = {
    // Option to allow the user to choose from can be type 'report' or 'user'
    option: optionPropTypes.isRequired,

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool.isRequired,

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelectRow: PropTypes.func.isRequired,

    // Callback that adds a user to the pending list of Group DM users
    onAddToGroup: PropTypes.func,

    // A flag to indicate whether this comes from the Chat Switcher so we can display the group button
    isChatSwitcher: PropTypes.bool,

    // Whether we should show the selected state
    showSelectedState: PropTypes.bool,

    // Whether this item is selected
    isSelected: PropTypes.bool,
};

const defaultProps = {
    onAddToGroup: () => {},
    isChatSwitcher: false,
    showSelectedState: false,
    isSelected: false,
};

const OptionRow = ({
    option,
    optionIsFocused,
    onSelectRow,
    onAddToGroup,
    isChatSwitcher,
    showSelectedState,
    isSelected,
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
                styles.justifyContentBetween,
                styles.sidebarLink,
                styles.sidebarLinkInner,
                optionIsFocused ? styles.sidebarLinkActive : null,
            ]}
        >
            <TouchableOpacity
                onPress={() => onSelectRow(option)}
                activeOpacity={0.8}
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
                        !_.isEmpty(option.icons)
                        && (
                            <MultipleAvatars
                                avatarImageURLs={option.icons}
                                optionIsFocused={optionIsFocused}
                            />
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
                                    style={[textStyle, styles.chatSwitcherLogin, styles.mt1]}
                                    numberOfLines={1}
                                >
                                    {option.alternateText}
                                </Text>
                            </>
                        )}
                    </View>
                    {showSelectedState && (
                        <View
                            style={[styles.selectCircle]}
                        >
                            {isSelected && (
                                <Text>X</Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            {option.singleUserDM && isChatSwitcher && (
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
            <View style={styles.flexRow}>
                {option.hasDraftComment && (
                    <View style={styles.ml2}>
                        <Icon src={Pencil} />
                    </View>
                )}
                {option.isPinned && (
                    <View style={styles.ml2}>
                        <Icon src={PinCircle} />
                    </View>
                )}
            </View>
        </View>
    );
};

OptionRow.propTypes = propTypes;
OptionRow.defaultProps = defaultProps;
OptionRow.displayName = 'OptionRow';

// It it very important to use React.memo here so SectionList items will not unnecessarily re-render
export default memo(OptionRow);
