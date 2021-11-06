import React, {Component} from 'react';
import {Animated} from 'react-native';
import {setNativePropsWeb} from '../../../libs/TextInputUtils';
import styles from '../../../styles/styles';
import {propTypes, defaultProps} from './expensiTextInputLabelPropTypes';

class ExpensiTextInputLabel extends Component {
    constructor(props) {
        super(props);
        this.label = null;
    }

    componentDidMount() {
        if (this.label && this.props.for) {
            setNativePropsWeb(this.label, 'for', this.props.for);
        }
    }

    render() {
        return (
            <Animated.Text
                pointerEvents="none"
                accessibilityRole="label"
                ref={el => this.label = el}
                style={[
                    styles.expensiTextInputLabel,
                    styles.expensiTextInputLabelDesktop,
                    styles.expensiTextInputLabelTransformation(
                        this.props.labelTranslateY,
                        this.props.labelTranslateX,
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
ExpensiTextInputLabel.defaultProps = defaultProps;
ExpensiTextInputLabel.displayName = 'ExpensiTextInputLabel';

export default ExpensiTextInputLabel;
