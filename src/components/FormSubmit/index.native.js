import React from 'react';
import {View} from 'react-native';
import * as formSubmitPropTypes from './formSubmitPropTypes';

const FormSubmit = React.forwardRef((props, ref) => (
    <View
        ref={ref}
        style={props.style}
    >
        {props.children}
    </View>
));

FormSubmit.propTypes = formSubmitPropTypes.propTypes;
FormSubmit.defaultProps = formSubmitPropTypes.defaultProps;
FormSubmit.displayName = 'FormSubmit';

export default FormSubmit;
