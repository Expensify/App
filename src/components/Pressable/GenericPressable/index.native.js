import React, {forwardRef} from 'react';
import GenericPressable from './BaseGenericPressable';
import GenericPressablePropTypes from './PropTypes';

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

NativeGenericPressable.propTypes = GenericPressablePropTypes.pressablePropTypes;
NativeGenericPressable.defaultProps = GenericPressablePropTypes.defaultProps;
NativeGenericPressable.displayName = 'WebGenericPressable';

export default NativeGenericPressable;
