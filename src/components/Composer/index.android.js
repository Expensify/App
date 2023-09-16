import React, {useEffect, useCallback, useRef, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import RNTextInput from '../RNTextInput';
import themeColors from '../../styles/themes/default';
import * as ComposerUtils from '../../libs/ComposerUtils';

const propTypes = {
    /** Maximum number of lines in the text input */
    maxLines: PropTypes.number,

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
    isFullComposerAvailable: PropTypes.bool,

    /** Allow the full composer to be opened */
    setIsFullComposerAvailable: PropTypes.func,

    /** Whether the composer is full size */
    isComposerFullSize: PropTypes.bool,

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
    maxLines: undefined,
    isFullComposerAvailable: false,
    setIsFullComposerAvailable: () => {},
    isComposerFullSize: false,
    style: null,
};

function Composer({shouldClear, onClear, isDisabled, maxLines, forwardedRef, isComposerFullSize, setIsFullComposerAvailable, ...props}) {
    const textInput = useRef(null);

    /**
     * Set the TextInput Ref
     * @param {Element} el
     */
    const setTextInputRef = useCallback((el) => {
        textInput.current = el;
        if (!_.isFunction(forwardedRef) || textInput.current === null) {
            return;
        }

        // This callback prop is used by the parent component using the constructor to
        // get a ref to the inner textInput element e.g. if we do
        // <constructor ref={el => this.textInput = el} /> this will not
        // return a ref to the component, but rather the HTML element by default
        forwardedRef(textInput.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!shouldClear) {
            return;
        }
        textInput.current.clear();
        onClear();
    }, [shouldClear, onClear]);

    /**
     * Set maximum number of lines
     * @return {Number}
     */
    const maxNumberOfLines = useMemo(() => {
        if (isComposerFullSize) return 1000000;
        return maxLines;
    }, [isComposerFullSize, maxLines]);

    const styles = useMemo(() => {
        StyleSheet.flatten(props.style);
    }, [props.style]);

    return (
        <RNTextInput
            autoComplete="off"
            placeholderTextColor={themeColors.placeholderText}
            ref={setTextInputRef}
            onContentSizeChange={(e) => ComposerUtils.updateNumberOfLines({maxLines, isComposerFullSize, isDisabled, setIsFullComposerAvailable}, e)}
            rejectResponderTermination={false}
            textAlignVertical="center"
            // Setting a really high number here fixes an issue with the `maxNumberOfLines` prop on TextInput, where on Android the text input would collapse to only one line,
            // when it should actually expand to the container (https://github.com/Expensify/App/issues/11694#issuecomment-1560520670)
            // @Szymon20000 is working on fixing this (android-only) issue in the in the upstream PR (https://github.com/facebook/react-native/pulls?q=is%3Apr+is%3Aopen+maxNumberOfLines)
            // TODO: remove this comment once upstream PR is merged and available in a future release
            maxNumberOfLines={maxNumberOfLines}
            style={styles}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...props}
            editable={!isDisabled}
        />
    );
}

Composer.propTypes = propTypes;
Composer.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    <Composer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
