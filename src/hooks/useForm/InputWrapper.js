import React, {forwardRef, useContext} from 'react';
import PropTypes from 'prop-types';
import FormContext from './FormContext';

const propTypes = {
    RenderInput: PropTypes.node.isRequired,
    inputID: PropTypes.string.isRequired,
    forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),
};

const defaultProps = {
    forwardedRef: undefined,
};

function InputWrapper(props) {
    const {RenderInput, inputID, forwardedRef, ...rest} = props;
    const {registerInput} = useContext(FormContext);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RenderInput {...registerInput(inputID, {ref: forwardedRef, ...rest})} />;
}

InputWrapper.propTypes = propTypes;
InputWrapper.defaultProps = defaultProps;
InputWrapper.displayName = 'InputWrapper';

export default forwardRef((props, ref) => (
    <InputWrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
