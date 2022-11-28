import React from "react";
import BaseCheckbox from "./BaseCheckbox";

const Checkbox = props => (
    <BaseCheckbox
        onPress={props.onPress ? props.onPress : props.onMouseDown}
        onMouseDown={undefined}
        {...props}
    />
);

Checkbox.propTypes = BaseCheckbox.propTypes;
Checkbox.defaultProps = BaseCheckbox.defaultProps;

export default Checkbox;