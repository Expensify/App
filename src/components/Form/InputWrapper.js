import React, {forwardRef, useContext} from 'react';
import PropTypes from 'prop-types';
import FormContext from './FormContext';

const propTypes = {
    InputComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]).isRequired,
    inputID: PropTypes.string.isRequired,
    valueType: PropTypes.string,
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
};

const defaultProps = {
    forwardedRef: undefined,
    valueType: 'string',
};

function InputWrapper(props) {
    const {InputComponent, inputID, forwardedRef, ...rest} = props;
    const {registerInput} = useContext(FormContext);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <InputComponent {...registerInput(inputID, {ref: forwardedRef, ...rest})} />;
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
