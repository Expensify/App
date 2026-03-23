import React, {useEffect, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileChrome} from '@libs/Browser';
import DomUtils from '@libs/DomUtils';
import Visibility from '@libs/Visibility';
import CONST from '@src/CONST';
import BaseTextInput from './BaseTextInput';
import type {BaseTextInputProps} from './BaseTextInput/types';
import * as styleConst from './styleConst';

let isRestoringKeyboardFocus = false;

function getIsRestoringKeyboardFocus() {
    return isRestoringKeyboardFocus;
}

function TextInput({ref, ...props}: BaseTextInputProps) {
    const styles = useThemeStyles();
    const textInputRef = useRef<HTMLFormElement | null>(null);
    const removeVisibilityListenerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (props.disableKeyboard) {
            textInputRef.current?.setAttribute('inputmode', 'none');
        }

        if (props.name) {
            textInputRef.current?.setAttribute('name', props.name);
        }

        // On mobile Chrome, restore keyboard after returning from background via blur/refocus with a delay.
        // See: https://developer.android.com/develop/ui/views/touch-and-input/keyboard-input/visibility#ShowReliably
        let focusTimeoutId: ReturnType<typeof setTimeout>;
        let flagResetTimeoutId: ReturnType<typeof setTimeout>;

        const restoreKeyboardFocus = () => {
            if (isRestoringKeyboardFocus || !textInputRef.current || DomUtils.getActiveElement() !== textInputRef.current) {
                return;
            }

            const inputElement = textInputRef.current;
            isRestoringKeyboardFocus = true;

            inputElement.blur();
            focusTimeoutId = setTimeout(() => {
                if (DomUtils.getActiveElement() !== document.body) {
                    isRestoringKeyboardFocus = false;
                    return;
                }
                inputElement.focus();
                flagResetTimeoutId = setTimeout(() => {
                    isRestoringKeyboardFocus = false;
                }, CONST.KEYBOARD_RESTORATION_FLAG_RESET_DELAY);
            }, CONST.ANIMATED_TRANSITION);
        };

        if (typeof window !== 'undefined' && isMobileChrome()) {
            window.addEventListener('focus', restoreKeyboardFocus);
        }

        let removeVisibilityListener = removeVisibilityListenerRef.current;
        removeVisibilityListener = Visibility.onVisibilityChange(() => {
            if (!isMobileChrome() || !Visibility.isVisible()) {
                return;
            }
            restoreKeyboardFocus();
        });

        return () => {
            clearTimeout(focusTimeoutId);
            clearTimeout(flagResetTimeoutId);
            isRestoringKeyboardFocus = false;
            if (typeof window !== 'undefined') {
                window.removeEventListener('focus', restoreKeyboardFocus);
            }
            if (removeVisibilityListener) {
                removeVisibilityListener();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            textInputContainerStyles={[labelAnimationStyle as StyleProp<ViewStyle>, props.textInputContainerStyles, styles.cursorText]}
        />
    );
}

export default TextInput;
export {getIsRestoringKeyboardFocus};
