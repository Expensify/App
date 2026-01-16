import {View} from 'react-native';

const ResizeMode = {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
    CENTER: 'center',
};

const Video = class extends View {
    setStatusAsync = jest.fn(() => Promise.resolve());
};

const VideoFullscreenUpdate = {
    PLAYER_WILL_PRESENT: 0,
    PLAYER_DID_PRESENT: 1,
    PLAYER_WILL_DISMISS: 2,
    PLAYER_DID_DISMISS: 3,
};

const Audio = {
    getPermissionsAsync: jest.fn(() => Promise.resolve({granted: true})),
    requestPermissionsAsync: jest.fn(() => Promise.resolve()),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    setIsEnabledAsync: jest.fn(() => Promise.resolve()),
};

export {ResizeMode, Audio, Video, VideoFullscreenUpdate};
export default {ResizeMode, Audio, Video, VideoFullscreenUpdate};
