import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import propTypes from './expensiTextInputLabelPropTypes';
import {ACTIVE_LABEL_SCALE, INACTIVE_LABEL_SCALE} from '../styleConst';

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
                            inputRange: [ACTIVE_LABEL_SCALE, INACTIVE_LABEL_SCALE],
                            outputRange: [-(this.state.width - (this.state.width * ACTIVE_LABEL_SCALE)) / 2, 0],
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
