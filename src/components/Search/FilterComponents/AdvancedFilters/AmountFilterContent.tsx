import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';
import type {SearchAmountFilterKeys, SearchAmountValues} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAmountFilterCurrency from '@hooks/useAmountFilterCurrency';
import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatAmountFilterValue, getAmountFilterFormValues, getAmountFilterInputValue} from '@libs/SearchAmountFilterUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';

const BETWEEN_MODIFIER = 'Between';

type AmountFilterContentProps = WithRequiredSentryLabel & {
    baseFilterKey: SearchAmountFilterKeys;
    value: SearchAmountValues;
    buttonSize?: Exclude<ValueOf<typeof CONST.BUTTON_SIZE>, typeof CONST.BUTTON_SIZE.SMALL>;
    autoFocus?: boolean;
    style?: StyleProp<ViewStyle>;
    buttonText?: string;
    onChange: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

type AmountFilterValues = Partial<Record<`${SearchAmountFilterKeys}${ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>}`, string>>;
type AmountFilterHandle = {
    getValue: () => AmountFilterValues;
};

type AmountInputProps = {
    ref: React.Ref<AmountFilterHandle>;
    baseFilterKey: SearchAmountFilterKeys;
    modifier: ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>;
    value: string;
    label: string;
    autoFocus?: boolean;
};

function AmountInput({ref, baseFilterKey, modifier, value, label, autoFocus}: AmountInputProps) {
    const styles = useThemeStyles();
    const initialValue = getAmountFilterInputValue(value);
    const [amount, setAmount] = useState(initialValue.amount);
    const {currency, setCurrency} = useAmountFilterCurrency(baseFilterKey, value);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const inputRef = useRef<BaseTextInputRef>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            const key = `${baseFilterKey}${modifier}`;
            return {[key]: formatAmountFilterValue(amount, currency)};
        },
    }));

    useEffect(() => {
        if (!didScreenTransitionEnd || !autoFocus) {
            return;
        }
        inputRef.current?.focus();
    }, [didScreenTransitionEnd, autoFocus]);

    return (
        <AmountFilterInput
            ref={inputRef}
            baseFilterKey={baseFilterKey}
            containerStyles={[styles.ph4, styles.mv2]}
            amount={amount}
            currency={currency}
            onAmountChange={setAmount}
            onCurrencyChange={setCurrency}
            label={label}
        />
    );
}

type AmountFilterOptionProps = AmountInputProps & {
    selectedModifier: ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | typeof BETWEEN_MODIFIER;
    onSelectModifier: (modifier: ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>) => void;
};

function AmountFilterOption({ref, baseFilterKey, modifier, value, label, autoFocus, selectedModifier, onSelectModifier}: AmountFilterOptionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isSelected = selectedModifier === modifier;

    return (
        <>
            <SingleSelectListItem
                item={{keyForList: modifier, text: label, isSelected}}
                showTooltip={false}
                onSelectRow={() => onSelectModifier(modifier)}
                wrapperStyle={styles.optionRowCompact}
            />
            {isSelected && (
                <AmountInput
                    ref={ref}
                    baseFilterKey={baseFilterKey}
                    modifier={modifier}
                    value={value}
                    label={translate(FILTER_VIEW_MAP[baseFilterKey].labelKey)}
                    autoFocus={autoFocus}
                />
            )}
        </>
    );
}

type AmountBetweenInputProps = {
    ref: React.Ref<AmountFilterHandle>;
    baseFilterKey: SearchAmountFilterKeys;
    greaterThanValue: string;
    lessThanValue: string;
    greaterThanModifier: typeof CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN | typeof CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO;
    lessThanModifier: typeof CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN | typeof CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO;
    autoFocus?: boolean;
};

function AmountBetweenInput({ref, baseFilterKey, greaterThanValue, lessThanValue, greaterThanModifier, lessThanModifier, autoFocus}: AmountBetweenInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const initialGreaterThan = getAmountFilterInputValue(greaterThanValue);
    const initialLessThan = getAmountFilterInputValue(lessThanValue);
    const [greaterThanAmount, setGreaterThanAmount] = useState(initialGreaterThan.amount);
    const [lessThanAmount, setLessThanAmount] = useState(initialLessThan.amount);
    const {currency: greaterThanCurrency, setCurrency: setGreaterThanCurrency} = useAmountFilterCurrency(baseFilterKey, greaterThanValue);
    const {currency: lessThanCurrency, setCurrency: setLessThanCurrency} = useAmountFilterCurrency(baseFilterKey, lessThanValue);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const inputRef = useRef<BaseTextInputRef>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            const greaterThanKey = `${baseFilterKey}${greaterThanModifier}`;
            const lessThanKey = `${baseFilterKey}${lessThanModifier}`;
            return {
                [greaterThanKey]: formatAmountFilterValue(greaterThanAmount, greaterThanCurrency),
                [lessThanKey]: formatAmountFilterValue(lessThanAmount, lessThanCurrency),
            };
        },
    }));

    useEffect(() => {
        if (!didScreenTransitionEnd || !autoFocus) {
            return;
        }
        inputRef.current?.focus();
    }, [didScreenTransitionEnd, autoFocus]);

    const greaterThanLabel = translate(
        greaterThanModifier === CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO ? 'search.filters.amount.greaterThanOrEqualTo' : 'search.filters.amount.greaterThan',
    );
    const lessThanLabel = translate(lessThanModifier === CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO ? 'search.filters.amount.lessThanOrEqualTo' : 'search.filters.amount.lessThan');

    return (
        <View style={[styles.flexColumn, styles.gap1, styles.ph4, styles.mv2]}>
            <AmountFilterInput
                ref={inputRef}
                baseFilterKey={baseFilterKey}
                amount={greaterThanAmount}
                currency={greaterThanCurrency}
                onAmountChange={setGreaterThanAmount}
                onCurrencyChange={setGreaterThanCurrency}
                label={greaterThanLabel}
            />
            <AmountFilterInput
                baseFilterKey={baseFilterKey}
                amount={lessThanAmount}
                currency={lessThanCurrency}
                onAmountChange={setLessThanAmount}
                onCurrencyChange={setLessThanCurrency}
                label={lessThanLabel}
            />
        </View>
    );
}

function AmountFilterContent({baseFilterKey, value, autoFocus, buttonSize, style, buttonText, sentryLabel, onChange}: AmountFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const shouldButtonBeInScrollView = useShouldFooterBeInsideList();
    const greaterThanModifier = value[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO]
        ? CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO
        : CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN;
    const lessThanModifier = value[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO] ? CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO : CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN;

    const getInitialSelectedAmountModifier = () => {
        const hasLessThan = !!value[lessThanModifier];
        const hasGreaterThan = !!value[greaterThanModifier];
        if (hasLessThan && hasGreaterThan) {
            return BETWEEN_MODIFIER;
        }

        if (hasGreaterThan) {
            return greaterThanModifier;
        }

        if (hasLessThan) {
            return lessThanModifier;
        }

        return CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO;
    };
    const [selectedModifier, setSelectedModifier] = useState<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | typeof BETWEEN_MODIFIER>(getInitialSelectedAmountModifier);

    const inputRef = useRef<AmountFilterHandle>(null);

    const updateAmountFilter = () => {
        if (!inputRef.current) {
            return;
        }

        const inputValues = inputRef.current.getValue();
        // Keep constraints outside the active input so confirming a raw query cannot broaden it.
        const formValues = getAmountFilterFormValues(baseFilterKey, selectedModifier === getInitialSelectedAmountModifier() ? value : undefined);
        onChange({...formValues, ...inputValues});
    };

    const button = (
        <Button
            sentryLabel={sentryLabel}
            style={[styles.ph5, styles.pb5]}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={buttonSize}
            onPress={updateAmountFilter}
        >
            <Button.KeyboardShortcut />
            <Button.Text>{buttonText ?? translate('common.confirm')}</Button.Text>
        </Button>
    );

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, style]}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
                // In landscape mode, when the virtual keyboard appears, the entire ScrollView shrinks and no longer receives input,
                // so we set a minimum height to have enough visibility.
                style={[StyleUtils.getMinimumHeight(50)]}
            >
                <AmountFilterOption
                    ref={inputRef}
                    baseFilterKey={baseFilterKey}
                    modifier={CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}
                    value={value[CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO] ?? ''}
                    label={translate('search.filters.amount.equalTo')}
                    selectedModifier={selectedModifier}
                    onSelectModifier={setSelectedModifier}
                    autoFocus={autoFocus}
                />
                <AmountFilterOption
                    ref={inputRef}
                    baseFilterKey={baseFilterKey}
                    modifier={CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}
                    value={value[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN] ?? ''}
                    label={translate('search.filters.amount.greaterThan')}
                    selectedModifier={selectedModifier}
                    onSelectModifier={setSelectedModifier}
                    autoFocus={autoFocus}
                />
                <AmountFilterOption
                    ref={inputRef}
                    baseFilterKey={baseFilterKey}
                    modifier={CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}
                    value={value[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN] ?? ''}
                    label={translate('search.filters.amount.lessThan')}
                    selectedModifier={selectedModifier}
                    onSelectModifier={setSelectedModifier}
                    autoFocus={autoFocus}
                />
                <AmountFilterOption
                    ref={inputRef}
                    baseFilterKey={baseFilterKey}
                    modifier={CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO}
                    value={value[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN_OR_EQUAL_TO] ?? ''}
                    label={translate('search.filters.amount.greaterThanOrEqualTo')}
                    selectedModifier={selectedModifier}
                    onSelectModifier={setSelectedModifier}
                    autoFocus={autoFocus}
                />
                <AmountFilterOption
                    ref={inputRef}
                    baseFilterKey={baseFilterKey}
                    modifier={CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO}
                    value={value[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN_OR_EQUAL_TO] ?? ''}
                    label={translate('search.filters.amount.lessThanOrEqualTo')}
                    selectedModifier={selectedModifier}
                    onSelectModifier={setSelectedModifier}
                    autoFocus={autoFocus}
                />
                <SingleSelectListItem
                    item={{keyForList: BETWEEN_MODIFIER, text: translate('search.filters.amount.between'), isSelected: selectedModifier === BETWEEN_MODIFIER}}
                    showTooltip={false}
                    onSelectRow={() => setSelectedModifier(BETWEEN_MODIFIER)}
                    wrapperStyle={styles.optionRowCompact}
                />
                {selectedModifier === BETWEEN_MODIFIER && (
                    <AmountBetweenInput
                        ref={inputRef}
                        baseFilterKey={baseFilterKey}
                        greaterThanValue={value[greaterThanModifier] ?? ''}
                        lessThanValue={value[lessThanModifier] ?? ''}
                        greaterThanModifier={greaterThanModifier}
                        lessThanModifier={lessThanModifier}
                        autoFocus={autoFocus}
                    />
                )}
                {shouldButtonBeInScrollView && button}
            </ScrollView>
            {!shouldButtonBeInScrollView && button}
        </View>
    );
}

export default AmountFilterContent;
export type {AmountFilterContentProps};
