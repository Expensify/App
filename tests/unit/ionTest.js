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
    it('Can set a key', (done) => {
        const mockCallback = jest.fn();

        Ion.connect({
            key: TEST_KEY,
            callback: (value) => {
                mockCallback(value);

                try {
                    // Test that the initial value from connecting
                    // will be null since the key does not yet exist
                    if (mockCallback.mock.calls.length === 1) {
                        expect(value).toBe(null);
                        return;
                    }

                    // Test that setting the value will trigger
                    // the callback with the correct data
                    if (mockCallback.mock.calls.length === 2) {
                        expect(value).toBe('test');
                        done();
                    }
                } catch (error) {
                    done(error);
                }
            }
        });

        Ion.set(TEST_KEY, 'test');
    });
});
