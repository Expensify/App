import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import type {SearchAmountFilterKeys} from '@components/Search/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PopoverComponentProps} from './DropdownButton';

type AmountPopupProps = PopoverComponentProps & {
    filterKey: SearchAmountFilterKeys;
    label: string;
    value: Record<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>, string | undefined>;
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

type AmountInputProps = {
    title: string;
    value: string;
    name: string;
    onSave: (value: string) => void;
    onBackButtonPress: () => void;
};

function AmountInput({title, value, name, onSave, onBackButtonPress}: AmountInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [amount, setAmount] = useState(value);

    return (
        <View style={[!shouldUseNarrowLayout && styles.pv4, styles.gap2]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10]}
                subtitle={title}
                onBackButtonPress={onBackButtonPress}
            />
            <AmountWithoutCurrencyInput
                containerStyles={styles.ph4}
                defaultValue={amount}
                onInputChange={setAmount}
                label={title}
                accessibilityLabel={title}
                name={name}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                shouldAllowNegative
                autoFocus
            />
            <View style={[styles.flexRow, styles.gap2, styles.ph5, styles.mt2]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={() => onSave('')}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_AMOUNT}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={() => onSave(amount)}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_AMOUNT}
                />
            </View>
        </View>
    );
}

function AmountPopup({filterKey, label, value, closeOverlay, updateFilterForm}: AmountPopupProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [selectedModifier, setSelectedModifier] = useState<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | null>(null);
    const [amountValues, setAmountValues] = useState(value);

    const title = {
        [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: translate('search.filters.amount.equalTo'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: translate('search.filters.amount.greaterThan'),
        [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: translate('search.filters.amount.lessThan'),
    };

    const modifierConfig = [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO, CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN, CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN];

    const formatAmount = (amount: string | undefined) => {
        return amount ? convertToFrontendAmountAsString(Number(amount)) : '';
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

    const onChange = (values: Record<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>, string | undefined>) => {
        const formValues: Record<string, string | undefined> = {};
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`] = values[CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO];
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`] = values[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN];
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`] = values[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN];
        updateFilterForm(formValues);
        closeOverlay();
    };

    const applyChanges = () => onChange(amountValues);

    const resetChanges = () => {
        onChange({
            [CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO]: undefined,
            [CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN]: undefined,
            [CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN]: undefined,
        });
    };

    return (
        <View style={[!isSmallScreenWidth && styles.pv4]}>
            {isSmallScreenWidth && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}
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
            <View style={[styles.flexRow, styles.gap2, styles.ph5, styles.mt2]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_AMOUNT}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_AMOUNT}
                />
            </View>
        </View>
    );
}

export default AmountPopup;
