import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {AmountSelectorModalProps} from './types';

function AmountSelectorModal({value, description = '', onValueSelected, isVisible, onClose, ...rest}: AmountSelectorModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [currentValue, setValue] = useState(value);
    const inputRef = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const inputCallbackRef = (ref: BaseTextInputRef | null) => {
        inputRef.current = ref;
    };

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => {
                if (inputRef.current && isVisible) {
                    inputRef.current.focus();
                }
                return () => {
                    if (!focusTimeoutRef.current || !isVisible) {
                        return;
                    }
                    clearTimeout(focusTimeoutRef.current);
                };
            }, CONST.ANIMATED_TRANSITION);
        }, [isVisible, inputRef]),
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                includePaddingTop={false}
                testID="AmountSelectorModal"
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={description}
                    onBackButtonPress={onClose}
                />
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1, styles.mb5]}
                    addBottomSafeAreaPadding
                >
                    <View style={styles.flex1}>
                        <NumberWithSymbolForm
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                            value={currentValue}
                            onInputChange={setValue}
                            ref={(ref) => inputCallbackRef(ref)}
                        />
                        <Button
                            success
                            large
                            pressOnEnter
                            text={translate('common.save')}
                            onPress={() => onValueSelected?.(currentValue ?? '')}
                            style={styles.mh5}
                        />
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </Modal>
    );
}

export default AmountSelectorModal;
