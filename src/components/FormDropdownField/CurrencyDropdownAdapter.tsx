/** Form input for a currency field, drawn as the expense form's dropdown row */
import CurrencyPickerPopover from '@components/CurrencyPickerPopover';
import CurrencySelectionList from '@components/CurrencySelectionList';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import React from 'react';

import type {DropdownRowInputProps} from '.';

import FormDropdownField from '.';

/** The value is a currency code */
type CurrencyDropdownAdapterProps = DropdownRowInputProps<string> & {
    /** Name screen readers hear instead of `label`, for a currency whose label alone does not say which amount it belongs to */
    accessibilityLabel?: string;
};

/** A currency field whose searchable currency list opens in a container anchored to its row */
function CurrencyDropdownAdapter({
    label,
    title,
    accessibilityLabel,
    value,
    onInputChange,
    errorText,
    disabled,
    forwardedFSClass,
    ref,
    onBlur,
    sentryLabel,
    backButtonSentryLabel,
}: CurrencyDropdownAdapterProps) {
    const {translate} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const currencyCode = value === '' ? undefined : value;
    const displayValue = currencyCode ? `${currencyCode} - ${getCurrencySymbol(currencyCode)}` : undefined;

    const selectCurrency = (pickedCurrencyCode: string) => {
        if (pickedCurrencyCode === value) {
            return;
        }
        onInputChange?.(pickedCurrencyCode);
    };

    return (
        <FormDropdownField
            label={label}
            value={displayValue}
            accessibilityLabel={accessibilityLabel ? [accessibilityLabel, displayValue].filter(Boolean).join(', ') : undefined}
            title={title}
            errorText={errorText}
            disabled={disabled}
            rowRef={ref}
            onBlur={onBlur}
            forwardedFSClass={forwardedFSClass}
            sentryLabel={sentryLabel}
            backButtonSentryLabel={backButtonSentryLabel}
            renderDropdown={(dropdownProps) => (
                <CurrencyPickerPopover
                    {...dropdownProps}
                    shouldFitContentHeight
                    shouldShowHeader
                    title={title}
                    backButtonSentryLabel={backButtonSentryLabel}
                    selectedCurrencyCode={currencyCode}
                    onSelected={(item) => selectCurrency(item.currencyCode)}
                    forwardedFSClass={forwardedFSClass}
                />
            )}
            renderFullPageList={({onClose}) => (
                <CurrencySelectionList
                    searchInputLabel={translate('common.search')}
                    initiallySelectedCurrencyCode={currencyCode}
                    onSelect={(item) => {
                        selectCurrency(item.currencyCode);
                        onClose();
                    }}
                    addBottomSafeAreaPadding
                />
            )}
        />
    );
}

export default CurrencyDropdownAdapter;
export type {CurrencyDropdownAdapterProps};
