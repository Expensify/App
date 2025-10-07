import type {ViewProps} from 'react-native';
import {View} from 'react-native';

const ResizeMode = {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
    CENTER: 'center',
};

function Video(props: ViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <View {...props} />;
}

const VideoFullscreenUpdate = {
    PLAYER_WILL_PRESENT: 0,
    PLAYER_DID_PRESENT: 1,
    PLAYER_WILL_DISMISS: 2,
    PLAYER_DID_DISMISS: 3,
};

export {ResizeMode, Video, VideoFullscreenUpdate};
