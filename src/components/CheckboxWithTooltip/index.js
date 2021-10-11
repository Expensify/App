import React from 'react';
import {View} from 'react-native';
import {CheckboxWithTooltip as CheckboxWithTooltipNative} from './index.native';
import Checkbox from '../Checkbox';
import {propTypes, defaultProps} from './CheckboxWithTooltipPropTypes';
import Tooltip from '../Tooltip';
import withWindowDimensions from '../withWindowDimensions';
import compose from '../../libs/compose';

const CheckboxWithTooltip = (props) => {
    if (props.isSmallScreenWidth || props.isMediumScreenWidth) {
        return (
            <CheckboxWithTooltipNative
                style={props.style}
                isChecked={props.isChecked}
                onPress={props.onPress}
                text={props.text}
                disabled={props.disabled}
                toggleTooltip={props.toggleTooltip}
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

export default compose(
    withWindowDimensions,
)(CheckboxWithTooltip);
