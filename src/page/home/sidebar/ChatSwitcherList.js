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
        // The full name of the user if available, otherwise the login (email/phone number) of the user
        text: PropTypes.string.isRequired,

        // The login of the user, or the name of the chat room
        alternateText: PropTypes.string.isRequired,

        // The URL of the person's avatar
        icon: PropTypes.string,

        // A flag that tells us whether our option is a user
        isUser: PropTypes.bool.isRequired,
    })),
};
const defaultProps = {
    options: [],
};

const ChatSwitcherList = ({focusedIndex, options, onRowSelected, onAddToGroupDM}) => (
    <View style={[styles.chatSwitcherItemList]}>
        {options.length > 0 && _.map(options, (option, i) => {
            const optionIsFocused = i === focusedIndex;
            const textStyle = optionIsFocused
                ? styles.sidebarLinkActiveText
                : styles.sidebarLinkText;
            return (
                <View
                    style={[
                        styles.flexRow,
                        styles.alignItemsCenter,
                        optionIsFocused ? styles.chatSwitcherItemFocused : null
                    ]}
                >
                    <TouchableOpacity
                        key={option.alternateText}
                        onPress={() => onRowSelected(option)}
                    >
                        <View
                            style={[
                                styles.flexRow,
                                styles.mb2,
                                styles.alignItemsCenter,
                                styles.chatSwitcherItem,
                                {width: 220},
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
                                    <Text style={[textStyle, styles.h3]} numberOfLines={1}>
                                        {option.alternateText}
                                    </Text>
                                ) : (
                                    <>
                                        <Text style={[textStyle, styles.h3]} numberOfLines={1}>
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
                    {true && (
                        <View>
                            <TouchableOpacity
                                style={[{
                                    backgroundColor: '#8a8a8a',
                                    alignItems: 'center',
                                    padding: 5,
                                    justifyContent: 'center',
                                    borderRadius: 5,
                                }]}
                                onPress={() => onAddToGroupDM(option)}
                            >
                                <Text style={[textStyle, styles.h3]} numberOfLines={1}>
                                    Add
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            );
        })}
    </View>
);

ChatSwitcherList.propTypes = propTypes;
ChatSwitcherList.defaultProps = defaultProps;
ChatSwitcherList.displayName = 'ChatSwitcherList';

export default ChatSwitcherList;
