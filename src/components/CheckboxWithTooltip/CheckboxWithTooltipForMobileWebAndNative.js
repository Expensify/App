import React from 'react';
import {View} from 'react-native';
import Checkbox from '../Checkbox';
import * as checkboxWithTooltipPropTypes from './checkboxWithTooltipPropTypes';
import Growl from '../../libs/Growl';
import withWindowDimensions from '../withWindowDimensions';

class CheckboxWithTooltipForMobileWebAndNative extends React.Component {
    constructor(props) {
        super(props);
        this.showGrowlOrTriggerOnPress = this.showGrowlOrTriggerOnPress.bind(this);
    }

    componentDidUpdate() {
        if (!this.props.toggleTooltip) {
            return;
        }

        Growl.show(this.props.text, this.props.growlType, 3000);
    }

    /**
     * Show warning modal on mobile devices since tooltips are not supported when checkbox is disabled.
     */
    showGrowlOrTriggerOnPress() {
        if (this.props.toggleTooltip) {
            Growl.show(this.props.text, this.props.growlType, 3000);
            return;
        }
        this.props.onPress();
    }

    render() {
        return (
            <View style={this.props.style}>
                <Checkbox
                    isChecked={this.props.isChecked}
                    onPress={this.showGrowlOrTriggerOnPress}
                />
            </View>
        );
    }
}

CheckboxWithTooltipForMobileWebAndNative.propTypes = checkboxWithTooltipPropTypes.propTypes;
CheckboxWithTooltipForMobileWebAndNative.defaultProps = checkboxWithTooltipPropTypes.defaultProps;

export default withWindowDimensions(CheckboxWithTooltipForMobileWebAndNative);
