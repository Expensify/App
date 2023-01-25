import React from 'react';
import {View} from 'react-native';
import * as formSubmitPropTypes from './formSubmitPropTypes';

const FormSubmit = props => <View style={props.style}>{props.children}</View>;

FormSubmit.propTypes = formSubmitPropTypes.propTypes;
FormSubmit.defaultProps = formSubmitPropTypes.defaultProps;
FormSubmit.displayName = 'FormSubmit';

export default FormSubmit;
