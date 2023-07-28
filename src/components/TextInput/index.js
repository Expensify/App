import React from 'react';
import _ from 'underscore';
import styles from '../../styles/styles';
import * as styleConst from './styleConst';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './baseTextInputPropTypes';
import DomUtils from '../../libs/DomUtils';
import Visibility from '../../libs/Visibility';

class TextInput extends React.Component {
    componentDidMount() {
        if (this.props.disableKeyboard) {
            this.textInput.setAttribute('inputmode', 'none');
        }

        if (this.props.name) {
            this.textInput.setAttribute('name', this.props.name);
        }

        // Forcefully activate the soft keyboard when the user switches between tabs while input was focused.
        this.removeVisibilityListener = Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible() || !this.textInput || DomUtils.getActiveElement() !== this.textInput) {
                return;
            }
            this.textInput.blur();
            this.textInput.focus();
        });
    }

    componentWillUnmount() {
        if (!this.removeVisibilityListener) {
            return;
        }
        this.removeVisibilityListener();
    }

    render() {
        const isLabeledMultiline = Boolean(this.props.label.length) && this.props.multiline;
        const labelAnimationStyle = {
            '--active-label-translate-y': `${styleConst.ACTIVE_LABEL_TRANSLATE_Y}px`,
            '--active-label-scale': `${styleConst.ACTIVE_LABEL_SCALE}`,
            '--label-transition-duration': `${styleConst.LABEL_ANIMATION_DURATION}ms`,
        };

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
                inputStyle={[styles.baseTextInput, styles.textInputDesktop, isLabeledMultiline ? styles.textInputMultiline : {}, ...this.props.inputStyle]}
                textInputContainerStyles={[labelAnimationStyle, ...this.props.textInputContainerStyles]}
            />
        );
    }
}

TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    <TextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
