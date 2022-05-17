import React from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import RNTextInput from '../RNTextInput';
import themeColors from '../../styles/themes/default';
import CONST from '../../CONST';

/**
 * On native layers we like to have the Text Input not focused so the user can read new chats without they keyboard in
 * the way of the view
 * On Android, the selection prop is required on the TextInput but this prop has issues on IOS
 * https://github.com/facebook/react-native/issues/29063
 */

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

    /** Selection Object */
    selection: PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
    }),

    /** Whether the full composer can be opened */
    isFullComposerAvailable: PropTypes.bool.isRequired,

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable: PropTypes.func,

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** General styles to apply to the text input */
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,

};

const defaultProps = {
    shouldClear: false,
    onClear: () => {},
    autoFocus: false,
    isDisabled: false,
    forwardedRef: null,
    selection: {
        start: 0,
        end: 0,
    },
    setIsFullComposerAvailable: () => {},
    style: null,
};

class Composer extends React.Component {
    constructor(props) {
        super(props);

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
     * Calculates the max number of lines the text input can have
     *
     * @param {Number} lineHeight
     * @param {Number} paddingTopAndBottom
     * @param {Number} scrollHeight
     *
     * @returns {Number}
     */
    getNumberOfLines(lineHeight, paddingTopAndBottom, scrollHeight) {
        return Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
    }

    /**
     * Check the current scrollHeight of the textarea (minus any padding) and
     * divide by line height to get the total number of rows for the textarea.
     * @param {Event} e
     */
    updateNumberOfLines(e) {
        const lineHeight = this.state.propStyles.lineHeight;
        const paddingTopAndBottom = this.state.propStyles.paddingVertical * 2;
        const inputHeight = lodashGet(e, 'nativeEvent.contentSize.height', null);
        if (!inputHeight) {
            return;
        }
        const numberOfLines = this.getNumberOfLines(lineHeight, paddingTopAndBottom, inputHeight);
        this.updateIsFullComposerAvailable(numberOfLines);
    }

    /**
     * Update isFullComposerAvailable if needed
     * @param {Number} numberOfLines The number of lines in the text input
     */
    updateIsFullComposerAvailable(numberOfLines) {
        let isFullComposerAvailable = false;
        if (numberOfLines >= CONST.REPORT.FULL_COMPOSER_MIN_LINES) {
            isFullComposerAvailable = true;
        }
        if (isFullComposerAvailable !== this.props.isFullComposerAvailable) {
            this.props.setIsFullComposerAvailable(isFullComposerAvailable);
        }
    }

    render() {
        // Remove the selection property since it doesn't work in iOS
        const propsToPass = _.omit(this.props, 'selection');
        return (
            <RNTextInput
                autoComplete="off"
                placeholderTextColor={themeColors.placeholderText}
                ref={el => this.textInput = el}
                onChange={() => this.updateNumberOfLines()}
                onContentSizeChange={e => this.updateNumberOfLines(e)}
                rejectResponderTermination={false}
                style={this.state.propStyles}
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...propsToPass}
                editable={!this.props.isDisabled}
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
