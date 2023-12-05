import PropTypes from 'prop-types';
import React, {forwardRef, useContext} from 'react';
import refPropTypes from '@components/refPropTypes';
import TextInput from '@components/TextInput';
import FormContext from './FormContext';

const propTypes = {
    InputComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]).isRequired,
    inputID: PropTypes.string.isRequired,
    valueType: PropTypes.string,
    forwardedRef: refPropTypes,
};

const defaultProps = {
    forwardedRef: undefined,
    valueType: 'string',
};

function InputWrapper(props) {
    const {InputComponent, inputID, forwardedRef, ...rest} = props;
    const {registerInput} = useContext(FormContext);
    // There are inputs that dont have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
    // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
    // calling some methods too early or twice, so we had to add this check to prevent that side effect.
    // For now this side effect happened only in `TextInput` components.
    const shouldSetTouchedOnBlurOnly = InputComponent === TextInput;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InputComponent {...registerInput(inputID, {ref: forwardedRef, shouldSetTouchedOnBlurOnly, ...rest})} />;
}

InputWrapper.propTypes = propTypes;
InputWrapper.defaultProps = defaultProps;
InputWrapper.displayName = 'InputWrapper';

const InputWrapperWithRef = forwardRef((props, ref) => (
    <InputWrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

InputWrapperWithRef.displayName = 'InputWrapperWithRef';

export default InputWrapperWithRef;
