import React from 'react';
import {View} from 'react-native';
import CheckboxWithTooltipForMobileWebAndNative from './CheckboxWithTooltipForMobileWebAndNative';
import Checkbox from '../Checkbox';
import {propTypes, defaultProps} from './checkboxWithTooltipPropTypes';
import Tooltip from '../Tooltip';
import withWindowDimensions from '../withWindowDimensions';

const CheckboxWithTooltip = (props) => {
    if (props.isSmallScreenWidth || props.isMediumScreenWidth) {
        return (
            <CheckboxWithTooltipForMobileWebAndNative
                style={props.style}
                isChecked={props.isChecked}
                onPress={props.onPress}
                text={props.text}
                toggleTooltip={props.toggleTooltip}
                disabled={props.disabled}
            />
        );
    }
    const checkbox = (
        <Checkbox
            isChecked={props.isChecked}
            onPress={props.onPress}
            disabled={props.disabled}
        />
    );
    return (
        <View style={props.style}>
            {props.toggleTooltip
                ? (
                    <Tooltip text={props.text}>
                        {checkbox}
                    </Tooltip>
                )
                : checkbox}
        </View>
    );
};

CheckboxWithTooltip.propTypes = propTypes;
CheckboxWithTooltip.defaultProps = defaultProps;
CheckboxWithTooltip.displayName = 'CheckboxWithTooltip';

export default withWindowDimensions(CheckboxWithTooltip);
