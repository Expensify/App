import Log from '@libs/Log';
import {registerSessionCleanupCallback, runSessionCleanupCallbacks} from '@libs/SessionCleanup';

describe('SessionCleanup', () => {
    it('runs the remaining callbacks when an earlier one throws', () => {
        const logWarnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});
        const laterCallback = jest.fn();
        registerSessionCleanupCallback(() => {
            throw new Error('cleanup failed');
        });
        registerSessionCleanupCallback(laterCallback);

        expect(() => runSessionCleanupCallbacks()).not.toThrow();
        expect(laterCallback).toHaveBeenCalledTimes(1);
        expect(logWarnSpy).toHaveBeenCalled();
    });
});
