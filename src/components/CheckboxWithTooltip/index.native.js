import React from 'react';
import withWindowDimensions from '@components/withWindowDimensions';
import CheckboxWithTooltipForMobileWebAndNative from './CheckboxWithTooltipForMobileWebAndNative';
import {defaultProps, propTypes} from './checkboxWithTooltipPropTypes';

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
