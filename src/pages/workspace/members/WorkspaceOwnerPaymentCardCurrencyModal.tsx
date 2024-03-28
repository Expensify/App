import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type WorkspaceOwnerPaymentCardCurrencyModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The list of years to render */
    currencies: Array<keyof typeof CONST.CURRENCY>;

    /** Currently selected year */
    currentCurrency: keyof typeof CONST.CURRENCY;

    /** Function to call when the user selects a year */
    onCurrencyChange?: (currency: keyof typeof CONST.CURRENCY) => void;

    /** Function to call when the user closes the year picker */
    onClose?: () => void;
};

function WorkspaceOwnerPaymentCardCurrencyModal({isVisible, currencies, currentCurrency = CONST.CURRENCY.USD, onCurrencyChange, onClose}: WorkspaceOwnerPaymentCardCurrencyModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {sections} = useMemo(
        () => ({
            sections: [
                {
                    data: currencies.map((currency) => ({
                        text: currency,
                        value: currency,
                        keyForList: currency,
                        isSelected: currency === currentCurrency,
                    })),
                    indexOffset: 0,
                },
            ],
        }),
        [currencies, currentCurrency],
    );

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
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceOwnerPaymentCardCurrencyModal.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.currency')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={sections}
                    onSelectRow={(option) => {
                        onCurrencyChange?.(option.value);
                    }}
                    initiallyFocusedOptionKey={currentCurrency}
                    showScrollIndicator
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                    ListItem={RadioListItem}
                />
            </ScreenWrapper>
        </Modal>
    );
}

WorkspaceOwnerPaymentCardCurrencyModal.displayName = 'WorkspaceOwnerPaymentCardCurrencyModal';

export default WorkspaceOwnerPaymentCardCurrencyModal;
