import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import AmountFilterInput from '@components/Search/FilterComponents/AmountFilterInput';
import type {SearchAmountFilterKeys, SearchAmountValues} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAmountFilterCurrency from '@hooks/useAmountFilterCurrency';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {formatAmountFilterValue, getAmountFilterInputValue} from '@libs/SearchAmountFilterUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {Fragment, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';

const BETWEEN_MODIFIER = 'Between';

type AmountFilterContentProps = {
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

type AmountBetweenInputProps = {
    ref: React.Ref<AmountFilterHandle>;
    baseFilterKey: SearchAmountFilterKeys;
    greaterThanValue: string;
    lessThanValue: string;
    autoFocus?: boolean;
};

function AmountBetweenInput({ref, baseFilterKey, greaterThanValue, lessThanValue, autoFocus}: AmountBetweenInputProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
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
            const greaterThanKey = `${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`;
            const lessThanKey = `${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`;
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

    const greaterThanLabel = translate('search.filters.amount.greaterThan');
    const lessThanLabel = translate('search.filters.amount.lessThan');

    return (
        <View style={[shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow, styles.gap1, styles.ph4, styles.mv2]}>
            <AmountFilterInput
                ref={inputRef}
                baseFilterKey={baseFilterKey}
                containerStyles={styles.flex1}
                amount={greaterThanAmount}
                currency={greaterThanCurrency}
                onAmountChange={setGreaterThanAmount}
                onCurrencyChange={setGreaterThanCurrency}
                label={greaterThanLabel}
            />
            <AmountFilterInput
                baseFilterKey={baseFilterKey}
                containerStyles={styles.flex1}
                amount={lessThanAmount}
                currency={lessThanCurrency}
                onAmountChange={setLessThanAmount}
                onCurrencyChange={setLessThanCurrency}
                label={lessThanLabel}
            />
        </View>
    );
}

function AmountFilterContent({baseFilterKey, value, autoFocus, buttonSize, style, buttonText, onChange}: AmountFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const shouldButtonBeInScrollView = useShouldFooterBeInsideList();

    const getInitialSelectedAmountModifier = () => {
        const hasLessThan = !!value?.[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN];
        const hasGreaterThan = !!value?.[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN];
        if (hasLessThan && hasGreaterThan) {
            return BETWEEN_MODIFIER;
        }

        if (hasGreaterThan) {
            return CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN;
        }

        if (hasLessThan) {
            return CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN;
        }

        return CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO;
    };
    const [selectedModifier, setSelectedModifier] = useState<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | typeof BETWEEN_MODIFIER>(getInitialSelectedAmountModifier);

    const inputRef = useRef<AmountFilterHandle>(null);

    const updateAmountFilter = () => {
        if (!inputRef.current) {
            return;
        }

        const formValues: AmountFilterValues = {};
        formValues[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`] = undefined;
        formValues[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`] = undefined;
        formValues[`${baseFilterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`] = undefined;
        onChange({
            ...formValues,
            ...inputRef.current.getValue(),
        });
    };

    const modifierConfig: Array<ListItem<ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS> | typeof BETWEEN_MODIFIER>> = [
        {keyForList: CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO, text: translate('search.filters.amount.equalTo'), isSelected: selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO},
        {
            keyForList: CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN,
            text: translate('search.filters.amount.greaterThan'),
            isSelected: selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN,
        },
        {keyForList: CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN, text: translate('search.filters.amount.lessThan'), isSelected: selectedModifier === CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN},
        {keyForList: BETWEEN_MODIFIER, text: translate('search.filters.amount.between'), isSelected: selectedModifier === BETWEEN_MODIFIER},
    ];
    const label = translate(FILTER_VIEW_MAP[baseFilterKey].labelKey);

    const button = (
        <Button
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
                {modifierConfig.map((config) => (
                    <Fragment key={config.keyForList}>
                        <SingleSelectListItem
                            item={config}
                            showTooltip={false}
                            onSelectRow={() => setSelectedModifier(config.keyForList)}
                            wrapperStyle={styles.optionRowCompact}
                        />
                        {config.isSelected &&
                            (config.keyForList === BETWEEN_MODIFIER ? (
                                <AmountBetweenInput
                                    ref={inputRef}
                                    baseFilterKey={baseFilterKey}
                                    greaterThanValue={value?.[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN] ?? ''}
                                    lessThanValue={value?.[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN] ?? ''}
                                    autoFocus={autoFocus}
                                />
                            ) : (
                                <AmountInput
                                    ref={inputRef}
                                    baseFilterKey={baseFilterKey}
                                    modifier={config.keyForList}
                                    value={value?.[config.keyForList] ?? ''}
                                    label={label}
                                    autoFocus={autoFocus}
                                />
                            ))}
                    </Fragment>
                ))}
                {shouldButtonBeInScrollView && button}
            </ScrollView>
            {!shouldButtonBeInScrollView && button}
        </View>
    );
}

export default AmountFilterContent;
export type {AmountFilterContentProps};
