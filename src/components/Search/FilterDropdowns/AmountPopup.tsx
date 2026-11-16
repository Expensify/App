import MenuItem from '@components/MenuItem';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';
import type {SearchAmountFilterKeys, SearchAmountValues} from '@components/Search/types';

import useAmountFilterCurrency from '@hooks/useAmountFilterCurrency';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatAmountFilterValue, getAmountFilterDisplayValue, getAmountFilterFormValues, getAmountFilterInputValue} from '@libs/SearchAmountFilterUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

import BasePopup from './BasePopup';

type AmountPopupProps = {
    baseFilterKey: SearchAmountFilterKeys;
    label: string;
    value: SearchAmountValues;
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
    closeOverlay: () => void;
};

type AmountInputProps = {
    title: string;
    value: string;
    name: string;
    baseFilterKey: SearchAmountFilterKeys;
    onSave: (value: string) => void;
    onBackButtonPress: () => void;
};

function AmountInput({title, value, name, baseFilterKey, onSave, onBackButtonPress}: AmountInputProps) {
    const styles = useThemeStyles();
    const initialValue = getAmountFilterInputValue(value);
    const [amount, setAmount] = useState(initialValue.amount);
    const {currency, setCurrency} = useAmountFilterCurrency(baseFilterKey, value);

    return (
        <BasePopup
            label={title}
            onApply={() => onSave(formatAmountFilterValue(amount, currency))}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_VALUE.AMOUNT}
            onBackButtonPress={onBackButtonPress}
            shouldSubmitOnEnter
        >
            <AmountFilterInput
                baseFilterKey={baseFilterKey}
                containerStyles={[styles.ph4, styles.mb2]}
                amount={amount}
                currency={currency}
                onAmountChange={setAmount}
                onCurrencyChange={setCurrency}
                label={title}
                name={name}
                autoFocus
            />
        </BasePopup>
    );
}

function AmountPopup({baseFilterKey, label, value, closeOverlay, updateFilterForm}: AmountPopupProps) {
    const {translate} = useLocalize();
    const {convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const [selectedModifier, setSelectedModifier] = useState<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | null>(null);
    const [amountValues, setAmountValues] = useState(value);

    const title = {
        [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: translate('search.filters.amount.equalTo'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: translate('search.filters.amount.greaterThan'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: translate('search.filters.amount.lessThan'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO]: translate('search.filters.amount.greaterThanOrEqualTo'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO]: translate('search.filters.amount.lessThanOrEqualTo'),
    };

    const modifierConfig = [
        CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO,
        CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN,
        CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN,
        CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO,
        CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO,
    ];

    const formatAmount = (amount: string | undefined) => {
        return getAmountFilterDisplayValue(amount, convertToDisplayStringWithoutCurrency);
    };

    if (selectedModifier) {
        const goBack = () => {
            setSelectedModifier(null);
        };

        const save = (newAmount: string) => {
            if (newAmount === '') {
                setAmountValues((prevAmountValues) => ({...prevAmountValues, [selectedModifier]: undefined}));
                goBack();
                return;
            }

            // When setting an Equal To value, clear Greater Than and Less Than to avoid conflicting filters.
            if (selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO) {
                setAmountValues({
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: '',
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: '',
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO]: undefined,
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO]: undefined,
                    [selectedModifier]: newAmount,
                });
            }

            // Editing an active comparison keeps other raw-query constraints; a new operator replaces its counterpart.
            if (selectedModifier !== CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO) {
                const oppositeModifier = {
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO,
                    [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO]: CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN,
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO,
                    [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO]: CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN,
                }[selectedModifier];
                setAmountValues((prevAmountValues) => ({
                    ...prevAmountValues,
                    [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: '',
                    [oppositeModifier]: prevAmountValues[selectedModifier] ? prevAmountValues[oppositeModifier] : undefined,
                    [selectedModifier]: newAmount,
                }));
            }
            goBack();
        };

        return (
            <AmountInput
                title={title[selectedModifier]}
                value={amountValues[selectedModifier] ?? ''}
                name={`${baseFilterKey}${selectedModifier}`}
                baseFilterKey={baseFilterKey}
                onBackButtonPress={goBack}
                onSave={save}
            />
        );
    }

    const applyChanges = () => {
        updateFilterForm(getAmountFilterFormValues(baseFilterKey, amountValues));
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={FILTER_VIEW_MAP[baseFilterKey].applySentryLabel}
        >
            {modifierConfig.map((modifier) => (
                <MenuItem
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.AMOUNT_MODIFIER_ITEM}
                    key={modifier}
                    title={title[modifier]}
                    description={formatAmount(amountValues[modifier])}
                    onPress={() => setSelectedModifier(modifier)}
                    shouldShowRightIcon
                    viewMode={CONST.OPTION_MODE.COMPACT}
                />
            ))}
        </BasePopup>
    );
}

export default AmountPopup;
