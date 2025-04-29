import type {ForwardedRef} from 'react';
import React, {useEffect, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import DomUtils from '@libs/DomUtils';
import Visibility from '@libs/Visibility';
import BaseTextInput from './BaseTextInput';
import type {BaseTextInputProps, BaseTextInputRef} from './BaseTextInput/types';
import * as styleConst from './styleConst';

type RemoveVisibilityListener = () => void;

function TextInput(props: BaseTextInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const styles = useThemeStyles();
    const textInputRef = useRef<HTMLFormElement | null>(null);
    const removeVisibilityListenerRef = useRef<RemoveVisibilityListener>(null);

    useEffect(() => {
        let removeVisibilityListener = removeVisibilityListenerRef.current;
        if (props.disableKeyboard) {
            textInputRef.current?.setAttribute('inputmode', 'none');
        }

        if (props.name) {
            textInputRef.current?.setAttribute('name', props.name);
        }

        removeVisibilityListener = Visibility.onVisibilityChange(() => {
            if (!Browser.isMobileChrome() || !Visibility.isVisible() || !textInputRef.current || DomUtils.getActiveElement() !== textInputRef.current) {
                return;
            }
            textInputRef.current.blur();
            textInputRef.current.focus();
        });

        return () => {
            if (!removeVisibilityListener) {
                return;
            }
            removeVisibilityListener();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const isLabeledMultiline = !!props.label?.length && props.multiline;
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={(element) => {
                textInputRef.current = element as HTMLFormElement;

                if (!ref) {
                    return;
                }

                if (typeof ref === 'function') {
                    ref(element);
                    return;
                }

                // eslint-disable-next-line no-param-reassign
                ref.current = element;
            }}
            inputStyle={[styles.baseTextInput, styles.textInputDesktop, isLabeledMultiline ? styles.textInputMultiline : {}, props.inputStyle]}
            textInputContainerStyles={[labelAnimationStyle as StyleProp<ViewStyle>, props.textInputContainerStyles]}
        />
    );
}

TextInput.displayName = 'TextInput';

export default React.forwardRef(TextInput);
