import {waitFor} from '@testing-library/react-native';
import Log from '@libs/Log';
import type * as SoundModule from '@libs/Sound';
import {Howl} from 'howler';

const {default: playSound, clearSoundAssetsCache, SOUNDS} = jest.requireActual<typeof SoundModule>('@libs/Sound/index.ts');

const mockGetIsMuted = jest.fn(() => false);
jest.mock('@libs/Sound/BaseSound', () => ({
    SOUNDS: {DONE: 'done', SUCCESS: 'success', ATTENTION: 'attention', RECEIVE: 'receive'},
    getIsMuted: () => mockGetIsMuted(),
    withMinimalExecutionTime: (play: (sound: string) => void) => play,
}));
jest.mock('howler', () => ({Howl: jest.fn().mockImplementation(() => ({play: jest.fn()}))}));
jest.mock('@libs/Log', () => ({alert: jest.fn()}));

const mockHowl = jest.mocked(Howl);
const mockAlert = jest.spyOn(Log, 'alert');

describe('Sound', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetIsMuted.mockReturnValue(false);
        Reflect.deleteProperty(window, 'caches');
        Reflect.deleteProperty(globalThis, 'caches');
    });

    it('plays through the network fallback and preserves load and play error messages', () => {
        // Given no Cache API, when playing, then the real Sound function creates the network Howl.
        playSound(SOUNDS.DONE);
        const options = mockHowl.mock.calls.at(-1)?.[0];
        expect(options?.src).toEqual(['/sounds/done.mp3']);
        expect(options?.onloaderror).toBeDefined();
        if (!options) {
            throw new Error('Expected network Howl options');
        }
        options.onloaderror?.(0, {message: 'load failed'});
        options.onplayerror?.(0, new Error('play failed'));
        expect(mockAlert).toHaveBeenCalledWith('[sound] Load error:', {message: 'load failed'});
        expect(mockAlert).toHaveBeenCalledWith('[sound] Play error:', {message: 'play failed'});
    });

    it('does not start playback when muted', () => {
        // Given a muted platform, when play is called, then no Howl is created.
        mockGetIsMuted.mockReturnValue(true);
        playSound(SOUNDS.SUCCESS);
        expect(mockHowl).not.toHaveBeenCalled();
    });

    it('uses a cached blob URL and handles cache deletion failures', async () => {
        // Given a cached sound, when played, then Howl receives the blob URL.
        const blob = new Blob(['sound']);
        const match = jest.fn().mockResolvedValue({blob: () => Promise.resolve(blob)});
        const cache = {match, add: jest.fn()};
        const deleteCache = jest.fn().mockResolvedValue(false);
        const cacheAPI = {open: jest.fn().mockResolvedValue(cache), delete: deleteCache};
        Object.defineProperty(window, 'caches', {configurable: true, value: cacheAPI});
        Object.defineProperty(globalThis, 'caches', {configurable: true, value: cacheAPI});
        const createObjectURL = jest.fn(() => 'blob:sound');
        Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: createObjectURL});
        playSound(SOUNDS.ATTENTION);
        await waitFor(() => {
            expect(match).toHaveBeenCalledWith('/sounds/attention.mp3');
            expect(createObjectURL).toHaveBeenCalledWith(blob);
            expect(mockHowl.mock.calls.at(-1)?.[0].src).toEqual(['blob:sound']);
        });
        clearSoundAssetsCache();
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('[sound] Failed to clear sound assets cache.');
        });
    });

    it('logs an absent message for a rejected cache deletion', async () => {
        // Given a rejection without a message, when deletion fails, then its log field stays undefined.
        const cacheAPI = {delete: jest.fn().mockRejectedValue('failure')};
        Object.defineProperty(window, 'caches', {configurable: true, value: cacheAPI});
        Object.defineProperty(globalThis, 'caches', {configurable: true, value: cacheAPI});
        clearSoundAssetsCache();
        await waitFor(() => {
            expect(mockAlert).toHaveBeenCalledWith('[sound] Error clearing sound assets cache:', {message: undefined});
        });
    });
});
