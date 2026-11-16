/** Form input for a currency field, drawn as the expense form's dropdown row */
import CurrencyPickerPopover from '@components/CurrencyPickerPopover';
import CurrencySelectionList from '@components/CurrencySelectionList';
import DynamicFormDropdownField from '@components/DynamicForm/components/DynamicFormDropdownField';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import type {ComponentRef, Ref} from 'react';
import type {View} from 'react-native';

import React from 'react';

type CurrencyDropdownAdapterProps = ForwardedFSClassProps & {
    /** Name of the field, shown in the row */
    label: string;

    /** Heading of the list once it opens */
    title: string;

    /** Name screen readers hear instead of `label`, for a currency whose label alone does not say which amount it belongs to */
    accessibilityLabel?: string;

    /** Currency code */
    value?: string;

    /** Called with a newly picked currency code. Picking the currency the field already holds does not call it. */
    onInputChange?: (value: string) => void;

    /** Validation error shown under the row */
    errorText?: string;

    /** Dims the row and stops it opening, e.g. while the form waits on the server for new requirements */
    disabled?: boolean;

    /** Lets FormProvider scroll to and focus the row when the user asks to fix the errors */
    ref?: Ref<ComponentRef<typeof View>>;
};

/** A currency field whose searchable currency list opens in a container anchored to its row */
function CurrencyDropdownAdapter({label, title, accessibilityLabel, value, onInputChange, errorText = '', disabled = false, forwardedFSClass, ref}: CurrencyDropdownAdapterProps) {
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
        <DynamicFormDropdownField
            label={label}
            value={displayValue}
            accessibilityLabel={accessibilityLabel ? [accessibilityLabel, displayValue].filter(Boolean).join(', ') : undefined}
            title={title}
            errorText={errorText}
            disabled={disabled}
            rowRef={ref}
            forwardedFSClass={forwardedFSClass}
            renderDropdown={(dropdownProps) => (
                <CurrencyPickerPopover
                    {...dropdownProps}
                    shouldFitContentHeight
                    shouldShowHeader
                    title={title}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK}
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
