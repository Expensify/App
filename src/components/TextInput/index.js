import React, {useEffect, useRef} from 'react';
import _ from 'underscore';
import * as Browser from '@libs/Browser';
import DomUtils from '@libs/DomUtils';
import Visibility from '@libs/Visibility';
import useThemeStyles from '@styles/useThemeStyles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './BaseTextInput/baseTextInputPropTypes';
import * as styleConst from './styleConst';

function TextInput(props) {
    const styles = useThemeStyles();
    const textInputRef = useRef(null);
    const removeVisibilityListenerRef = useRef(null);

    useEffect(() => {
        if (props.disableKeyboard) {
            textInputRef.current.setAttribute('inputmode', 'none');
        }

        if (props.name) {
            textInputRef.current.setAttribute('name', props.name);
        }

        removeVisibilityListenerRef.current = Visibility.onVisibilityChange(() => {
            if (!Browser.isMobileChrome() || !Visibility.isVisible() || !textInputRef.current || DomUtils.getActiveElement() !== textInputRef.current) {
                return;
            }
            textInputRef.current.blur();
            textInputRef.current.focus();
        });

        return () => {
            if (!removeVisibilityListenerRef.current) {
                return;
            }
            removeVisibilityListenerRef.current();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isLabeledMultiline = Boolean(props.label.length) && props.multiline;
    const labelAnimationStyle = {
        '--active-label-translate-y': `${styleConst.ACTIVE_LABEL_TRANSLATE_Y}px`,
        '--active-label-scale': `${styleConst.ACTIVE_LABEL_SCALE}`,
        '--label-transition-duration': `${styleConst.LABEL_ANIMATION_DURATION}ms`,
    };

    return (
        <BaseTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            innerRef={(el) => {
                textInputRef.current = el;
                if (!props.innerRef) {
                    return;
                }

                if (_.isFunction(props.innerRef)) {
                    props.innerRef(el);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                props.innerRef.current = el;
            }}
            inputStyle={[styles.baseTextInput, styles.textInputDesktop, isLabeledMultiline ? styles.textInputMultiline : {}, ...props.inputStyle]}
            textInputContainerStyles={[labelAnimationStyle, ...props.textInputContainerStyles]}
        />
    );
}

TextInput.displayName = 'TextInput';
TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;

const TextInputWithRef = React.forwardRef((props, ref) => (
    <TextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

TextInputWithRef.displayName = 'TextInputWithRef';

export default TextInputWithRef;
