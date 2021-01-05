import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, Text, View} from 'react-native';
import styles from '../styles/styles';

const propTypes = {
    // Array of avatar URL
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool,
};

const defaultProps = {
    avatarImageURLs: [],
    optionIsFocused: false,
};

const MultipleAvatars = props => (
    <>
        {props.avatarImageURLs !== undefined && (
            <>
                <View
                    style={[
                        props.avatarImageURLs.length > 1
                            ? [styles.singleAvatar, styles.singleLeftAvatar]
                            : [styles.avatarNormal, styles.emptyAvatar],
                    ]}
                >
                    <Image
                        source={{uri: props.avatarImageURLs[0]}}
                        style={
                            props.avatarImageURLs.length > 1
                                ? styles.singleAvatar
                                : styles.avatarNormal
                        }
                    />
                </View>
                {props.avatarImageURLs.length > 1 && (
                    <View
                        style={[
                            styles.singleAvatar,
                            props.avatarImageURLs.length > 1 ? styles.singleRightAvatar : null,
                            props.optionIsFocused ? styles.focusedAvatar : styles.avatar,
                        ]}
                    >
                        {props.avatarImageURLs.length > 2 && (
                            <View
                                style={[
                                    styles.avatarText,
                                    styles.avatarSpace,
                                ]}
                            >
                                <Text style={styles.avatarInnerText}>
                                    {props.avatarImageURLs.length - 1}
                                </Text>
                            </View>
                        )}
                        {props.avatarImageURLs.length === 2 && (
                            <Image
                                source={{uri: props.avatarImageURLs[1]}}
                                style={[
                                    styles.singleAvatar,
                                    styles.avatarSpace,
                                ]}
                            />
                        )}
                    </View>
                )}
            </>
        )}
    </>
);

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
export default memo(MultipleAvatars);
