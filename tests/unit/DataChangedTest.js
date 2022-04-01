import * as DataChanged from '../../src/libs/DataChanged';

describe('DataChanged', () => {
    it('A single callback is triggered when publish is called for the same command', () => {
        // Given a single callback subscribed to an API command
        const callbackFunction = jest.fn();
        DataChanged.subscribe('callbackFunctionTest', callbackFunction);

        // When an event for that API command is published
        DataChanged.publish('callbackFunctionTest', {});

        // Then the callback should be called once
        expect(callbackFunction).toBeCalledTimes(1);
    });

    it('A single callback is not triggered when publish is called with a different command', () => {
        // Given a single callback subscribed to an API command
        const callbackFunction = jest.fn();
        DataChanged.subscribe('callbackFunctionTest', callbackFunction);

        // When an event for a different API command is published
        DataChanged.publish('callbackFunctionSomeOtherTest', {});

        // Then the callback should not have been called at all
        expect(callbackFunction).toBeCalledTimes(0);
    });

    it('Multiple callbacks are triggered the right number of times', () => {
        // Given three callbacks subscribed to two unique API commands
        const callbackFunction1 = jest.fn();
        const callbackFunction2 = jest.fn();
        const callbackFunction3 = jest.fn();
        DataChanged.subscribe('callbackFunctionTest1', callbackFunction1);
        DataChanged.subscribe('callbackFunctionTest1', callbackFunction2);
        DataChanged.subscribe('callbackFunctionTest2', callbackFunction3);

        // When an event is published twice for both API commands
        DataChanged.publish('callbackFunctionTest1', {});
        DataChanged.publish('callbackFunctionTest1', {});
        DataChanged.publish('callbackFunctionTest2', {});
        DataChanged.publish('callbackFunctionTest2', {});

        // Then all callbacks should be called twice
        expect(callbackFunction1).toBeCalledTimes(2);
        expect(callbackFunction2).toBeCalledTimes(2);
        expect(callbackFunction3).toBeCalledTimes(2);
    });
});
