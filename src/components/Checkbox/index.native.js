import React from 'react';
import BaseCheckbox from './BaseCheckbox';

const Checkbox = props => (
    <BaseCheckbox
        onPress={props.onPress ? props.onPress : props.onMouseDown}
        onMouseDown={undefined}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

Checkbox.propTypes = BaseCheckbox.propTypes;
Checkbox.defaultProps = BaseCheckbox.defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
