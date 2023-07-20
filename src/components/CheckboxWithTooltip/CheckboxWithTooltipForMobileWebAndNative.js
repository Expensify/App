import React, {useEffect} from 'react';
import {View} from 'react-native';
import Checkbox from '../Checkbox';
import {propTypes, defaultProps} from './checkboxWithTooltipPropTypes';
import Growl from '../../libs/Growl';
import withWindowDimensions from '../withWindowDimensions';
import usePrevious from '../../hooks/usePrevious';

function CheckboxWithTooltipForMobileWebAndNative({toggleTooltip, text, growlType, onPress, style, isChecked, disabled, accessibilityLabel}) {
    const previousToggleTooltip = usePrevious(toggleTooltip);

    useEffect(() => {
        if (!toggleTooltip) {
            return;
        }

        if (previousToggleTooltip !== toggleTooltip) {
            Growl.show(text, growlType, 3000);
        }
    }, [toggleTooltip, text, growlType, previousToggleTooltip]);

    /**
     * Show warning modal on mobile devices since tooltips are not supported when checkbox is disabled.
     */
    function showGrowlOrTriggerOnPress() {
        if (toggleTooltip) {
            Growl.show(text, growlType, 3000);
            return;
        }

        onPress();
    }

    return (
        <View style={style}>
            <Checkbox
                isChecked={isChecked}
                // eslint-disable-next-line react/jsx-no-bind
                onPress={showGrowlOrTriggerOnPress}
                disabled={disabled}
                accessibilityLabel={accessibilityLabel || text}
            />
        </View>
    );
}

CheckboxWithTooltipForMobileWebAndNative.propTypes = propTypes;
CheckboxWithTooltipForMobileWebAndNative.defaultProps = defaultProps;

export default withWindowDimensions(CheckboxWithTooltipForMobileWebAndNative);
