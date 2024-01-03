import React, {MutableRefObject, useCallback, useMemo, useRef} from 'react';
import {Keyboard, ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormSubmit from '@components/FormSubmit';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import {SafeAreaChildrenProps} from '@components/SafeAreaConsumer/types';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {Form} from '@src/types/onyx';
import {Errors} from '@src/types/onyx/OnyxCommon';
import ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {FormProps, InputRefs} from './types';

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
        inputRefs: MutableRefObject<InputRefs>;
    };

function FormWrapper({
    onSubmit,
    children,
    formState,
    errors,
    inputRefs,
    submitButtonText,
    footerContent = null,
    isSubmitButtonVisible = true,
    style,
    submitButtonStyles,
    enabledWhenOffline,
    isSubmitActionDangerous = false,
    formID,
    scrollContextEnabled = false,
}: FormWrapperProps) {
    const styles = useThemeStyles();
    const formRef = useRef<ScrollView | null>(null);
    const formContentRef = useRef<View | null>(null);
    const errorMessage = useMemo(() => (formState ? ErrorUtils.getLatestErrorMessage(formState) : undefined), [formState]);

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
                        isAlertVisible={!isEmptyObject(errors) || !!errorMessage || !isEmptyObject(formState?.errorFields)}
                        isLoading={!!formState?.isLoading}
                        // eslint-disable-next-line no-extra-boolean-cast
                        message={isEmptyObject(formState?.errorFields) ? errorMessage : undefined}
                        onSubmit={onSubmit}
                        footerContent={footerContent}
                        onFixTheErrorsLinkPressed={() => {
                            const errorFields = !isEmptyObject(errors) ? errors : formState?.errorFields ?? {};
                            const focusKey = Object.keys(inputRefs.current ?? {}).find((key) => Object.keys(errorFields).includes(key));

                            if (!focusKey) {
                                return;
                            }

                            const inputRef = inputRefs.current?.[focusKey];
                            const focusInput = inputRef && 'current' in inputRef ? inputRef.current : undefined;

                            // Dismiss the keyboard for non-text fields by checking if the component has the isFocused method, as only TextInput has this method.
                            if (typeof focusInput?.isFocused !== 'function') {
                                Keyboard.dismiss();
                            }

                            // We subtract 10 to scroll slightly above the input
                            if (formContentRef.current) {
                                // We measure relative to the content root, not the scroll view, as that gives
                                // consistent results across mobile and web
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                focusInput?.measureLayout?.(formContentRef.current, (_x, y) =>
                                    formRef.current?.scrollTo({
                                        y: y - 10,
                                        animated: false,
                                    }),
                                );
                            }

                            // Focus the input after scrolling, as on the Web it gives a slightly better visual result
                            focusInput?.focus();
                        }}
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
        // FIX: Fabio plz help 😂
        key: (props) => props.formID as typeof ONYXKEYS.FORMS.EDIT_TASK_FORM,
    },
})(FormWrapper);
