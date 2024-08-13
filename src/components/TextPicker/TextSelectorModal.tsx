import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {TextInput as TextInputType} from 'react-native';
import {Keyboard, View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TextSelectorModalProps} from './types';
import usePaddingStyle from './usePaddingStyle';

function TextSelectorModal({value, description = '', subtitle, onValueSelected, isVisible, onClose, shouldClearOnClose, ...rest}: TextSelectorModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [currentValue, setValue] = useState(value);
    const paddingStyle = usePaddingStyle();

    const inputRef = useRef<BaseTextInputRef | null>(null);
    const inputValueRef = useRef(value);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const inputCallbackRef = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
    };

    const hide = useCallback(() => {
        onClose();
        if (shouldClearOnClose) {
            setValue('');
        }
    }, [onClose, shouldClearOnClose]);

    // In TextPicker, when the modal is hidden, it is not completely unmounted, so when it is shown again, the currentValue is not updated with the value prop.
    // Therefore, we need to update the currentValue with the value prop when the modal is shown. This is done once when the modal is shown again.
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        setValue(value);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isVisible]);

    useEffect(() => {
        inputValueRef.current = currentValue;
    }, [currentValue]);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current && isVisible) {
                    inputRef.current.focus();
                    (inputRef.current as TextInputType).setSelection?.(inputValueRef.current?.length ?? 0, inputValueRef.current?.length ?? 0);
                }
                return () => {
                    if (!focusTimeoutRef.current || !isVisible) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, [isVisible]),
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={hide}
            onModalHide={hide}
            hideModalContentWhileAnimating
            useNativeDriver
            shouldUseModalPaddingStyle={false}
        >
            <ScreenWrapper
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={TextSelectorModal.displayName}
                shouldEnableMaxHeight
                style={paddingStyle}
            >
                <HeaderWithBackButton
                    title={description}
                    onBackButtonPress={hide}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.TEXT_PICKER_MODAL_FORM}
                    onSubmit={(data) => {
                        Keyboard.dismiss();
                        onValueSelected?.(data[rest.inputID ?? ''] ?? '');
                    }}
                    submitButtonText={translate('common.save')}
                    style={[styles.mh5, styles.flex1]}
                    enabledWhenOffline
                >
                    <View style={styles.pb4}>{!!subtitle && <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text>}</View>
                    {!!rest.inputID && (
                        <InputWrapper
                            ref={inputCallbackRef}
                            InputComponent={TextInput}
                            maxLength={CONST.CATEGORY_NAME_LIMIT}
                            value={currentValue}
                            onValueChange={(changedValue) => setValue(changedValue.toString())}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                            inputID={rest.inputID}
                        />
                    )}
                </FormProvider>
            </ScreenWrapper>
        </Modal>
    );
}

TextSelectorModal.displayName = 'TextSelectorModal';

export default TextSelectorModal;
