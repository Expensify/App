import React from 'react';
import TextInput from './TextInput';

class TestClass extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            class: 'class',
        };
    }

    render() {
        return (
            <TextInput
                inputID="testClass"
                label="Test Class"
                placeholder="Class"
            />
        );
    }
}

export default TestClass;
