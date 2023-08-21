import React from 'react';
import PropTypes from 'prop-types';
import ImageWithSizeCalculation from '../Image';
import styles from '../../styles/styles';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import CONST from '../../CONST';

const propTypes = {
    thumbnailUrl: PropTypes.string.isRequired,

    onPress: PropTypes.func.isRequired,

    accessibilityLabel: PropTypes.string.isRequired,
};

const defaultProps = {};

function VideoPlayerThumbnail({thumbnailUrl, onPress, accessibilityLabel}) {
    const updateImageSize = () => {};

    return (
        <PressableWithoutFeedback
            style={styles.flex1}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            onPress={onPress}
        >
            <ImageWithSizeCalculation
                source={{uri: thumbnailUrl}}
                onMeasure={updateImageSize}
                style={styles.flex1}
                isAuthTokenRequired
            />
        </PressableWithoutFeedback>
    );
}

VideoPlayerThumbnail.propTypes = propTypes;
VideoPlayerThumbnail.defaultProps = defaultProps;
VideoPlayerThumbnail.displayName = 'AttachmentView';

export default VideoPlayerThumbnail;
