import React from 'react';
import {propTypes, defaultProps} from './CheckboxWithTooltipPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import CheckboxWithTooltipForMobileWebAndNative from './CheckboxWithTooltipForMobileWebAndNative';

const CheckboxWithTooltip = props => (
    <CheckboxWithTooltipForMobileWebAndNative
        style={props.style}
        isChecked={props.isChecked}
        onPress={props.onPress}
        text={props.text}
        disabled={props.disabled}
        toggleTooltip={props.toggleTooltip}
    />
);

CheckboxWithTooltip.propTypes = propTypes;
CheckboxWithTooltip.defaultProps = defaultProps;
CheckboxWithTooltip.displayName = 'CheckboxWithTooltip';

export default withWindowDimensions(CheckboxWithTooltip);
