import playSound, {SOUNDS} from '@libs/Sound/index.native';

import {emitAppState} from '../utils/ReactNativeMockUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockPlay = jest.fn();
const mockRemovePlayer = jest.fn();
const mockRemoveSubscription = jest.fn();
const mockCreateAudioPlayer = jest.fn(() => ({
    play: mockPlay,
    remove: mockRemovePlayer,
    addListener: () => ({remove: mockRemoveSubscription}),
}));

jest.mock('@libs/Log');
jest.mock('expo-audio', () => ({
    createAudioPlayer: () => mockCreateAudioPlayer(),
    setAudioModeAsync: () => Promise.resolve(),
}));

describe('Sound/index.native', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        emitAppState('active');
    });

    it('releases the player when iOS refuses to activate the audio session', async () => {
        // Given expo-audio throws from play() the way it does when AVAudioSession.setActive(true) fails
        mockPlay.mockImplementationOnce(() => {
            throw new Error('UnexpectedException: Session activation failed');
        });

        // When a sound is played
        await playSound(SOUNDS.RECEIVE);
        await waitForBatchedUpdates();

        // Then the failure is contained and the native player is freed
        expect(mockPlay).toHaveBeenCalledTimes(1);
        expect(mockRemoveSubscription).toHaveBeenCalledTimes(1);
        expect(mockRemovePlayer).toHaveBeenCalledTimes(1);
    });

    it('does not start playback while the app is in the background', async () => {
        // Given the app went to the background after the sound was queued, where iOS will not activate a session
        emitAppState('background');

        // When a sound is played
        await playSound(SOUNDS.ATTENTION);
        await waitForBatchedUpdates();

        // Then no native player is created at all
        expect(mockCreateAudioPlayer).not.toHaveBeenCalled();
    });
});
