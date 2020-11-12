import 'react-native';
import {render} from '@testing-library/react-native';
import React from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import ViewWithText from '../components/ViewWithText';

import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

const TEST_KEY = 'test';

jest.mock('../../node_modules/@react-native-community/async-storage',
    () => require('./mocks/@react-native-community/async-storage'));

Onyx.registerLogger(() => {});
Onyx.init({
    keys: {
        TEST_KEY,
        COLLECTION: {},
    },
    registerStorageEventListener: () => {},
});

describe('withOnyx', () => {
    it('should render with the test data when using withOnyx', () => {
        let result;

        Onyx.set(TEST_KEY, 'test1')
            .then(() => {
                const TestComponentWithOnyx = withOnyx({
                    text: {
                        key: TEST_KEY,
                    },
                })(ViewWithText);

                result = render(<TestComponentWithOnyx />);
                return waitForPromisesToResolve();
            })
            .then(() => {
                const textComponent = result.getByText('test1');
                expect(textComponent).toBeTruthy();
            });
    });
});
