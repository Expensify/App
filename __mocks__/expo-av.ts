import {View} from 'react-native';

const mockPlayAsync = jest.fn();
const mockPauseAsync = jest.fn();
const mockUnloadAsync = jest.fn();
const mockLoadAsync = jest.fn();

const Audio = {
    Sound: jest.fn().mockImplementation(() => ({
        loadAsync: mockLoadAsync,
        playAsync: mockPlayAsync,
        pauseAsync: mockPauseAsync,
        unloadAsync: mockUnloadAsync,
        getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
        setOnPlaybackStatusUpdate: jest.fn(),
    })),
    setAudioModeAsync: jest.fn(),
};

const Video = class extends View {
    setStatusAsync = jest.fn().mockResolvedValue(undefined);
}

// Export default Video
export default Video;
export {Audio, Video};
// Re-export types as empty objects so imports don’t fail
