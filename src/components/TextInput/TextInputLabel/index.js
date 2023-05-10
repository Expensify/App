import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import styles from '../../../styles/styles';
import {propTypes, defaultProps} from './TextInputLabelPropTypes';

class TextInputLabel extends PureComponent {
    componentDidMount() {
        if (!this.props.for) {
            return;
        }
        this.label.setAttribute('for', this.props.for);
    }

    render() {
        return (
            <Animated.Text
                pointerEvents="none"
                accessibilityRole="label"
                ref={el => this.label = el}
                style={[
                    styles.textInputLabel,
                    styles.textInputLabelDesktop,
                    styles.textInputLabelTransformation(
                        this.props.labelTranslateY,
                        0,
                        this.props.labelScale,
                    ),
                ]}
            >
                {this.props.label}
            </Animated.Text>
        );
    }
}

TextInputLabel.propTypes = propTypes;
TextInputLabel.defaultProps = defaultProps;

export default TextInputLabel;
