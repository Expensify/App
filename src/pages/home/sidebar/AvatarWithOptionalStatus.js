/* eslint-disable rulesdir/onyx-props-must-have-default */
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import PressableAvatarWithIndicator from './PressableAvatarWithIndicator';

const propTypes = {
    /** Emoji status */
    emojiStatus: PropTypes.string,

    /** Whether the avatar is selected */
    isSelected: PropTypes.bool,

    /** Callback called when the avatar or status icon is pressed */
    onPress: PropTypes.func,
};

const defaultProps = {
    emojiStatus: '',
    isSelected: false,
    onPress: () => {},
};

function AvatarWithOptionalStatus({emojiStatus, isSelected, onPress}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={styles.sidebarStatusAvatarContainer}>
            <PressableAvatarWithIndicator
                isSelected={isSelected}
                onPress={onPress}
            />
            <PressableWithoutFeedback
                accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                role={CONST.ROLE.BUTTON}
                onPress={onPress}
                style={[styles.sidebarStatusAvatar]}
            >
                <Text
                    style={styles.emojiStatusLHN}
                    numberOfLines={1}
                >
                    {emojiStatus}
                </Text>
            </PressableWithoutFeedback>
        </View>
    );
}

AvatarWithOptionalStatus.propTypes = propTypes;
AvatarWithOptionalStatus.defaultProps = defaultProps;
AvatarWithOptionalStatus.displayName = 'AvatarWithOptionalStatus';
export default AvatarWithOptionalStatus;
