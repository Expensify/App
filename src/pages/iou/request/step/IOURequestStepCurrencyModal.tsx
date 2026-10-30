import CurrencySelectionList from '@components/CurrencySelectionList';
import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import type FocusTrapForModalProps from '@components/FocusTrap/FocusTrapForModal/FocusTrapForModalProps';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type CurrencyPickerProps = {
    isPickerVisible: boolean;
    hidePickerModal: () => void;
    headerText: string;
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    excludeCurrencies?: string[];

    /** The button that opens the picker. When passed, focus returns to it after the picker closes. */
    launcherRef?: FocusTrapForModalProps['launcherRef'];
};

function IOURequestStepCurrencyModal({isPickerVisible, hidePickerModal, headerText, value, excludeCurrencies, launcherRef, onInputChange = () => {}}: CurrencyPickerProps) {
    const {translate} = useLocalize();
    const [recentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
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
            shouldReturnFocus={!!launcherRef}
            launcherRef={launcherRef}
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
