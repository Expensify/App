import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageWithSizeCalculation from '@components/Image';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import styles from '@styles/styles';
import CONST from '@src/CONST';

const propTypes = {
    onPress: PropTypes.func.isRequired,

    accessibilityLabel: PropTypes.string.isRequired,

    thumbnailUrl: PropTypes.string,
};

const defaultProps = {
    thumbnailUrl: null,
};

function VideoPlayerThumbnail({thumbnailUrl, onPress, accessibilityLabel}) {
    const updateImageSize = () => {};

    return (
        <View style={styles.flex1}>
            {thumbnailUrl && (
                <View style={styles.flex1}>
                    <ImageWithSizeCalculation
                        source={{uri: thumbnailUrl}}
                        onMeasure={updateImageSize}
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
                        width={28}
                        height={28}
                        additionalStyles={[{marginLeft: 4}]}
                    />
                </View>
            </PressableWithoutFeedback>
        </View>
    );
}

VideoPlayerThumbnail.propTypes = propTypes;
VideoPlayerThumbnail.defaultProps = defaultProps;
VideoPlayerThumbnail.displayName = 'AttachmentView';

export default VideoPlayerThumbnail;
