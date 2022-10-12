import React, {useCallback, useMemo, useRef} from 'react';
import _ from 'underscore';
// eslint-disable-next-line no-restricted-imports
import {Platform, TextInput} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,

    /** If true, the text input can be multiple lines. The default value is false. */
    multiline: PropTypes.bool,

    /** Callback that is called when the text input's text changes. */
    onChange: PropTypes.func,
};

const defaultProps = {
    forwardedRef: () => {},
    multiline: false,
    onChange: () => {},
};

// Getting the commands module of the TextInput native component
// See: https://github.com/facebook/react-native/blob/4a786d6b0d7a3420afdfb6b136d2ee3fa3b53145/Libraries/Components/TextInput/TextInput.js#L40
let AndroidTextInputCommands;
let RCTSinglelineTextInputNativeCommands;
let RCTMultilineTextInputNativeCommands;
if (Platform.OS === 'android') {
    AndroidTextInputCommands = require('react-native/Libraries/Components/TextInput/AndroidTextInputNativeComponent').Commands;
} else if (Platform.OS === 'ios') {
    RCTSinglelineTextInputNativeCommands = require('react-native/Libraries/Components/TextInput/RCTSingelineTextInputNativeComponent').Commands;
    RCTMultilineTextInputNativeCommands = require('react-native/Libraries/Components/TextInput/RCTMultilineTextInputNativeComponent').Commands;
}

const getViewCommands = (multiline) => {
    let viewCommands;
    if (AndroidTextInputCommands) {
        viewCommands = AndroidTextInputCommands;
    } else {
        viewCommands = multiline === true
            ? RCTMultilineTextInputNativeCommands
            : RCTSinglelineTextInputNativeCommands;
    }
    return viewCommands;
};

const RNTextInput = (props) => {
    const mostRecentEventCount = useRef(0);
    const viewCommands = useMemo(() => getViewCommands(props.multiline), [props.multiline]);

    const onChange = useCallback((event) => {
        mostRecentEventCount.current = event.nativeEvent.eventCount;
        props.onChange(event);
    }, [props.onChange]);

    const forwardRef = useCallback((ref) => {
        if (!_.isFunction(props.forwardedRef)) {
            return;
        }

        // Add the setTextAndSelection method to the ref
        if (ref != null) {
            // eslint-disable-next-line no-param-reassign
            ref.setTextAndSelection = (text, start, end) => {
                console.debug('[HGD] RNTextInput.setTextAndSelection', text, start, end);
                viewCommands.setTextAndSelection(ref, mostRecentEventCount.current, text, start, end);
            };
        }

        props.forwardedRef(ref);
    }, [props.forwardedRef, viewCommands]);

    return (
        <TextInput
            ref={forwardRef}

            // By default, align input to the left to override right alignment in RTL mode which is not yet supported in the App.
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            textAlign="left"

            // eslint-disable-next-line
            {...props}

            onChange={onChange}
        />
    );
};

RNTextInput.propTypes = propTypes;
RNTextInput.defaultProps = defaultProps;
RNTextInput.displayName = 'RNTextInput';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <RNTextInput {...props} forwardedRef={ref} />
));
