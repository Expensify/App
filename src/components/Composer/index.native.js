import React from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import RNTextInput from '../RNTextInput';
import themeColors from '../../styles/themes/default';
import CONST from '../../CONST';
import * as ComposerUtils from '../../libs/ComposerUtils';

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
};

class Composer extends React.Component {
    constructor(props) {
        super(props);

        this.onChangeText = this.onChangeText.bind(this);
        this.setText = this.setText.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.state = {
            propStyles: StyleSheet.flatten(this.props.style),
            value: props.defaultValue,
        };
    }

    componentDidMount() {
        // We pass the ref to the native view instance,
        // however, we want this method to be
        // available to be called from the outside as well.
        this.textInput.setText = this.setText;
        this.textInput.updateSelection = this.updateSelection;

        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        if (!this.props.forwardedRef || !_.isFunction(this.props.forwardedRef)) {
            return;
        }

        this.props.forwardedRef(this.textInput);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.shouldClear || !this.props.shouldClear) {
            return;
        }

        this.textInput.clear();
        this.props.onClear();
    }

    onChangeText(text) {
        this.setText(text);
        this.props.onChangeText(text);
    }

    setText(text) {
        this.setState({value: text});
    }

    updateSelection(selection) {
        if (this.textInput == null || selection == null) {
            return;
        }
        this.textInput.setSelection(selection.start, selection.end);
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
                onChangeText={this.onChangeText}

                // We have a value explicitly set so the value can be changed imperatively
                // (needed e.g. when we are injecting emojis into the text view)
                // Can be avoided once: https://github.com/facebook/react-native/pull/34955 gets merged
                value={this.state.value}
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
