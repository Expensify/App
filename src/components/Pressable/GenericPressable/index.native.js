import React, {forwardRef} from 'react';
import GenericPressable from './BaseGenericPressable';

const NativeGenericPressable = forwardRef((props, ref) => (
    <GenericPressable
        focusable
        accessible
        accessibilityHint={props.accessibilityHint || props.accessibilityLabel}

        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));

NativeGenericPressable.propTypes = GenericPressable.propTypes;
NativeGenericPressable.defaultProps = GenericPressable.defaultProps;

export default NativeGenericPressable;
