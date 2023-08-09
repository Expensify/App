import React, {useState} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import * as TextInputLabelPropTypes from './TextInputLabelPropTypes';
import * as styleConst from '../styleConst';

function TextInputLabel(props) {
    const [width, setWidth] = useState(0);

    return (
        <Animated.Text
            allowFontScaling={false}
            onLayout={({nativeEvent}) => {
                setWidth(nativeEvent.layout.width);
            }}
            style={[
                styles.textInputLabel,
                styles.textInputLabelTransformation(
                    props.labelTranslateY,
                    props.labelScale.interpolate({
                        inputRange: [styleConst.ACTIVE_LABEL_SCALE, styleConst.INACTIVE_LABEL_SCALE],
                        outputRange: [-(width - width * styleConst.ACTIVE_LABEL_SCALE) / 2, 0],
                    }),
                    props.labelScale,
                ),
                // If the label is active but the width is not ready yet, the above translateX value will be 0,
                // making the label sits at the top center instead of the top left of the input. To solve it
                // move the label by a percentage value with left style as translateX doesn't support percentage value.
                width === 0 &&
                    props.isLabelActive && {
                        left: `${-((1 - styleConst.ACTIVE_LABEL_SCALE) * 100) / 2}%`,
                    },
            ]}
        >
            {props.label}
        </Animated.Text>
    );
}

TextInputLabel.propTypes = TextInputLabelPropTypes.propTypes;
TextInputLabel.defaultProps = TextInputLabelPropTypes.defaultProps;
TextInputLabel.displayName = 'TextInputLabel';

export default TextInputLabel;
