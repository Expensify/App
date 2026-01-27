import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {TextInput as TextInputType} from 'react-native';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {moveSelectionToEnd, scrollToBottom} from '@libs/InputUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SafeString from '@src/utils/SafeString';
import type {TextSelectorModalProps} from './types';

function TextSelectorModal({
    value,
    description = '',
    subtitle,
    onValueSelected,
    isVisible,
    onClose,
    shouldClearOnClose,
    maxLength = CONST.CATEGORY_NAME_LIMIT,
    required = false,
    customValidate,
    enabledWhenOffline = true,
    allowHTML,
    autoGrowHeight,
    ...rest
}: TextSelectorModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [currentValue, setValue] = useState(value);
    const [isClosing, setIsClosing] = useState(false);

    const inputRef = useRef<TextInputType | null>(null);
    const inputValueRef = useRef(value);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputCallbackRef = (ref: TextInputType | null) => {
        inputRef.current = ref;
    };

    const hide = useCallback(() => {
        setIsClosing(true);
        onClose();
        if (shouldClearOnClose) {
            setValue('');
        }
    }, [onClose, shouldClearOnClose]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.TEXT_PICKER_MODAL_FORM>) => {
            let errors: FormInputErrors<typeof ONYXKEYS.FORMS.TEXT_PICKER_MODAL_FORM> = {};
            const formValue = values[rest.inputID];

            if (required) {
                errors = getFieldRequiredErrors(values, [rest.inputID]);
            }

            if (formValue.length > maxLength) {
                errors[rest.inputID] = translate('common.error.characterLimitExceedCounter', formValue.length, maxLength);
            }

            if (customValidate) {
                const customErrors = customValidate(values);
                errors = {...errors, ...customErrors};
            }

            return errors;
        },
        [maxLength, rest.inputID, required, translate, customValidate],
    );

    // In TextPicker, when the modal is hidden, it is not completely unmounted, so when it is shown again, the currentValue is not updated with the value prop.
    // Therefore, we need to update the currentValue with the value prop when the modal is shown. This is done once when the modal is shown again.
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        setValue(value);
        setIsClosing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    useEffect(() => {
        inputValueRef.current = currentValue;
    }, [currentValue]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current && isVisible) {
                    inputRef.current.focus();
                    inputRef.current.setSelection?.(inputValueRef.current?.length ?? 0, inputValueRef.current?.length ?? 0);
                    if (autoGrowHeight) {
                        scrollToBottom(inputRef.current);
                        moveSelectionToEnd(inputRef.current);
                    }
                }
                return () => {
                    if (!focusTimeoutRef.current || !isVisible) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, [isVisible, autoGrowHeight]),
    );

    const handleSubmit = useCallback(
        (data: FormOnyxValues<typeof ONYXKEYS.FORMS.TEXT_PICKER_MODAL_FORM>) => {
            const submittedValue = data[rest.inputID] ?? '';

            if (required && !submittedValue.trim()) {
                return;
            }

            Keyboard.dismiss();
            onValueSelected?.(submittedValue);
        },
        [onValueSelected, rest.inputID, required],
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={hide}
            onModalHide={hide}
            shouldUseModalPaddingStyle={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldHandleNavigationBack
            swipeDirection={CONST.SWIPE_DIRECTION.RIGHT}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                includePaddingTop
                testID="TextSelectorModal"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={description}
                    onBackButtonPress={hide}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.TEXT_PICKER_MODAL_FORM}
                    validate={validate}
                    onSubmit={handleSubmit}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline={enabledWhenOffline}
                    addOfflineIndicatorBottomSafeAreaPadding={shouldUseNarrowLayout ? undefined : false}
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                    enterKeyEventListenerPriority={0}
                    allowHTML={allowHTML}
                    shouldValidateOnBlur={!isClosing}
                >
                    {!!subtitle && (
                        <View style={styles.pb4}>
                            <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text>
                        </View>
                    )}
                    <InputWrapper
                        ref={inputCallbackRef}
                        InputComponent={TextInput}
                        value={currentValue}
                        onValueChange={(changedValue) => setValue(SafeString(changedValue))}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rest}
                        inputID={rest.inputID}
                        autoGrowHeight={autoGrowHeight}
                    />
                </FormProvider>
            </ScreenWrapper>
        </Modal>
    );
}

export default TextSelectorModal;
