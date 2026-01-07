import React from 'react';
import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CurrencyPickerProps = {
    /** Whether the picker modal is visible */
    isPickerVisible: boolean;

    /** Function to hide the picker modal */
    hidePickerModal: () => void;

    /** Header text for the modal */
    headerText: string;

    /** Current value of the selected item */
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** List of currencies to exclude from the list */
    excludeCurrencies?: string[];
};

function IOURequestStepCurrencyModal({isPickerVisible, hidePickerModal, headerText, value, excludeCurrencies, onInputChange = () => {}}: CurrencyPickerProps) {
    const {translate} = useLocalize();
    const [recentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const styles = useThemeStyles();

    const updateInput = (item: CurrencyListItem) => {
        onInputChange?.(item.currencyCode);
        hidePickerModal();
    };

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isPickerVisible}
            onClose={hidePickerModal}
            onModalHide={hidePickerModal}
            shouldEnableNewFocusManagement
            onBackdropPress={Navigation.dismissModal}
            shouldUseModalPaddingStyle={false}
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                style={[styles.pb0]}
                testID={IOURequestStepCurrencyModal.displayName}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={headerText}
                    shouldShowBackButton
                    onBackButtonPress={hidePickerModal}
                />
                <CurrencySelectionList
                    recentlyUsedCurrencies={recentlyUsedCurrencies ?? []}
                    initiallySelectedCurrencyCode={value}
                    onSelect={updateInput}
                    searchInputLabel={translate('common.search')}
                    excludedCurrencies={excludeCurrencies}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </Modal>
    );
}

IOURequestStepCurrencyModal.displayName = 'IOURequestStepCurrencyModal';
export default IOURequestStepCurrencyModal;
