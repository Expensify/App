import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import {setBrowserAttributes} from '../../../libs/TextInputUtils';
import styles from '../../../styles/styles';
import {propTypes, defaultProps} from './expensiTextInputLabelPropTypes';

class ExpensiTextInputLabel extends PureComponent {
    constructor(props) {
        super(props);
        this.label = null;
    }

    componentDidMount() {
        if (!this.props.for) {
            return;
        }
        setBrowserAttributes(this.label, 'for', this.props.for);
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

export default ExpensiTextInputLabel;
