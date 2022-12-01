import React from 'react';
import BaseCheckbox from './BaseCheckbox';

const Checkbox = props => (
    <BaseCheckbox
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onMouseDown={props.onMouseDown ? props.onMouseDown : props.onPress}
    />
);

Checkbox.propTypes = BaseCheckbox.propTypes;
Checkbox.defaultProps = BaseCheckbox.defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
