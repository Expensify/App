import 'react-native';
import {render} from '@testing-library/react-native';
import React from 'react';
import Ion from '../../src/libs/Ion';
import withIon from '../../src/components/withIon';
import ViewWithText from './components/ViewWithText';

import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

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
                const TestComponentWithIon = withIon({
                    test: {
                        key: TEST_KEY,
                    },
                })(props => <ViewWithText text={props.test} />);

                result = render(<TestComponentWithIon />);
                return waitForPromisesToResolve();
            })
                .then(() => {
                    const textComponent = result.getByText('test1');
                    expect(textComponent).toBeTruthy();
                });
    });
});
