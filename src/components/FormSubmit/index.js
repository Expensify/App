import React, {useEffect} from 'react';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import * as formSubmitPropTypes from './formSubmitPropTypes';
import CONST from '../../CONST';
import isEnterWhileComposition from '../../libs/KeyboardShortcut/isEnterWhileComposition';
import * as ComponentUtils from '../../libs/ComponentUtils';

function FormSubmit({innerRef, children, onSubmit, style}) {
    /**
     * Calls the submit callback when ENTER is pressed on a form element.
     * @param {Object} event
     */
    const submitForm = (event) => {
        // ENTER is pressed with modifier key or during text composition, do not submit the form
        if (event.shiftKey || event.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey || isEnterWhileComposition(event)) {
            return;
        }

        const tagName = lodashGet(event, 'target.tagName', '');

        // ENTER is pressed on INPUT or SELECT element, call the submit callback.
        if (tagName === 'INPUT' || tagName === 'SELECT') {
            onSubmit();
            return;
        }

        // Pressing Enter on TEXTAREA element adds a new line. When `dataset.submitOnEnter` prop is passed, call the submit callback.
        if (tagName === 'TEXTAREA' && lodashGet(event, 'target.dataset.submitOnEnter', 'false') === 'true') {
            onSubmit();
            return;
        }

        // ENTER is pressed on checkbox element, call the submit callback.
        if (lodashGet(event, 'target.role') === 'checkbox') {
            onSubmit();
        }
    };

    const preventDefaultFormBehavior = (e) => e.preventDefault();

    useEffect(() => {
        const form = innerRef.current;

        // Prevent the browser from applying its own validation, which affects the email input
        form.setAttribute('novalidate', '');

        form.addEventListener('submit', preventDefaultFormBehavior);

        return () => {
            if (!form) {
                return;
            }

            form.removeEventListener('submit', preventDefaultFormBehavior);
        };
    }, [innerRef]);

    return (
        // React-native-web prevents event bubbling on TextInput for key presses
        // https://github.com/necolas/react-native-web/blob/fa47f80d34ee6cde2536b2a2241e326f84b633c4/packages/react-native-web/src/exports/TextInput/index.js#L272
        // Thus use capture phase.
        <View
            accessibilityRole={ComponentUtils.ACCESSIBILITY_ROLE_FORM}
            ref={innerRef}
            onKeyDownCapture={submitForm}
            style={style}
        >
            {children}
        </View>
    );
}

FormSubmit.propTypes = formSubmitPropTypes.propTypes;
FormSubmit.defaultProps = formSubmitPropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    <FormSubmit
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
