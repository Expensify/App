/* eslint-disable rulesdir/onyx-props-must-have-default */
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

const propTypes = {
    /** Emoji status */
    emojiStatus: PropTypes.string,

    /** Whether the avatar is selected */
    isSelected: PropTypes.bool,
};

const defaultProps = {
    emojiStatus: '',
    isSelected: false,
};

function AvatarWithOptionalStatus({emojiStatus, isSelected}) {
    const styles = useThemeStyles();

    return (
        <View style={styles.sidebarStatusAvatarContainer}>
            <ProfileAvatarWithIndicator isSelected={isSelected} />
            <View style={[styles.sidebarStatusAvatar]}>
                <Text
                    style={styles.emojiStatusLHN}
                    numberOfLines={1}
                >
                    {emojiStatus}
                </Text>
            </View>
        </View>
    );
}

AvatarWithOptionalStatus.propTypes = propTypes;
AvatarWithOptionalStatus.defaultProps = defaultProps;
AvatarWithOptionalStatus.displayName = 'AvatarWithOptionalStatus';
export default AvatarWithOptionalStatus;
