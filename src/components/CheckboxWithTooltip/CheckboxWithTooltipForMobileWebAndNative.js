import React from 'react';
import {View} from 'react-native';
import Checkbox from '../Checkbox';
import {propTypes, defaultProps} from './CheckboxWithTooltipPropTypes';
import Growl from '../../libs/Growl';
import withWindowDimensions from '../withWindowDimensions';

class CheckboxWithTooltipForMobileWebAndNative extends React.Component {
    constructor(props) {
        super(props);
        this.showGrowlAndTriggerOnPress = this.showGrowlAndTriggerOnPress.bind(this);
    }

    componentDidUpdate() {
        if (this.props.toggleTooltip) {
            Growl.show(this.props.text, this.props.growlType, 3000);
        }
    }

    /**
     * Show warning modal on mobile devices since tooltips are not supported when checkbox is disabled.
     */
    showGrowlAndTriggerOnPress() {
        if (this.props.toggleTooltip) {
            Growl.show(this.props.text, this.props.growlType, 3000);
        }
        this.props.onPress();
    }

    render() {
        return (
            <View style={this.props.style}>
                <Checkbox
                    isChecked={this.props.isChecked}
                    onPress={this.showGrowlAndTriggerOnPress}
                />
            </View>
        );
    }
}

CheckboxWithTooltipForMobileWebAndNative.propTypes = propTypes;
CheckboxWithTooltipForMobileWebAndNative.defaultProps = defaultProps;

export default withWindowDimensions(CheckboxWithTooltipForMobileWebAndNative);
