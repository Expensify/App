import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ReactNode} from 'react';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {Fragment, useState} from 'react';

import type {CurrencyListItem} from './CurrencySelectionList/types';

import FullPageOfflineBlockingView from './BlockingViews/FullPageOfflineBlockingView';
import CurrencySelectionList from './CurrencySelectionList';
import HeaderWithBackButton from './HeaderWithBackButton';
import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';

type CurrencyPickerProps = {
    /** Label for the input */
    label: string;

    /** Title of the picker's modal, when it differs from the label */
    modalHeaderTitle?: string;

    /** Name read by screen readers instead of the label, for a picker whose label alone does not say which value it belongs to */
    accessibilityLabel?: string;

    /** Whether screen readers hear the error with the row's name, since the row hides the error line from them on native */
    shouldReadErrorWithLabel?: boolean;

    value?: string;
    headerContent?: ReactNode;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;

    excludeCurrencies?: string[];

    /** Is the MenuItem disabled */
    disabled?: boolean;

    /** Should show the full page offline view (whenever the user is offline) */
    shouldShowFullPageOfflineView?: boolean;
};

function CurrencyPicker({
    label,
    modalHeaderTitle,
    accessibilityLabel,
    shouldReadErrorWithLabel,
    value,
    errorText,
    headerContent,
    excludeCurrencies,
    disabled = false,
    shouldShowFullPageOfflineView = false,
    onInputChange = () => {},
}: CurrencyPickerProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const styles = useThemeStyles();

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: CurrencyListItem) => {
        onInputChange?.(item.currencyCode);
        hidePickerModal();
    };

    const BlockingComponent = shouldShowFullPageOfflineView ? FullPageOfflineBlockingView : Fragment;

    return (
        <>
            <MenuItem.Root
                onPress={callFunctionIfActionIsAllowed(() => setIsPickerVisible(true), false, session)}
                isDisabled={disabled}
                accessibilityLabel={accessibilityLabel ? [accessibilityLabel, value ? `${value} - ${getCurrencySymbol(value)}` : undefined].filter(Boolean).join(', ') : undefined}
            >
                <MenuItemField.Row
                    name={label}
                    value={value ? `${value} - ${getCurrencySymbol(value)}` : undefined}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItemField.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                        shouldReadErrorWithLabel={shouldReadErrorWithLabel}
                    />
                )}
            </MenuItem.Root>
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
                    testID="CurrencyPicker"
                    shouldEnableMaxHeight
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={modalHeaderTitle ?? label}
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

export default CurrencyPicker;
