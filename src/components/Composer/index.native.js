import React from 'react';
import {InteractionManager, StyleSheet} from 'react-native';
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
    isComposerFullSize: PropTypes.bool,

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
    isComposerFullSize: false,
    style: null,
    onChangeText: () => {},
    defaultValue: '',
};

class Composer extends React.Component {
    constructor(props) {
        super(props);

        this.onChangeText = this.onChangeText.bind(this);
        this.setText = this.setText.bind(this);
        this.focus = this.focus.bind(this);

        this.state = {
            propStyles: StyleSheet.flatten(this.props.style),
            value: this.props.defaultValue,
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

        // We want this to be an available method on the ref for parent components
        this.textInput.setText = this.setText;
        this.textInput.focusInput = this.textInput.focus;
        this.textInput.focus = this.focus;

        this.props.forwardedRef(this.textInput);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.shouldClear || !this.props.shouldClear) {
            return;
        }

        this.textInput.clear();
        this.props.onClear();
    }

    /**
     * Handler for when the text of the text input changes.
     * Will also propagate change to parent component, via
     * onChangeText prop.
     *
     * @param {String} text
     */
    onChangeText(text) {
        this.setState({value: text});
        this.props.onChangeText(text);
    }

    setText(text) {
        this.setState({value: text});
    }

    focus(onDone, delay) {
        setTimeout(() => {
            // There could be other animations running while we trigger manual focus.
            // This prevents focus from making those animations janky.
            InteractionManager.runAfterInteractions(() => {
                this.textInput.focusInput();
                if (onDone) {
                    onDone();
                }
            });
        }, delay ? 100 : 0);
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
