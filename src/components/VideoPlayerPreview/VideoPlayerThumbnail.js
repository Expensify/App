import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

const propTypes = {
    onPress: PropTypes.func.isRequired,

    accessibilityLabel: PropTypes.string.isRequired,

    thumbnailUrl: PropTypes.string,
};

const defaultProps = {
    thumbnailUrl: undefined,
};

function VideoPlayerThumbnail({thumbnailUrl, onPress, accessibilityLabel}) {
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            {thumbnailUrl && (
                <View style={styles.flex1}>
                    <Image
                        source={{uri: thumbnailUrl}}
                        style={styles.flex1}
                        isAuthTokenRequired
                    />
                </View>
            )}
            <PressableWithoutFeedback
                style={[styles.videoThumbnailContainer]}
                accessibilityLabel={accessibilityLabel}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                onPress={onPress}
            >
                <View style={[styles.videoThumbnailPlayButton]}>
                    <Icon
                        src={Expensicons.Play}
                        fill="white"
                        width={variables.iconSizeXLarge}
                        height={variables.iconSizeXLarge}
                        additionalStyles={[styles.ml1]}
                    />
                </View>
            </PressableWithoutFeedback>
        </View>
    );
}

VideoPlayerThumbnail.propTypes = propTypes;
VideoPlayerThumbnail.defaultProps = defaultProps;
VideoPlayerThumbnail.displayName = 'VideoPlayerThumbnail';

export default VideoPlayerThumbnail;
