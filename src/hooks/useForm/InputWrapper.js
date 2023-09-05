import React, {forwardRef, useContext} from 'react';
import FormContext from './FormContext';

const InputWrapper = forwardRef((props, ref) => {
    const {RenderInput, inputID, ...rest} = props;
    const {registerInput} = useContext(FormContext);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RenderInput {...registerInput(inputID, {ref, ...rest})} />;
});

export default InputWrapper;
