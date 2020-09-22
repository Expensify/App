import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import styles from '../../../style/StyleSheet';

const propTypes = {
    // The index of the option that is currently in focus
    focusedIndex: PropTypes.number.isRequired,

    // An array of options to allow the user to choose from
    options: PropTypes.arrayOf(PropTypes.shape({
        // The login of a person (either email or phone number)
        login: PropTypes.string.isRequired,

        // The URL of the person's avatar
        avatarURL: PropTypes.string.isRequired,

        // This is either the user's full name, or their login if full name is an empty string
        displayName: PropTypes.string.isRequired,
    })),

    // A function that is called when an option is selected. Selected option is passed as a param
    onSelect: PropTypes.func.isRequired,
};
const defaultProps = {
    options: [],
};

const ChatSwitcherList = ({focusedIndex, options, onSelect}) => (
    <View style={[styles.chatSwitcherItemList]}>
        {options.length > 0 && _.map(options, (option, i) => {
            const optionIsFocused = i === focusedIndex;
            const textStyle = optionIsFocused
                ? styles.sidebarLinkActiveText
                : styles.sidebarLinkText;
            return (
                <TouchableOpacity
                    key={option.login}
                    onPress={() => onSelect(option)}
                >
                    <View
                        style={[
                            styles.flexRow,
                            styles.mb2,
                            styles.alignItemsCenter,
                            styles.chatSwitcherItem,
                            optionIsFocused ? styles.chatSwitcherItemFocused : null
                        ]}
                    >
                        <View style={[styles.chatSwitcherAvatar, styles.mr2]}>
                            <Image
                                source={{uri: option.avatarURL}}
                                style={[styles.chatSwitcherAvatarImage]}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            {option.displayName === option.login ? (
                                <Text style={[textStyle, styles.h3]} numberOfLines={1}>
                                    {option.login}
                                </Text>
                            ) : (
                                <>
                                    <Text style={[textStyle, styles.h3]} numberOfLines={1}>
                                        {option.displayName}
                                    </Text>
                                    <Text style={[textStyle, styles.textMicro]} numberOfLines={1}>
                                        {option.login}
                                    </Text>
                                </>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        })}
    </View>
);

ChatSwitcherList.propTypes = propTypes;
ChatSwitcherList.defaultProps = defaultProps;
ChatSwitcherList.displayName = 'ChatSwitcherList';

export default ChatSwitcherList;
