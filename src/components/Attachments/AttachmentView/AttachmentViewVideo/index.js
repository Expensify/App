import React, {memo, useEffect, useRef} from 'react';
import {View} from 'react-native';
import styles from '../../../../styles/styles';
import VideoPlayer from '../../../VideoPlayer';
import withLocalize, {withLocalizePropTypes} from '../../../withLocalize';
import compose from '../../../../libs/compose';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import {usePlaybackContext} from '../../../PlaybackContext';

const propTypes = {
    ...withLocalizePropTypes,
};

function AttachmentViewVideo({source}) {
    const {currentlyPlayingURL, originalParent, sharedElement} = usePlaybackContext();
    const {isSmallScreenWidth} = useWindowDimensions();
    const videoPlayerParentRef = useRef(null);

    const shouldUseSharedElementTransition = !isSmallScreenWidth && currentlyPlayingURL === source;

    // shared element transition logic for video player
    useEffect(() => {
        if (!shouldUseSharedElementTransition) {
            return;
        }
        const ref = videoPlayerParentRef.current;
        if (currentlyPlayingURL === source) {
            ref.appendChild(sharedElement);
        }
        return () => {
            if (!ref.childNodes[0]) {
                return;
            }
            originalParent.appendChild(sharedElement);
        };
    }, [currentlyPlayingURL, isSmallScreenWidth, originalParent, sharedElement, shouldUseSharedElementTransition, source]);

    return shouldUseSharedElementTransition ? (
        <View
            ref={videoPlayerParentRef}
            style={[styles.flex1]}
        />
    ) : (
        <VideoPlayer
            url={source}
            shouldPlay={false}
        />
    );
}

AttachmentViewVideo.propTypes = propTypes;
AttachmentViewVideo.defaultProps = {};

export default compose(memo, withLocalize)(AttachmentViewVideo);
