import type {ReactNode} from 'react';
import React, {useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import CurrencySelectionList from './CurrencySelectionList';
import type {CurrencyListItem} from './CurrencySelectionList/types';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';

type CurrencyPickerProps = {
    /** Current value of the selected item */
    value?: string;

    /** Custom content to display in the header */
    headerContent?: ReactNode;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;
};

function CurrencyPicker({value, errorText, headerContent, onInputChange = () => {}}: CurrencyPickerProps) {
    const {translate} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const styles = useThemeStyles();

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: CurrencyListItem) => {
        onInputChange?.(item.currencyCode);
        hidePickerModal();
    };

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={value ? `${value} - ${CurrencyUtils.getCurrencySymbol(value)}` : undefined}
                description={translate('common.currency')}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isPickerVisible}
                onClose={hidePickerModal}
                onModalHide={hidePickerModal}
                hideModalContentWhileAnimating
                useNativeDriver
                onBackdropPress={Navigation.dismissModal}
            >
                <ScreenWrapper
                    style={[styles.pb0]}
                    includePaddingTop={false}
                    includeSafeAreaPaddingBottom
                    testID={CurrencyPicker.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('common.currency')}
                        shouldShowBackButton
                        onBackButtonPress={hidePickerModal}
                    />
                    {!!headerContent && headerContent}
                    <CurrencySelectionList
                        initiallySelectedCurrencyCode={value}
                        onSelect={updateInput}
                        searchInputLabel={translate('common.search')}
                    />
                </ScreenWrapper>
            </Modal>
        </>
    );
}

CurrencyPicker.displayName = 'CurrencyPicker';
export default CurrencyPicker;
