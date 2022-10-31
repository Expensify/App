import React from 'react';
import {View} from 'react-native';
import {propTypes, defaultProps} from './formSubmitPropTypes';

const FormSubmit = (props) => <View style={props.style}>{props.children}</View>;

FormSubmit.propTypes = propTypes;
FormSubmit.defaultProps = defaultProps;
FormSubmit.displayName = 'FormSubmit';

export default FormSubmit;
