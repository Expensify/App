import _ from 'lodash';
import React from 'react';
import BaseCheckbox from './BaseCheckbox';

const Checkbox = props => (
    <BaseCheckbox
        // eslint-disable-next-line react/jsx-props-no-spreading
        {..._.omit(props, 'onPress')}
        onMouseDown={props.onMouseDown || props.onPress}
    />
);

Checkbox.propTypes = BaseCheckbox.propTypes;
Checkbox.defaultProps = BaseCheckbox.defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
