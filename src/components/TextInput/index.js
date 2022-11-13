import React from 'react';
import _ from 'underscore';
import styles from '../../styles/styles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';

class TextInput extends React.Component {
    componentDidMount() {
        if (this.props.disableKeyboard) {
            this.textInput.setAttribute('inputmode', 'none');
        }

        if (this.props.name) {
            this.textInput.setAttribute('name', this.props.name);
        }
    }

    render() {
        const isLabeledMultiline = Boolean(this.props.label.length) && this.props.multiline;

        return (
            <BaseTextInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                innerRef={(el) => {
                    this.textInput = el;
                    if (!this.props.innerRef) {
                        return;
                    }

                    if (_.isFunction(this.props.innerRef)) {
                        this.props.innerRef(el);
                        return;
                    }

                    this.props.innerRef.current = el;
                }}
                inputStyle={[
                    styles.baseTextInput,
                    styles.textInputDesktop,
                    isLabeledMultiline ? styles.textInputMultiline : {},
                    ...this.props.inputStyle,
                ]}
            />
        );
    }
}

TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <TextInput {...props} innerRef={ref} />
));
