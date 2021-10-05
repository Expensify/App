import React from 'react';
import {View} from 'react-native';
import Checkbox from '../Checkbox';
import {propTypes, defaultProps} from './CheckboxWithTooltipPropTypes';
import Tooltip from '../Tooltip';

/**
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
const CheckboxWithTooltip = (props) => {
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
export default CheckboxWithTooltip;
