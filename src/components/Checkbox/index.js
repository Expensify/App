import React from 'react';
import BaseCheckbox from './BaseCheckbox';

const Checkbox = props => (
    <BaseCheckbox
        onMouseDown={props.onMouseDown ? props.onMouseDown : props.onPress}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

Checkbox.propTypes = BaseCheckbox.propTypes;
Checkbox.defaultProps = BaseCheckbox.defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
