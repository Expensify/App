import React, {useCallback, useMemo, useRef} from 'react';
import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, StyleProp, ViewStyle} from 'react-native';
import {InteractionManager, Keyboard, View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FormElement from '@components/FormElement';
import ScrollView from '@components/ScrollView';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {Form} from '@src/types/form';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {FormInputErrors, FormProps, InputRefs} from './types';

type FormWrapperProps = ChildrenProps &
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

        /** should render the extra button above submit button */
        shouldRenderFooterAboveSubmit?: boolean;

        /** Whether the form is loading */
        isLoading?: boolean;

        /** If enabled, the content will have a bottom padding equal to account for the safe bottom area inset. */
        addBottomSafeAreaPadding?: boolean;

        /** Whether to add bottom safe area padding to the content. */
        addOfflineIndicatorBottomSafeAreaPadding?: boolean;

        /** Whether the submit button should stick to the bottom of the screen. */
        shouldSubmitButtonStickToBottom?: boolean;

        /**
         * Whether the button should have a background layer in the color of theme.appBG.
         * This is needed for buttons that allow content to display under them.
         */
        shouldSubmitButtonBlendOpacity?: boolean;

        /** Fires at most once per frame during scrolling. */
        onScroll?: () => void;

        /** Prevents the submit button from triggering blur on mouse down. */
        shouldPreventDefaultFocusOnPressSubmit?: boolean;
    };

function FormWrapper({
    onSubmit,
    children,
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
    disablePressOnEnter = false,
    enterKeyEventListenerPriority = 1,
    isSubmitDisabled = false,
    shouldRenderFooterAboveSubmit = false,
    isLoading = false,
    shouldScrollToEnd = false,
    addBottomSafeAreaPadding,
    addOfflineIndicatorBottomSafeAreaPadding,
    shouldSubmitButtonStickToBottom: shouldSubmitButtonStickToBottomProp,
    shouldSubmitButtonBlendOpacity = false,
    shouldPreventDefaultFocusOnPressSubmit = false,
    onScroll = () => {},
    forwardedFSClass,
}: FormWrapperProps) {
    const styles = useThemeStyles();
    const formRef = useRef<RNScrollView>(null);
    const formContentRef = useRef<View>(null);

    const [formState] = useOnyx<OnyxFormKey, Form>(`${formID}`, {canBeMissing: true});

    const errorMessage = useMemo(() => (formState ? getLatestErrorMessage(formState) : undefined), [formState]);

    const onFixTheErrorsLinkPressed = useCallback(() => {
        const errorFields = !isEmptyObject(errors) ? errors : (formState?.errorFields ?? {});
        const focusKey = Object.keys(inputRefs.current ?? {}).find((key) => key in errorFields);

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

    // If either of `addBottomSafeAreaPadding` or `shouldSubmitButtonStickToBottom` is explicitly set,
    // we expect that the user wants to use the new edge-to-edge mode.
    // In this case, we want to get and apply the padding unconditionally.
    const isUsingEdgeToEdgeMode = addBottomSafeAreaPadding !== undefined || shouldSubmitButtonStickToBottomProp !== undefined;
    const shouldSubmitButtonStickToBottom = shouldSubmitButtonStickToBottomProp ?? false;
    const {paddingBottom} = useSafeAreaPaddings(isUsingEdgeToEdgeMode);

    // Same as above, if `addBottomSafeAreaPadding` is explicitly set true, we default to the new edge-to-edge bottom safe area padding handling.
    // If the paddingBottom is 0, it has already been applied to a parent component and we don't want to apply the padding again.
    const isLegacyBottomSafeAreaPaddingAlreadyApplied = paddingBottom === 0;
    const shouldApplyBottomSafeAreaPadding = addBottomSafeAreaPadding ?? !isLegacyBottomSafeAreaPaddingAlreadyApplied;

    // We need to add bottom safe area padding to the submit button when we don't use a scroll view or
    // when the submit button is sticking to the bottom.
    const addSubmitButtonBottomSafeAreaPadding = addBottomSafeAreaPadding && (!shouldUseScrollView || shouldSubmitButtonStickToBottom);
    const submitButtonStylesWithBottomSafeAreaPadding = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: addSubmitButtonBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding,
        styleProperty: shouldSubmitButtonStickToBottom ? 'bottom' : 'paddingBottom',
        additionalPaddingBottom: shouldSubmitButtonStickToBottom ? styles.pb5.paddingBottom : 0,
        style: submitButtonStyles,
    });

    const SubmitButton = useMemo(
        () =>
            isSubmitButtonVisible && (
                <FormAlertWithSubmitButton
                    buttonText={submitButtonText}
                    isDisabled={isSubmitDisabled}
                    isAlertVisible={((!isEmptyObject(errors) || !isEmptyObject(formState?.errorFields)) && !shouldHideFixErrorsAlert) || !!errorMessage}
                    isLoading={!!formState?.isLoading || isLoading}
                    message={isEmptyObject(formState?.errorFields) ? errorMessage : undefined}
                    onSubmit={onSubmit}
                    footerContent={footerContent}
                    onFixTheErrorsLinkPressed={onFixTheErrorsLinkPressed}
                    containerStyles={[
                        styles.mh0,
                        styles.mt5,
                        submitFlexEnabled && styles.flex1,
                        submitButtonStylesWithBottomSafeAreaPadding,
                        shouldSubmitButtonStickToBottom && [styles.stickToBottom, style],
                    ]}
                    enabledWhenOffline={enabledWhenOffline}
                    isSubmitActionDangerous={isSubmitActionDangerous}
                    disablePressOnEnter={disablePressOnEnter}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    shouldRenderFooterAboveSubmit={shouldRenderFooterAboveSubmit}
                    shouldBlendOpacity={shouldSubmitButtonBlendOpacity}
                    shouldPreventDefaultFocusOnPress={shouldPreventDefaultFocusOnPressSubmit}
                />
            ),
        [
            disablePressOnEnter,
            enterKeyEventListenerPriority,
            enabledWhenOffline,
            errorMessage,
            errors,
            footerContent,
            formState?.errorFields,
            formState?.isLoading,
            isLoading,
            isSubmitActionDangerous,
            isSubmitButtonVisible,
            isSubmitDisabled,
            onFixTheErrorsLinkPressed,
            onSubmit,
            shouldHideFixErrorsAlert,
            shouldSubmitButtonBlendOpacity,
            shouldSubmitButtonStickToBottom,
            style,
            styles.flex1,
            styles.mh0,
            styles.mt5,
            styles.stickToBottom,
            submitButtonStylesWithBottomSafeAreaPadding,
            submitButtonText,
            submitFlexEnabled,
            shouldRenderFooterAboveSubmit,
            shouldPreventDefaultFocusOnPressSubmit,
        ],
    );

    const scrollViewContent = useCallback(
        () => (
            <FormElement
                key={formID}
                ref={formContentRef}
                style={[style, styles.pb5]}
                onLayout={() => {
                    if (!shouldScrollToEnd) {
                        return;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    InteractionManager.runAfterInteractions(() => {
                        requestAnimationFrame(() => {
                            formRef.current?.scrollToEnd({animated: true});
                        });
                    });
                }}
            >
                {children}
                {!shouldSubmitButtonStickToBottom && SubmitButton}
            </FormElement>
        ),
        [formID, style, styles.pb5, children, shouldSubmitButtonStickToBottom, SubmitButton, shouldScrollToEnd],
    );

    if (!shouldUseScrollView) {
        if (shouldSubmitButtonStickToBottom) {
            return (
                <>
                    {scrollViewContent()}
                    {SubmitButton}
                </>
            );
        }

        return scrollViewContent();
    }

    return (
        <View
            style={styles.flex1}
            fsClass={forwardedFSClass}
        >
            {scrollContextEnabled ? (
                <ScrollViewWithContext
                    style={[styles.w100, styles.flex1]}
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="handled"
                    addBottomSafeAreaPadding={shouldApplyBottomSafeAreaPadding}
                    addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}
                    ref={formRef}
                >
                    {scrollViewContent()}
                </ScrollViewWithContext>
            ) : (
                <ScrollView
                    style={[styles.w100, styles.flex1]}
                    contentContainerStyle={styles.flexGrow1}
                    keyboardShouldPersistTaps="handled"
                    addBottomSafeAreaPadding={shouldApplyBottomSafeAreaPadding}
                    addOfflineIndicatorBottomSafeAreaPadding={addOfflineIndicatorBottomSafeAreaPadding}
                    ref={formRef}
                    onScroll={onScroll}
                >
                    {scrollViewContent()}
                </ScrollView>
            )}
            {shouldSubmitButtonStickToBottom && SubmitButton}
        </View>
    );
}

export default FormWrapper;
