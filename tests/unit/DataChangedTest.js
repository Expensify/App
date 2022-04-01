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
});
