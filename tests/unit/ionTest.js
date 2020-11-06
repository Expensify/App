import 'react-native';
import {View, Text} from 'react-native';
import {render} from '@testing-library/react-native';
const waitForPromisesToResolve = () => new Promise(setImmediate);

import React from 'react';
import Ion from '../../src/libs/Ion';
import withIon from '../../src/components/withIon';

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

describe('withIon', () => {
    it('should render with the test data when using withIon', () => {
        let result;

        Ion.set(TEST_KEY, 'test1')
            .then(() => {
                const TestComponent = (props) => {
                    return (
                        <View>
                            <Text>{props.test}</Text>
                        </View>
                    );
                };

                const TestComponentWithIon = withIon({
                    test: {
                        key: TEST_KEY,
                    },
                })(TestComponent);
                result = render(<TestComponentWithIon />);
                return waitForPromisesToResolve();
            })
                .then(() => {
                    const textComponent = result.getByText('test1');
                    expect(textComponent).toBeTruthy();
                });
    });
});

describe('Ion', () => {
    let connectionID;

    afterEach((done) => {
        Ion.disconnect(connectionID);
        Ion.clear().then(done);
    });

    it('should set a simple key', (done) => {
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

    it('should merge an object with another object', (done) => {
        const mockCallback = jest.fn();
        connectionID = Ion.connect({
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

        Ion.set(TEST_KEY, {test1: 'test1'});
        Ion.merge(TEST_KEY, {test2: 'test2'});
    });

    it('should notify subscribers when data has been cleared', (done) => {
        const mockCallback = jest.fn();
        connectionID = Ion.connect({
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

        Ion.set(TEST_KEY, 'test');
        Ion.clear();
    });

    it('should not notify subscribers after they have disconnected', (done) => {
        const mockCallback = jest.fn();
        connectionID = Ion.connect({
            key: TEST_KEY,
            initWithStoredValues: false,
            callback: (value) => {
                mockCallback(value);
                expect(value).toBe('test');
            }
        });

        Ion.set(TEST_KEY, 'test')
            .then(() => {
                Ion.disconnect(connectionID);
                return Ion.set(TEST_KEY, 'test updated');
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
        connectionID = Ion.connect({
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

        Ion.set(TEST_KEY, ['test1']);
        Ion.merge(TEST_KEY, ['test2', 'test3', 'test4']);
    });
});
