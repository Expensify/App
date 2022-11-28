import React from "react";
import BaseCheckbox from "./BaseCheckbox";

const Checkbox = props => (
    <BaseCheckbox
        onMouseDown={props.onMouseDown ? props.onMouseDown : props.onPress}
        onPress={undefined}
        {...props}
    />
);

Checkbox.propTypes = BaseCheckbox.propTypes;
Checkbox.defaultProps = BaseCheckbox.defaultProps;

export default Checkbox;