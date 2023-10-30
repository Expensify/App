import React, {forwardRef} from 'react';
import GenericPressable from './BaseGenericPressable';
import GenericPressablePropTypes from './PropTypes';

const WebGenericPressable = forwardRef((props, ref) => (
    <GenericPressable
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        // change native accessibility props to web accessibility props
        tabIndex={!props.accessible || !props.focusable ? -1 : 0}
        role={props.accessibilityRole}
        id={props.nativeID}
        aria-label={props.accessibilityLabel}
        aria-labelledby={props.accessibilityLabelledBy}
        aria-valuenow={props.accessibilityValue}
        nativeID={props.nativeID}
        dataSet={{tag: 'pressable', ...(props.noDragArea && {dragArea: false}), ...props.dataSet}}
    />
));

WebGenericPressable.propTypes = GenericPressablePropTypes.pressablePropTypes;
WebGenericPressable.defaultProps = GenericPressablePropTypes.defaultProps;
WebGenericPressable.displayName = 'WebGenericPressable';

export default WebGenericPressable;
