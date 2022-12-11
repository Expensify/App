import React from 'react';
import TextInput from './TextInput';

const TestFunctional = props => (
    <>
        <TextInput
            inputID="testFunc"
            label="Test Func"
            placeholder="Functional"
        />
    </>

)

TestFunctional.displayName = 'TestFunctional';
export default TestFunctional;
