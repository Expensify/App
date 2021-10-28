import React from 'react';
import FormInput from './FormInput';
import {View} from 'react-native';
import withForm from './withForm';
import compose from '../libs/compose';
import {FormContextProvider} from '../components/withForm';

class ExampleWithForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <FormContextProvider>
                <View>
                    <View>
                    <FormInput 
                        label={'First name'}
                        value={''}
                        placeholder={'Name'}
                    />
                    </View>
                </View>
                <FormInput 
                    label={'Last name'}
                    value={''}
                    placeholder={'Name'}
                />
            </FormContextProvider>
        );
    }
}

// ExpensiForm.propTypes = propTypes;
// ExpensiForm.defaultProps = defaultProps;
export default ExampleWithForm;
