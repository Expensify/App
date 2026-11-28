import removeServiceWorkerForClassic from '@libs/removeServiceWorkerForClassic';
import unregisterServiceWorkers from '@libs/unregisterServiceWorkers';
import {blockAndClearUserMedia} from '@libs/UserMediaCache';

jest.mock('@libs/Log', () => ({warn: jest.fn()}));
jest.mock('@libs/unregisterServiceWorkers', () => jest.fn());
jest.mock('@libs/UserMediaCache', () => ({blockAndClearUserMedia: jest.fn()}));

describe('removeServiceWorkerForClassic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(blockAndClearUserMedia).mockResolvedValue(undefined);
        jest.mocked(unregisterServiceWorkers).mockResolvedValue(undefined);
    });

    it('clears saved media and unregisters the worker', async () => {
        // Given both cleanup steps succeed

        // When Classic is about to open
        await removeServiceWorkerForClassic();

        // Then both steps ran
        expect(blockAndClearUserMedia).toHaveBeenCalledTimes(1);
        expect(unregisterServiceWorkers).toHaveBeenCalledTimes(1);
    });

    it('still unregisters the worker when clearing media fails', async () => {
        // Given clearing media rejects
        jest.mocked(blockAndClearUserMedia).mockRejectedValue(new Error('failed'));

        // When Classic is about to open
        await removeServiceWorkerForClassic();

        // Then the worker is still unregistered
        expect(unregisterServiceWorkers).toHaveBeenCalledTimes(1);
    });

    it('resolves when a step never settles', async () => {
        // Given Cache Storage never answers
        jest.mocked(blockAndClearUserMedia).mockReturnValue(new Promise(() => {}));
        let isDone = false;

        // When Classic is about to open
        const promise = removeServiceWorkerForClassic().then(() => {
            isDone = true;
        });
        await Promise.resolve();
        expect(isDone).toBe(false);
        jest.advanceTimersByTime(2000);
        await promise;

        // Then the wait ends after the timeout
        expect(isDone).toBe(true);
    });
});
