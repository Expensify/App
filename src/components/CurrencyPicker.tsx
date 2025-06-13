import {useNavigation, useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {Fragment, useEffect, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import CurrencySelectionList from './CurrencySelectionList';
import type {CurrencyListItem} from './CurrencySelectionList/types';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';

type CurrencyPickerProps = {
    /** Label for the input */
    label: string;

    /** Current value of the selected item */
    value?: string;

    /** Custom content to display in the header */
    headerContent?: ReactNode;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;

    /** List of currencies to exclude from the list */
    excludeCurrencies?: string[];

    /** Is the MenuItem disabled */
    disabled?: boolean;

    /** Should show the full page offline view (whenever the user is offline) */
    shouldShowFullPageOfflineView?: boolean;

    /** Should sync picker visibility with navigation params (for modal state restoration) */
    shouldSyncPickerVisibilityWithNavigation?: boolean;

    /** Should save currency value in navigation params */
    shouldSaveCurrencyInNavigation?: boolean;
};

function CurrencyPicker({
    label,
    value,
    errorText,
    headerContent,
    excludeCurrencies,
    disabled = false,
    shouldShowFullPageOfflineView = false,
    shouldSyncPickerVisibilityWithNavigation = false,
    shouldSaveCurrencyInNavigation = false,
    onInputChange = () => {},
}: CurrencyPickerProps) {
    const {translate} = useLocalize();
    const route = useRoute();
    const navigation = useNavigation();
    const isPickerVisibleParam = route.params && 'isPickerVisible' in route.params && route.params.isPickerVisible === 'true';
    const [isPickerVisible, setIsPickerVisible] = useState(isPickerVisibleParam ?? false);
    const styles = useThemeStyles();

    const hidePickerModal = () => {
        setIsPickerVisible(false);
        if (shouldSaveCurrencyInNavigation) {
            Navigation.setParams({currency: value});
        }
    };

    const updateInput = (item: CurrencyListItem) => {
        onInputChange?.(item.currencyCode);
        hidePickerModal();
    };

    const BlockingComponent = shouldShowFullPageOfflineView ? FullPageOfflineBlockingView : Fragment;

    useEffect(() => {
        if (!shouldSyncPickerVisibilityWithNavigation) {
            return;
        }
        Navigation.setParams({isPickerVisible: String(isPickerVisible)});
    }, [isPickerVisible, navigation, shouldSyncPickerVisibilityWithNavigation]);

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={value ? `${value} - ${getCurrencySymbol(value)}` : undefined}
                description={label}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                disabled={disabled}
            />
            <Modal
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                isVisible={isPickerVisible}
                onClose={hidePickerModal}
                onModalHide={hidePickerModal}
                hideModalContentWhileAnimating
                shouldEnableNewFocusManagement
                useNativeDriver
                onBackdropPress={Navigation.dismissModal}
                shouldUseModalPaddingStyle={false}
                shouldHandleNavigationBack
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <ScreenWrapper
                    style={[styles.pb0]}
                    testID={CurrencyPicker.displayName}
                    shouldEnableMaxHeight
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={label}
                        shouldShowBackButton
                        onBackButtonPress={hidePickerModal}
                    />
                    <BlockingComponent>
                        {!!headerContent && headerContent}
                        <CurrencySelectionList
                            initiallySelectedCurrencyCode={value}
                            onSelect={updateInput}
                            searchInputLabel={translate('common.search')}
                            excludedCurrencies={excludeCurrencies}
                            addBottomSafeAreaPadding
                        />
                    </BlockingComponent>
                </ScreenWrapper>
            </Modal>
        </>
    );
}

CurrencyPicker.displayName = 'CurrencyPicker';
export default CurrencyPicker;
