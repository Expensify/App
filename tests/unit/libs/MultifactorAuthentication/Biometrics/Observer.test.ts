import MultifactorAuthenticationObserver from '@libs/MultifactorAuthentication/Biometrics/Observer';
import {MultifactorAuthenticationCallbacks} from '@libs/MultifactorAuthentication/Biometrics/VALUES';

describe('MultifactorAuthenticationObserver', () => {
    beforeEach(() => {
        // Clear all callbacks before each test
        MultifactorAuthenticationCallbacks.onFulfill = {};
    });

    describe('registerCallback', () => {
        it('should register a callback with an ID', () => {
            const testId = 'test-callback-id';
            const testCallback = jest.fn();

            MultifactorAuthenticationObserver.registerCallback(testId, testCallback);

            expect(MultifactorAuthenticationCallbacks.onFulfill[testId]).toBe(testCallback);
        });

        it('should allow multiple callbacks to be registered', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            MultifactorAuthenticationObserver.registerCallback('id-1', callback1);
            MultifactorAuthenticationObserver.registerCallback('id-2', callback2);

            expect(MultifactorAuthenticationCallbacks.onFulfill['id-1']).toBe(callback1);
            expect(MultifactorAuthenticationCallbacks.onFulfill['id-2']).toBe(callback2);
        });

        it('should overwrite existing callback with same ID', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const testId = 'same-id';

            MultifactorAuthenticationObserver.registerCallback(testId, callback1);
            MultifactorAuthenticationObserver.registerCallback(testId, callback2);

            expect(MultifactorAuthenticationCallbacks.onFulfill[testId]).toBe(callback2);
        });

        it('should handle callback function execution', () => {
            const testId = 'executable-callback';
            const testCallback = jest.fn(() => 'test-result');

            MultifactorAuthenticationObserver.registerCallback(testId, testCallback);

            const storedCallback = MultifactorAuthenticationCallbacks.onFulfill[testId];
            const result = storedCallback();

            expect(testCallback).toHaveBeenCalled();
            expect(result).toBe('test-result');
        });

        it('should accept callbacks that return different types', () => {
            const stringCallback = jest.fn(() => 'string-result');
            const numberCallback = jest.fn(() => 42);
            const objectCallback = jest.fn(() => ({result: 'object'}));

            MultifactorAuthenticationObserver.registerCallback('string-id', stringCallback);
            MultifactorAuthenticationObserver.registerCallback('number-id', numberCallback);
            MultifactorAuthenticationObserver.registerCallback('object-id', objectCallback);

            expect(MultifactorAuthenticationCallbacks.onFulfill['string-id']()).toBe('string-result');
            expect(MultifactorAuthenticationCallbacks.onFulfill['number-id']()).toBe(42);
            expect(MultifactorAuthenticationCallbacks.onFulfill['object-id']()).toEqual({result: 'object'});
        });

        it('should handle callbacks with side effects', () => {
            const state = {counter: 0};
            const incrementCallback = jest.fn(() => {
                state.counter++;
            });

            MultifactorAuthenticationObserver.registerCallback('increment', incrementCallback);

            MultifactorAuthenticationCallbacks.onFulfill.increment();

            expect(state.counter).toBe(1);
        });
    });

    describe('callback storage', () => {
        it('should maintain callback registry across multiple operations', () => {
            const callbacks = [
                {id: 'cb-1', fn: jest.fn()},
                {id: 'cb-2', fn: jest.fn()},
                {id: 'cb-3', fn: jest.fn()},
            ];

            for (const {id, fn} of callbacks) {
                MultifactorAuthenticationObserver.registerCallback(id, fn);
            }

            for (const {id, fn} of callbacks) {
                expect(MultifactorAuthenticationCallbacks.onFulfill[id]).toBe(fn);
            }
        });

        it('should allow querying registered callbacks', () => {
            const testId = 'query-test';
            const testCallback = jest.fn();

            MultifactorAuthenticationObserver.registerCallback(testId, testCallback);

            expect(testId in MultifactorAuthenticationCallbacks.onFulfill).toBe(true);
        });
    });
});
