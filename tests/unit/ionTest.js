import Ion from '../../src/libs/Ion';

const TEST_KEY = 'test';

jest.mock('../../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));

Ion.registerLogger(() => {});
Ion.init({
    keys: {
        TEST_KEY,
        COLLECTION: {},
    },
});

describe('Ion', () => {
    let connectionID;

    afterEach((done) => {
        Ion.disconnect(connectionID);
        Ion.clear().then(done);
    });

    it('Can set a simple key', (done) => {
        const mockCallback = jest.fn();
        connectionID = Ion.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);

                try {
                    expect(value).toBe('test');
                    done();
                } catch (error) {
                    done(error);
                }
            }
        });

        // Set a simple key
        Ion.set(TEST_KEY, 'test');
    });

    it('Can merge an object with another object', (done) => {
        const mockCallback = jest.fn();
        connectionID = Ion.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);

                try {
                    // Test that setting the value will trigger
                    // the callback with the correct data
                    if (mockCallback.mock.calls.length === 1) {
                        expect(value).toStrictEqual({
                            test1: 'test1',
                        });
                        return;
                    }

                    if (mockCallback.mock.calls.length === 2) {
                        expect(value).toStrictEqual({
                            test1: 'test1',
                            test2: 'test2',
                        });
                        done();
                    }
                } catch (error) {
                    done(error);
                }
            }
        });

        Ion.set(TEST_KEY, {test1: 'test1'});
        Ion.merge(TEST_KEY, {test2: 'test2'});
    });
});
