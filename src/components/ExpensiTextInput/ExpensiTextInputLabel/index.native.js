import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import labelStyles from './overrideLabelStyles';
import propTypes from './expensiTextInputLabelPropTypes';

class ExpensiTextInputLabel extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            width: 0,
        };
    }

    render() {
        return (
            <Animated.Text
                onLayout={({nativeEvent}) => {
                    this.setState({width: nativeEvent.layout.width});
                }}
                style={[
                    styles.expensiTextInputLabel,
                    styles.expensiTextInputLabelTransformation(
                        this.props.labelTranslateY,
                        this.props.labelScale.interpolate({
                            inputRange: [0.8668, 1],
                            outputRange: [-(this.state.width - (this.state.width * 0.8668)) / 2, 0],
                        }),
                        this.props.labelScale,
                    ),
                ]}
            >
                {this.props.label}
            </Animated.Text>
        );
    }
}

ExpensiTextInputLabel.propTypes = propTypes;

export default ExpensiTextInputLabel;
