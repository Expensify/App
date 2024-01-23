import React, {useCallback, useMemo, useRef} from 'react';
import type {RefObject} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';
import {Keyboard, ScrollView} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormSubmit from '@components/FormSubmit';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import type {SafeAreaChildrenProps} from '@components/SafeAreaConsumer/types';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {Form} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {FormProps, InputRefs} from './types';

type FormWrapperOnyxProps = {
    /** Contains the form state that must be accessed outside the component */
    formState: OnyxEntry<Form>;
};

type FormWrapperProps = ChildrenProps &
    FormWrapperOnyxProps &
    FormProps & {
        /** Submit button styles */
        submitButtonStyles?: StyleProp<ViewStyle>;

        /** Server side errors keyed by microtime */
        errors: Errors;

        /** Assuming refs are React refs */
        inputRefs: RefObject<InputRefs>;

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
    enabledWhenOffline,
    isSubmitActionDangerous = false,
    formID,
    scrollContextEnabled = false,
    shouldHideFixErrorsAlert = false,
}: FormWrapperProps) {
    const styles = useThemeStyles();
    const formRef = useRef<ScrollView>(null);
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
            <FormSubmit
                key={formID}
                ref={formContentRef}
                style={[style, safeAreaPaddingBottomStyle]}
                onSubmit={onSubmit}
            >
                {children}
                {isSubmitButtonVisible && (
                    <FormAlertWithSubmitButton
                        buttonText={submitButtonText}
                        isAlertVisible={((!isEmptyObject(errors) || !isEmptyObject(formState?.errorFields)) && !shouldHideFixErrorsAlert) || !!errorMessage}
                        isLoading={!!formState?.isLoading}
                        message={isEmptyObject(formState?.errorFields) ? errorMessage : undefined}
                        onSubmit={onSubmit}
                        footerContent={footerContent}
                        onFixTheErrorsLinkPressed={onFixTheErrorsLinkPressed}
                        containerStyles={[styles.mh0, styles.mt5, styles.flex1, submitButtonStyles]}
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
            formState?.errorFields,
            formState?.isLoading,
            isSubmitActionDangerous,
            isSubmitButtonVisible,
            onSubmit,
            style,
            styles.flex1,
            styles.mh0,
            styles.mt5,
            submitButtonStyles,
            submitButtonText,
            shouldHideFixErrorsAlert,
            onFixTheErrorsLinkPressed,
        ],
    );

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
