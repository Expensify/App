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
                            outputRange: [-(this.state.width - this.state.width * styleConst.ACTIVE_LABEL_SCALE) / 2, 0],
                        }),
                        this.props.labelScale,
                    ),

                    // If the label is active but the width is not ready yet, the above translateX value will be 0,
                    // making the label sits at the top center instead of the top left of the input. To solve it
                    // move the label by a percentage value with left style as translateX doesn't support percentage value.
                    this.state.width === 0 &&
                        this.props.isLabelActive && {
                            left: `${-((1 - styleConst.ACTIVE_LABEL_SCALE) * 100) / 2}%`,
                        },
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
