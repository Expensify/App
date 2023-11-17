import React, {ForwardedRef, useEffect, useRef} from 'react';
import * as Browser from '@libs/Browser';
import DomUtils from '@libs/DomUtils';
import Visibility from '@libs/Visibility';
import styles from '@styles/styles';
import BaseTextInput from './BaseTextInput';
import * as baseTextInputPropTypes from './BaseTextInput/baseTextInputPropTypes';
import BaseTextInputProps from './BaseTextInput/types';
import * as styleConst from './styleConst';

function TextInput(props: BaseTextInputProps, ref: ForwardedRef<HTMLFormElement>) {
    const textInputRef = useRef<HTMLFormElement>(null);
    const removeVisibilityListenerRef = useRef<() => void>(null);

    useEffect(() => {
        if (props.disableKeyboard) {
            textInputRef.current?.setAttribute('inputmode', 'none');
        }

        if (props.name) {
            textInputRef.current?.setAttribute('name', props.name);
        }
        // @ts-expect-error We need to reassign this ref to the input ref
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

    const isLabeledMultiline = Boolean(props.label?.length) && props.multiline;
    const labelAnimationStyle = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--active-label-translate-y': `${styleConst.ACTIVE_LABEL_TRANSLATE_Y}px`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--active-label-scale': `${styleConst.ACTIVE_LABEL_SCALE}`,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '--label-transition-duration': `${styleConst.LABEL_ANIMATION_DURATION}ms`,
    };

    return (
        <BaseTextInput
            innerRef={(el: HTMLFormElement | null) => {
                // @ts-expect-error We need to reassign this ref to the input ref
                textInputRef.current = el;
                if (!ref) {
                    return;
                }

                if (typeof ref === 'function') {
                    ref(el);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                ref.current = el;
            }}
            inputStyle={[styles.baseTextInput, styles.textInputDesktop, isLabeledMultiline ? styles.textInputMultiline : {}, props.inputStyle]}
            textInputContainerStyles={[labelAnimationStyle, props.textInputContainerStyles]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

TextInput.displayName = 'TextInput';
TextInput.propTypes = baseTextInputPropTypes.propTypes;
TextInput.defaultProps = baseTextInputPropTypes.defaultProps;

export default React.forwardRef(TextInput);
