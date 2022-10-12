import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import RNTextInput from '../RNTextInput';
import themeColors from '../../styles/themes/default';
import CONST from '../../CONST';
import * as ComposerUtils from '../../libs/ComposerUtils';

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

const propTypes = {
    /** If the input should clear, it actually gets intercepted instead of .clear() */
    shouldClear: PropTypes.bool,

    /** A ref to forward to the text input */
    forwardedRef: PropTypes.func,

    /** When the input has cleared whoever owns this input should know about it */
    onClear: PropTypes.func,

    /** Set focus to this component the first time it renders.
     * Override this in case you need to set focus on one field out of many, or when you want to disable autoFocus */
    autoFocus: PropTypes.bool,

    /** Prevent edits and interactions like focus for this input. */
    isDisabled: PropTypes.bool,

    /** Whether the full composer can be opened */
    isFullComposerAvailable: PropTypes.bool,

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable: PropTypes.func,

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

    /** Called when the text gets changed by user input */
    onChangeText: PropTypes.func,

    /** A value the input should have when it first mounts. Default is empty. */
    defaultValue: PropTypes.string,

    /** If true, the text input can be multiple lines. The default value is false. */
    multiline: PropTypes.bool,

    /** Callback that is called when the text input's text changes. */
    onChange: PropTypes.func,
};

const defaultProps = {
    shouldClear: false,
    onClear: () => {},
    autoFocus: false,
    isDisabled: false,
    forwardedRef: null,
    isFullComposerAvailable: false,
    setIsFullComposerAvailable: () => {},
    style: null,
    onChangeText: () => {},
    defaultValue: '',
    multiline: false,
    onChange: () => {},
};

class Composer extends React.Component {
    constructor(props) {
        super(props);

        this.mostRecentEventCount = 0;
        this.viewCommands = getViewCommands(props.multiline);

        this.onChange = this.onChange.bind(this);
        this.setTextAndSelection = this.setTextAndSelection.bind(this);

        this.state = {
            propStyles: StyleSheet.flatten(this.props.style),
        };
    }

    componentDidMount() {
        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (!this.props.forwardedRef || !_.isFunction(this.props.forwardedRef)) {
            return;
        }
        this.textInput.setTextAndSelection = this.setTextAndSelection;

        this.props.forwardedRef(this.textInput);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.shouldClear || !this.props.shouldClear) {
            return;
        }

        this.textInput.clear();
        this.props.onClear();
    }

    onChange(event) {
        this.mostRecentEventCount = event.nativeEvent.eventCount;
        this.props.onChange(event);
    }

    setTextAndSelection(text, start, end) {
        this.viewCommands.setTextAndSelection(
            this.textInput,
            this.mostRecentEventCount,
            text,
            start,
            end,
        );
    }

    render() {
        return (
            <RNTextInput
                autoComplete="off"
                placeholderTextColor={themeColors.placeholderText}
                ref={el => this.textInput = el}
                maxHeight={this.props.isComposerFullSize ? '100%' : CONST.COMPOSER_MAX_HEIGHT}
                onContentSizeChange={e => ComposerUtils.updateNumberOfLines(this.props, e)}
                rejectResponderTermination={false}
                textAlignVertical="center"
                style={this.state.propStyles}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...this.props}
                editable={!this.props.isDisabled}
                onChange={this.onChange}
            />
        );
    }
}

Composer.propTypes = propTypes;
Composer.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Composer {...props} forwardedRef={ref} />
));
