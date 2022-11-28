import React, {useEffect} from 'react';
import ComposerNative from './index.native';

// Wraps the native composer implementation to add the possibility
// to delay the ref.focus call on android, which is needed for the
// keyboard to open correctly.
export default React.forwardRef((props, forwardedRef) => {
    const ref = React.useRef(null);

    // Overwrite the focus function of the native component
    // and add the possibility to pass a delay flag.
    useEffect(() => {
        const originalFocus = ref.current.focus;
        ref.current.focus = (onDone, delay) => {
            // Keyboard is not opened after Emoji Picker is closed
            // SetTimeout is used as a workaround
            // https://github.com/react-native-modal/react-native-modal/issues/114
            // We carefully choose a delay. 100ms is found enough for keyboard to open.
            setTimeout(() => originalFocus(onDone), delay ? 100 : 0);
        };
        if (forwardedRef) {
            forwardedRef(ref.current);
        }
    }, [ref.current]);

    return (
        <ComposerNative
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            ref={(refObj) => {
                ref.current = refObj;
            }}
        />
    );
});
