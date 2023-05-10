import React from 'react';
import {propTypes, defaultProps} from './checkboxWithTooltipPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import CheckboxWithTooltipForMobileWebAndNative from './CheckboxWithTooltipForMobileWebAndNative';

const CheckboxWithTooltip = (props) => (
    <CheckboxWithTooltipForMobileWebAndNative
        style={props.style}
        isChecked={props.isChecked}
        onPress={props.onPress}
        text={props.text}
        toggleTooltip={props.toggleTooltip}
    />
);

CheckboxWithTooltip.propTypes = propTypes;
CheckboxWithTooltip.defaultProps = defaultProps;
CheckboxWithTooltip.displayName = 'CheckboxWithTooltip';

export default withWindowDimensions(CheckboxWithTooltip);
