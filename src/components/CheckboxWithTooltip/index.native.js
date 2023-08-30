import React from 'react';
import {propTypes, defaultProps} from './checkboxWithTooltipPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import CheckboxWithTooltipForMobileWebAndNative from './CheckboxWithTooltipForMobileWebAndNative';

function CheckboxWithTooltip(props) {
    return (
        <CheckboxWithTooltipForMobileWebAndNative
            style={props.style}
            isChecked={props.isChecked}
            onPress={props.onPress}
            text={props.text}
            toggleTooltip={props.toggleTooltip}
            accessibilityLabel={props.accessibilityLabel || props.text}
        />
    );
}

CheckboxWithTooltip.propTypes = propTypes;
CheckboxWithTooltip.defaultProps = defaultProps;
CheckboxWithTooltip.displayName = 'CheckboxWithTooltip';

export default withWindowDimensions(CheckboxWithTooltip);
