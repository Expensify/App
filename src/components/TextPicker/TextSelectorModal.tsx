import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import type {TextInput as TextInputType} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
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

    const hide = useCallback(() => {
        onClose();
        if (shouldClearOnClose) {
            setValue('');
        }
    }, [onClose, shouldClearOnClose]);

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
                <ScrollView
                    contentContainerStyle={[styles.flex1, styles.mh5, styles.mb5]}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.pb4}>{!!subtitle && <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text>}</View>
                    <View style={styles.flex1}>
                        <TextInput
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                            value={currentValue}
                            onInputChange={setValue}
                            ref={(ref) => {
                                if (!ref) {
                                    return;
                                }
                                inputRef.current = ref;
                            }}
                        />
                    </View>
                    <Button
                        success
                        large
                        pressOnEnter
                        text={translate('common.save')}
                        onPress={() => {
                            Keyboard.dismiss();
                            onValueSelected?.(currentValue ?? '');
                        }}
                    />
                </ScrollView>
            </ScreenWrapper>
        </Modal>
    );
}

TextSelectorModal.displayName = 'TextSelectorModal';

export default TextSelectorModal;
