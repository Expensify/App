import React, {KeyboardEvent, useEffect} from 'react';
import {View} from 'react-native';
import * as ComponentUtils from '@libs/ComponentUtils';
import isEnterWhileComposition from '@libs/KeyboardShortcut/isEnterWhileComposition';
import CONST from '@src/CONST';
import {FormSubmitProps, FormSubmitRef} from './types';

function FormSubmit({children, onSubmit, style}: FormSubmitProps, ref: FormSubmitRef) {
    /**
     * Calls the submit callback when ENTER is pressed on a form element.
     */
    const submitForm = (event: KeyboardEvent) => {
        // ENTER is pressed with modifier key or during text composition, do not submit the form
        if (event.shiftKey || event.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || isEnterWhileComposition(event)) {
            return;
        }

        const eventTarget = event.target as HTMLElement;

        const tagName = eventTarget?.tagName ?? '';

        // ENTER is pressed on INPUT or SELECT element, call the submit callback.
        if (tagName === 'INPUT' || tagName === 'SELECT') {
            onSubmit();
            return;
        }

        // Pressing Enter on TEXTAREA element adds a new line. When `dataset.submitOnEnter` prop is passed, call the submit callback.
        if (tagName === 'TEXTAREA' && (eventTarget?.dataset?.submitOnEnter ?? 'false') === 'true') {
            event.preventDefault();
            onSubmit();
            return;
        }

        // ENTER is pressed on checkbox element, call the submit callback.
        if (eventTarget?.role === 'checkbox') {
            onSubmit();
        }
    };

    const preventDefaultFormBehavior = (e: SubmitEvent) => e.preventDefault();

    useEffect(() => {
        if (!(ref && 'current' in ref)) {
            return;
        }

        const form = ref.current as HTMLFormElement | null;

        if (!form) {
            return;
        }

        // Prevent the browser from applying its own validation, which affects the email input
        form.setAttribute('novalidate', '');

        form.addEventListener('submit', preventDefaultFormBehavior);

        return () => {
            if (!form) {
                return;
            }

            form.removeEventListener('submit', preventDefaultFormBehavior);
        };
    }, [ref]);

    return (
        // React-native-web prevents event bubbling on TextInput for key presses
        // https://github.com/necolas/react-native-web/blob/fa47f80d34ee6cde2536b2a2241e326f84b633c4/packages/react-native-web/src/exports/TextInput/index.js#L272
        // Thus use capture phase.
        <View
            role={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
            ref={ref}
            onKeyDownCapture={submitForm}
            style={style}
        >
            {children}
        </View>
    );
}

FormSubmit.displayName = 'FormSubmitWithRef';

export default React.forwardRef(FormSubmit);
