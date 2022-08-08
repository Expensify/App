import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import * as TextInputLabelPropTypes from './TextInputLabelPropTypes';
import * as styleConst from '../styleConst';

class TextInputLabel extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            width: 0,
        };
    }

    render() {
        return (
            <Animated.Text
                allowFontScaling={false}
                onLayout={({nativeEvent}) => {
                    this.setState({width: nativeEvent.layout.width});
                }}
                style={[
                    styles.textInputLabel,
                    styles.textInputLabelTransformation(
                        this.props.labelTranslateY,
                        this.props.labelScale.interpolate({
                            inputRange: [styleConst.ACTIVE_LABEL_SCALE, styleConst.INACTIVE_LABEL_SCALE],
                            outputRange: [-(this.state.width - (this.state.width * styleConst.ACTIVE_LABEL_SCALE)) / 2, 0],
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

TextInputLabel.propTypes = TextInputLabelPropTypes.propTypes;
TextInputLabel.defaultProps = TextInputLabelPropTypes.defaultProps;

export default TextInputLabel;
