import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import CurrencySelectionListWithOnyx from './CurrencySelectionList';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';
import type {ValuePickerItem, ValuePickerProps} from './ValuePicker/types';

type CurrencyPickerProps = {
    selectedCurrency?: string;
};
function CurrencyPicker({selectedCurrency, label, errorText = '', value, onInputChange, furtherDetails}: ValuePickerProps & CurrencyPickerProps, forwardedRef: ForwardedRef<View>) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: ValuePickerItem) => {
        if (item.value !== selectedCurrency) {
            onInputChange?.(item.value);
        }
        hidePickerModal();
    };

    const descStyle = !selectedCurrency || selectedCurrency.length === 0 ? StyleUtils.getFontSizeStyle(variables.fontSizeLabel) : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                title={value || ''}
                descriptionTextStyle={descStyle}
                description={label}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />

            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isPickerVisible}
                onClose={() => hidePickerModal}
                onModalHide={hidePickerModal}
                hideModalContentWhileAnimating
                useNativeDriver
                onBackdropPress={hidePickerModal}
            >
                <ScreenWrapper
                    style={styles.pb0}
                    includePaddingTop={false}
                    includeSafeAreaPaddingBottom={false}
                    testID={label ?? 'TEST'}
                >
                    <HeaderWithBackButton
                        title={label}
                        onBackButtonPress={hidePickerModal}
                    />
                    <CurrencySelectionListWithOnyx
                        onSelect={(item) => updateInput({value: item.currencyCode})}
                        searchInputLabel="Currency"
                        initiallySelectedCurrencyCode={selectedCurrency}
                    />
                </ScreenWrapper>
            </Modal>
        </View>
    );
}

CurrencyPicker.displayName = 'CurrencyPicker';

export default forwardRef(CurrencyPicker);
