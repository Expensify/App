import React, {useCallback, useMemo, useRef} from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, StyleProp, View, ViewStyle} from 'react-native';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormElement from '@components/FormElement';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import type {SafeAreaChildrenProps} from '@components/SafeAreaConsumer/types';
import ScrollView from '@components/ScrollView';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {Form} from '@src/types/form';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {FormInputErrors, FormProps, InputRefs} from './types';

type FormWrapperOnyxProps = {
    /** Contains the form state that must be accessed outside the component */
    formState: OnyxEntry<Form>;
};

type FormWrapperProps = ChildrenProps &
    FormWrapperOnyxProps &
    FormProps & {
        /** Submit button styles */
        submitButtonStyles?: StyleProp<ViewStyle>;

        /** Whether to apply flex to the submit button */
        submitFlexEnabled?: boolean;

        /** Server side errors keyed by microtime */
        errors: FormInputErrors;

        /** Assuming refs are React refs */
        inputRefs: RefObject<InputRefs>;

        /** Whether the submit button is disabled */
        isSubmitDisabled?: boolean;

        /** Callback to submit the form */
        onSubmit: () => void;
    };

function FormWrapper({
    onSubmit,
    children,
    formState,
    errors,
    inputRefs,
    submitButtonText,
    footerContent,
    isSubmitButtonVisible = true,
    style,
    submitButtonStyles,
    submitFlexEnabled = true,
    enabledWhenOffline,
    isSubmitActionDangerous = false,
    formID,
    shouldUseScrollView = true,
    scrollContextEnabled = false,
    shouldHideFixErrorsAlert = false,
    disablePressOnEnter = true,
    isSubmitDisabled = false,
}: FormWrapperProps) {
    const styles = useThemeStyles();
    const formRef = useRef<RNScrollView>(null);
    const formContentRef = useRef<View>(null);
    const errorMessage = useMemo(() => (formState ? ErrorUtils.getLatestErrorMessage(formState) : undefined), [formState]);

    const onFixTheErrorsLinkPressed = useCallback(() => {
        const errorFields = !isEmptyObject(errors) ? errors : formState?.errorFields ?? {};
        const focusKey = Object.keys(inputRefs.current ?? {}).find((key) => Object.keys(errorFields).includes(key));

        if (!focusKey) {
            return;
        }

        const focusInput = inputRefs.current?.[focusKey]?.current;

        // Dismiss the keyboard for non-text fields by checking if the component has the isFocused method, as only TextInput has this method.
        if (typeof focusInput?.isFocused !== 'function') {
            Keyboard.dismiss();
        }

        // We subtract 10 to scroll slightly above the input
        if (formContentRef.current) {
            // We measure relative to the content root, not the scroll view, as that gives
            // consistent results across mobile and web
            focusInput?.measureLayout?.(formContentRef.current, (X: number, y: number) =>
                formRef.current?.scrollTo({
                    y: y - 10,
                    animated: false,
                }),
            );
        }

        // Focus the input after scrolling, as on the Web it gives a slightly better visual result
        focusInput?.focus?.();
    }, [errors, formState?.errorFields, inputRefs]);

    const scrollViewContent = useCallback(
        (safeAreaPaddingBottomStyle: SafeAreaChildrenProps['safeAreaPaddingBottomStyle']) => (
            <FormElement
                key={formID}
                ref={formContentRef}
                style={[style, safeAreaPaddingBottomStyle.paddingBottom ? safeAreaPaddingBottomStyle : styles.pb5]}
            >
                {children}
                {isSubmitButtonVisible && (
                    <FormAlertWithSubmitButton
                        buttonText={submitButtonText}
                        isDisabled={isSubmitDisabled}
                        isAlertVisible={((!isEmptyObject(errors) || !isEmptyObject(formState?.errorFields)) && !shouldHideFixErrorsAlert) || !!errorMessage}
                        isLoading={!!formState?.isLoading}
                        message={isEmptyObject(formState?.errorFields) ? errorMessage : undefined}
                        onSubmit={onSubmit}
                        footerContent={footerContent}
                        onFixTheErrorsLinkPressed={onFixTheErrorsLinkPressed}
                        containerStyles={[styles.mh0, styles.mt5, submitFlexEnabled ? styles.flex1 : {}, submitButtonStyles]}
                        enabledWhenOffline={enabledWhenOffline}
                        isSubmitActionDangerous={isSubmitActionDangerous}
                        disablePressOnEnter={disablePressOnEnter}
                        enterKeyEventListenerPriority={1}
                    />
                )}
            </FormElement>
        ),
        [
            formID,
            style,
            styles.pb5,
            styles.mh0,
            styles.mt5,
            styles.flex1,
            children,
            isSubmitButtonVisible,
            submitButtonText,
            isSubmitDisabled,
            errors,
            formState?.errorFields,
            formState?.isLoading,
            shouldHideFixErrorsAlert,
            errorMessage,
            onSubmit,
            footerContent,
            onFixTheErrorsLinkPressed,
            submitFlexEnabled,
            submitButtonStyles,
            enabledWhenOffline,
            isSubmitActionDangerous,
            disablePressOnEnter,
        ],
    );

    if (!shouldUseScrollView) {
        return scrollViewContent({});
    }

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) =>
                scrollContextEnabled ? (
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

export default withOnyx<FormWrapperProps, FormWrapperOnyxProps>({
    formState: {
        // withOnyx typings are not able to handle such generic cases like this one, since it's a generic component we need to cast the keys to any
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        key: (props) => props.formID as any,
    },
})(FormWrapper);
