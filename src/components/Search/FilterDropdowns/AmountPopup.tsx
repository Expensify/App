import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import MenuItem from '@components/MenuItem';
import type {SearchAmountFilterKeys, SearchAmountValues} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

import BasePopup from './BasePopup';

type AmountPopupProps = {
    filterKey: SearchAmountFilterKeys;
    label: string;
    value: SearchAmountValues;
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
    closeOverlay: () => void;
};

type AmountInputProps = {
    title: string;
    value: string;
    name: string;
    onSave: (value: string) => void;
    onBackButtonPress: () => void;
};

function AmountInput({title, value, name, onSave, onBackButtonPress}: AmountInputProps) {
    const styles = useThemeStyles();
    const [amount, setAmount] = useState(value);

    return (
        <BasePopup
            label={title}
            onApply={() => onSave(amount)}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_AMOUNT}
            onBackButtonPress={onBackButtonPress}
        >
            <AmountWithoutCurrencyInput
                containerStyles={[styles.ph4, styles.mb2]}
                defaultValue={value}
                onInputChange={setAmount}
                label={title}
                accessibilityLabel={title}
                name={name}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                shouldAllowNegative
                autoFocus
            />
        </BasePopup>
    );
}

function AmountPopup({filterKey, label, value, closeOverlay, updateFilterForm}: AmountPopupProps) {
    const {translate} = useLocalize();
    const [selectedModifier, setSelectedModifier] = useState<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | null>(null);
    const [amountValues, setAmountValues] = useState(value);

    const title = {
        [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: translate('search.filters.amount.equalTo'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: translate('search.filters.amount.greaterThan'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: translate('search.filters.amount.lessThan'),
    };

    const modifierConfig = [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO, CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN, CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN];

    const formatAmount = (amount: string | undefined) => {
        return amount ? convertToFrontendAmountAsString(Number(amount), CONST.DEFAULT_CURRENCY_DECIMALS) : '';
    };

    if (selectedModifier) {
        const goBack = () => {
            setSelectedModifier(null);
        };

        const save = (rawAmount: string) => {
            if (rawAmount.trim() === '') {
                setAmountValues((prevAmountValues) => ({...prevAmountValues, [selectedModifier]: undefined}));
                goBack();
                return;
            }

            const newAmount = convertToBackendAmount(Number(rawAmount)).toString();

            // When setting an Equal To value, clear Greater Than and Less Than to avoid conflicting filters.
            if (selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO) {
                setAmountValues({[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: '', [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: '', [selectedModifier]: newAmount});
            }

            // When setting Greater Than or Less Than, clear Equal To to avoid conflicting filters.
            if (selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN || selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN) {
                setAmountValues((prevAmountValues) => ({...prevAmountValues, [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: '', [selectedModifier]: newAmount}));
            }
            goBack();
        };

        return (
            <AmountInput
                title={title[selectedModifier]}
                value={formatAmount(amountValues[selectedModifier])}
                name={`${filterKey}${selectedModifier}`}
                onBackButtonPress={goBack}
                onSave={save}
            />
        );
    }

    const onChange = (values: SearchAmountValues) => {
        const formValues: Record<string, string | undefined> = {};
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`] = values[CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO];
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`] = values[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN];
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`] = values[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN];
        updateFilterForm(formValues);
        closeOverlay();
    };

    const applyChanges = () => onChange(amountValues);

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_AMOUNT}
        >
            {modifierConfig.map((modifier) => (
                <MenuItem
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
