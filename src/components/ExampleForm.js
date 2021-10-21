import React from 'react';
import ExpensiForm from './ExpensiForm';
import FormInput from './FormInput';
import {View} from 'react-native';

class ExampleForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
                <ExpensiForm
                    formName='bankAccount'
                >
                    <View>
                        <FormInput 
                            label={'First name'}
                            value={''}
                            placeholder={'Name'}
                            translateX={-10}
                        />
                    </View>
                    <FormInput 
                        label={'Last name'}
                        value={''}
                        placeholder={'Name'}
                        translateX={-10}
                    />
                </ExpensiForm>
        );
    }
}

// ExpensiForm.propTypes = propTypes;
// ExpensiForm.defaultProps = defaultProps;
export default ExampleForm;
