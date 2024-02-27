import React from 'react';
import {ScrollView, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TextSelectorModalProps} from './types';

function TextSelectorModal({value, description = '', onValueSelected, isVisible, onClose, ...rest}: TextSelectorModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [currentValue, setValue] = React.useState(value);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="TextSelectorModal"
            >
                <HeaderWithBackButton
                    title={description}
                    onBackButtonPress={onClose}
                />
                <ScrollView contentContainerStyle={[styles.flex1, styles.mh5, styles.mb5]}>
                    <View style={styles.flex1}>
                        <TextInput
                            value={currentValue}
                            onInputChange={setValue}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                        />
                    </View>
                    <Button
                        success
                        text={translate('common.save')}
                        onPress={() => onValueSelected?.(currentValue ?? '')}
                    />
                </ScrollView>
            </ScreenWrapper>
        </Modal>
    );
}

TextSelectorModal.displayName = 'TextSelectorModal';

export default TextSelectorModal;
