import createCallback from '../../src/libs/createCallback';

test('Callback utility works', () => {
    // GIVEN a generic callback setup
    const [doSomething, registerDoSomething, clear] = createCallback();
    const mockCallback = jest.fn();

    // WHEN we register a callback
    registerDoSomething(mockCallback);

    // THEN call the callback
    doSomething();

    // THEN our callback will be called
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // WHEN we clear the callback
    clear();

    // and call again
    doSomething();

    // THEN expect mock callback to not have been called again
    expect(mockCallback).toHaveBeenCalledTimes(1);
});
