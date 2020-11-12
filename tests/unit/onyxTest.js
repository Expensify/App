import 'react-native';
import Onyx from 'react-native-onyx';

const TEST_KEY = 'test';

jest.mock('../../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));

Onyx.registerLogger(() => {});
Onyx.init({
    keys: {
        TEST_KEY,
        COLLECTOnyx: {},
    },
    registerStorageEventListener: () => {},
});

describe('Onyx', () => {
    let connectionID;

    afterEach((done) => {
        Onyx.disconnect(connectionID);
        Onyx.clear().then(done);
    });

    it('should set a simple key', (done) => {
        const mockCallback = jest.fn();
        connectionID = Onyx.connect({
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
        Onyx.set(TEST_KEY, 'test');
    });

    it('should merge an object with another object', (done) => {
        const mockCallback = jest.fn();
        connectionID = Onyx.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);

                try {
                    if (mockCallback.mock.calls.length === 1) {
                        expect(value).toStrictEqual({
                            test1: 'test1',
                        });
                        return;
                    }

                    expect(value).toStrictEqual({
                        test1: 'test1',
                        test2: 'test2',
                    });
                    done();
                } catch (error) {
                    done(error);
                }
            }
        });

        Onyx.set(TEST_KEY, {test1: 'test1'});
        Onyx.merge(TEST_KEY, {test2: 'test2'});
    });

    it('should notify subscribers when data has been cleared', (done) => {
        const mockCallback = jest.fn();
        connectionID = Onyx.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);

                try {
                    if (mockCallback.mock.calls.length === 1) {
                        expect(value).toBe('test');
                        return;
                    }

                    expect(value).toBe(null);
                    done();
                } catch (error) {
                    done(error);
                }
            }
        });

        Onyx.set(TEST_KEY, 'test');
        Onyx.clear();
    });

    it('should not notify subscribers after they have disconnected', (done) => {
        const mockCallback = jest.fn();
        connectionID = Onyx.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);
                expect(value).toBe('test');
            }
        });

        Onyx.set(TEST_KEY, 'test')
            .then(() => {
                Onyx.disconnect(connectionID);
                return Onyx.set(TEST_KEY, 'test updated');
            })
            .then(() => {
                try {
                    expect(mockCallback.mock.calls.length).toBe(1);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should merge arrays by appending new items to the end of a value', (done) => {
        const mockCallback = jest.fn();
        connectionID = Onyx.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);

                try {
                    if (mockCallback.mock.calls.length === 1) {
                        expect(value).toStrictEqual(['test1']);
                        return;
                    }

                    expect(value).toStrictEqual(['test1', 'test2', 'test3', 'test4']);
                    done();
                } catch (err) {
                    done(err);
                }
            }
        });

        Onyx.set(TEST_KEY, ['test1']);
        Onyx.merge(TEST_KEY, ['test2', 'test3', 'test4']);
    });
});
