const setAudioModeAsync = jest.fn(() => Promise.resolve());

const mockPlayer = {
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    addListener: jest.fn(() => ({remove: jest.fn()})),
};

const createAudioPlayer = jest.fn(() => mockPlayer);

const AudioModule = {
    requestRecordingPermissionsAsync: jest.fn(() => Promise.resolve({granted: true})),
};

export {setAudioModeAsync, createAudioPlayer, AudioModule};
export default {setAudioModeAsync, createAudioPlayer, AudioModule};
