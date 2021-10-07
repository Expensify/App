import React from 'react';
import {View} from 'react-native';
import Checkbox from '../Checkbox';
import {propTypes, defaultProps} from './CheckboxWithTooltipPropTypes';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';

class CheckboxWithTooltip extends React.Component {
    constructor(props) {
        super(props);
        this.onPress = this.onPress.bind(this);
    }

    componentDidUpdate() {
        if (this.props.toggleTooltip) {
            Growl.show(this.props.text, CONST.GROWL.WARNING, 3000);
        }
    }

    /**
     * Show warning modal on mobile devices since tooltips are not supported when checkbox is disabled.
     */
    onPress() {
        if (this.props.toggleTooltip) {
            Growl.show(this.props.text, CONST.GROWL.WARNING, 3000);
        }
        this.props.onPress();
    }

    render() {
        return (
            <View style={this.props.style}>
                <Checkbox
                    isChecked={this.props.isChecked}
                    onPress={this.onPress}
                />
            </View>
        );
    }
}

CheckboxWithTooltip.propTypes = propTypes;
CheckboxWithTooltip.defaultProps = defaultProps;
CheckboxWithTooltip.displayName = 'CheckboxWithTooltip';

export default compose(
    withWindowDimensions,
)(CheckboxWithTooltip);
