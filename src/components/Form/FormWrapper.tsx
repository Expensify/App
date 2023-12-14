import React, {useCallback, useMemo, useRef} from 'react';
import {Keyboard, ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormSubmit from '@components/FormSubmit';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import {SafeAreaChildrenProps} from '@components/SafeAreaConsumer/types';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {FormWrapperOnyxProps, FormWrapperProps} from './types';

function FormWrapper({
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
    scrollContextEnabled,
}: FormWrapperProps) {
    const styles = useThemeStyles();
    const formRef = useRef<ScrollView | null>(null);
    const formContentRef = useRef<View | null>(null);
    const errorMessage = useMemo(() => formState && ErrorUtils.getLatestErrorMessage(formState), [formState]);

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
                        message={isEmptyObject(formState?.errorFields) ? errorMessage : null}
                        onSubmit={onSubmit}
                        footerContent={footerContent}
                        onFixTheErrorsLinkPressed={() => {
                            const errorFields = !isEmptyObject(errors) ? errors : formState?.errorFields ?? {};
                            const focusKey = Object.keys(inputRefs.current ?? {}).find((key) => Object.keys(errorFields).includes(key));

                            if (!focusKey) {
                                return;
                            }

                            const focusInput = inputRefs.current?.[focusKey].current;

                            // Dismiss the keyboard for non-text fields by checking if the component has the isFocused method, as only TextInput has this method.
                            if (typeof focusInput?.isFocused !== 'function') {
                                Keyboard.dismiss();
                            }

                            // We subtract 10 to scroll slightly above the input
                            if (focusInput?.measureLayout && formContentRef.current && typeof focusInput.measureLayout === 'function') {
                                // We measure relative to the content root, not the scroll view, as that gives
                                // consistent results across mobile and web
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                focusInput.measureLayout(formContentRef.current, (_x, y) =>
                                    formRef.current?.scrollTo({
                                        y: y - 10,
                                        animated: false,
                                    }),
                                );
                            }

                            // Focus the input after scrolling, as on the Web it gives a slightly better visual result
                            if (focusInput?.focus && typeof focusInput.focus === 'function') {
                                focusInput.focus();
                            }
                        }}
                        // @ts-expect-error FormAlertWithSubmitButton migration
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
        key: (props) => props.formID as typeof ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
    },
})(FormWrapper);
