import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type PaymentCardCurrencyModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The list of currencies to render */
    currencies: Array<ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>>;

    /** Currently selected currency */
    currentCurrency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;

    /** Function to call when the user selects a currency */
    onCurrencyChange?: (currency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>) => void;

    /** Function to call when the user closes the currency picker */
    onClose?: () => void;
};

function PaymentCardCurrencyModal({isVisible, currencies, currentCurrency = CONST.PAYMENT_CARD_CURRENCY.USD, onCurrencyChange, onClose}: PaymentCardCurrencyModalProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
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
            innerContainerStyle={styles.RHPNavigatorContainer(isSmallScreenWidth)}
            useNativeDriver
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={PaymentCardCurrencyModal.displayName}
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

PaymentCardCurrencyModal.displayName = 'PaymentCardCurrencyModal';

export default PaymentCardCurrencyModal;
