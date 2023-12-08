import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useRef} from 'react';
import {Keyboard, ScrollView, StyleSheet} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormSubmit from '@components/FormSubmit';
import refPropTypes from '@components/refPropTypes';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import * as ErrorUtils from '@libs/ErrorUtils';
import stylePropTypes from '@styles/stylePropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import errorsPropType from './errorsPropType';

const propTypes = {
    /** A unique Onyx key identifying the form */
    formID: PropTypes.string.isRequired,

    /** Text to be displayed in the submit button */
    submitButtonText: PropTypes.string.isRequired,

    /** Controls the submit button's visibility */
    isSubmitButtonVisible: PropTypes.bool,

    /** Callback to submit the form */
    onSubmit: PropTypes.func.isRequired,

    /** Children to render. */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,

    /* Onyx Props */

    /** Contains the form state that must be accessed outside of the component */
    formState: PropTypes.shape({
        /** Controls the loading state of the form */
        isLoading: PropTypes.bool,

        /** Server side errors keyed by microtime */
        errors: errorsPropType,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    /** Should the button be enabled when offline */
    enabledWhenOffline: PropTypes.bool,

    /** Whether the form submit action is dangerous */
    isSubmitActionDangerous: PropTypes.bool,

    /** Whether ScrollWithContext should be used instead of regular ScrollView.
     *  Set to true when there's a nested Picker component in Form.
     */
    scrollContextEnabled: PropTypes.bool,

    /** Container styles */
    style: stylePropTypes,

    /** Submit button styles */
    submitButtonStyles: stylePropTypes,

    /** Custom content to display in the footer after submit button */
    footerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    errors: errorsPropType.isRequired,

    inputRefs: PropTypes.objectOf(refPropTypes).isRequired,
};

const defaultProps = {
    isSubmitButtonVisible: true,
    formState: {
        isLoading: false,
    },
    enabledWhenOffline: false,
    isSubmitActionDangerous: false,
    scrollContextEnabled: false,
    footerContent: null,
    style: [],
    submitButtonStyles: [],
};

function FormWrapper(props) {
    const styles = useThemeStyles();
    const {
        onSubmit,
        children,
        formState,
        errors,
        inputRefs,
        submitButtonText,
        footerContent,
        isSubmitButtonVisible,
        style,
        submitButtonStyles,
        enabledWhenOffline,
        isSubmitActionDangerous,
        formID,
    } = props;
    const formRef = useRef(null);
    const formContentRef = useRef(null);
    const errorMessage = useMemo(() => {
        const latestErrorMessage = ErrorUtils.getLatestErrorMessage(formState);
        return typeof latestErrorMessage === 'string' ? latestErrorMessage : '';
    }, [formState]);

    const scrollViewContent = useCallback(
        (safeAreaPaddingBottomStyle) => (
            <FormSubmit
                key={formID}
                ref={formContentRef}
                style={StyleSheet.flatten([style, safeAreaPaddingBottomStyle])}
                onSubmit={onSubmit}
            >
                {children}
                {isSubmitButtonVisible && (
                    <FormAlertWithSubmitButton
                        buttonText={submitButtonText}
                        isAlertVisible={_.size(errors) > 0 || Boolean(errorMessage) || !_.isEmpty(formState.errorFields)}
                        isLoading={formState.isLoading}
                        message={_.isEmpty(formState.errorFields) ? errorMessage : null}
                        onSubmit={onSubmit}
                        footerContent={footerContent}
                        onFixTheErrorsLinkPressed={() => {
                            const errorFields = !_.isEmpty(errors) ? errors : formState.errorFields;
                            const focusKey = _.find(_.keys(inputRefs.current), (key) => _.keys(errorFields).includes(key));
                            const focusInput = inputRefs.current[focusKey].current;

                            // Dismiss the keyboard for non-text fields by checking if the component has the isFocused method, as only TextInput has this method.
                            if (typeof focusInput.isFocused !== 'function') {
                                Keyboard.dismiss();
                            }

                            // We subtract 10 to scroll slightly above the input
                            if (focusInput.measureLayout && typeof focusInput.measureLayout === 'function') {
                                // We measure relative to the content root, not the scroll view, as that gives
                                // consistent results across mobile and web
                                focusInput.measureLayout(formContentRef.current, (x, y) =>
                                    formRef.current.scrollTo({
                                        y: y - 10,
                                        animated: false,
                                    }),
                                );
                            }

                            // Focus the input after scrolling, as on the Web it gives a slightly better visual result
                            if (focusInput.focus && typeof focusInput.focus === 'function') {
                                focusInput.focus();
                            }
                        }}
                        containerStyles={[styles.mh0, styles.mt5, styles.flex1, ...submitButtonStyles]}
                        enabledWhenOffline={enabledWhenOffline}
                        isSubmitActionDangerous={isSubmitActionDangerous}
                        disablePressOnEnter
                    />
                )}
            </FormSubmit>
        ),
        [
            children,
            enabledWhenOffline,
            errorMessage,
            errors,
            footerContent,
            formID,
            formState.errorFields,
            formState.isLoading,
            inputRefs,
            isSubmitActionDangerous,
            isSubmitButtonVisible,
            onSubmit,
            style,
            styles.flex1,
            styles.mh0,
            styles.mt5,
            submitButtonStyles,
            submitButtonText,
        ],
    );

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) =>
                props.scrollContextEnabled ? (
                    <ScrollViewWithContext
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        ref={formRef}
                    >
                        {scrollViewContent(safeAreaPaddingBottomStyle)}
                    </ScrollViewWithContext>
                ) : (
                    <ScrollView
                        style={[styles.w100, styles.flex1]}
                        contentContainerStyle={styles.flexGrow1}
                        keyboardShouldPersistTaps="handled"
                        ref={formRef}
                    >
                        {scrollViewContent(safeAreaPaddingBottomStyle)}
                    </ScrollView>
                )
            }
        </SafeAreaConsumer>
    );
}

FormWrapper.displayName = 'FormWrapper';
FormWrapper.propTypes = propTypes;
FormWrapper.defaultProps = defaultProps;

export default withOnyx({
    formState: {
        key: (props) => props.formID,
    },
})(FormWrapper);
