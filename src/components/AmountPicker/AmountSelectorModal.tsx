import React from 'react';
import AmountForm from '@components/AmountForm';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {AmountSelectorModalProps} from './types';

function AmountSelectorModal({value, description = '', onValueSelected, isVisible, onClose}: AmountSelectorModalProps) {
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
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="AmountSelectorModal"
            >
                <HeaderWithBackButton
                    title={description}
                    onBackButtonPress={onClose}
                />
                <AmountForm
                    value={currentValue}
                    onInputChange={setValue}
                    hideCurrency
                    extraSymbol={<Text style={styles.iouAmountText}>%</Text>}
                />
                <Button
                    success
                    text={translate('common.save')}
                    onPress={() => onValueSelected?.(currentValue ?? '')}
                />
            </ScreenWrapper>
        </Modal>
    );
}

AmountSelectorModal.displayName = 'AmountSelectorModal';

export default AmountSelectorModal;
