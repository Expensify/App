import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import type {SearchAmountFilterKeys, SearchAmountValues} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useLocalize from '@hooks/useLocalize';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {Fragment, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';

const BETWEEN_MODIFIER = 'Between';

type AmountFilterContentProps = {
    filterKey: SearchAmountFilterKeys;
    value: SearchAmountValues;
    largeButton?: boolean;
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
    filterKey: SearchAmountFilterKeys;
    modifier: ValueOf<typeof CONST.SEARCH.AMOUNT_MODIFIERS>;
    value: string;
    label: string;
    autoFocus?: boolean;
};

function getBackendAmount(amount: string) {
    return amount ? convertToBackendAmount(Number(amount)).toString() : '';
}

function getFrontendAmount(amount: string | undefined) {
    return amount ? convertToFrontendAmountAsString(Number(amount), CONST.DEFAULT_CURRENCY_DECIMALS) : '';
}

function AmountInput({ref, filterKey, modifier, value, label, autoFocus}: AmountInputProps) {
    const styles = useThemeStyles();
    const [amount, setAmount] = useState(value);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const inputRef = useRef<BaseTextInputRef>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            const key = `${filterKey}${modifier}`;
            return {[key]: getBackendAmount(amount)};
        },
    }));

    useEffect(() => {
        if (!didScreenTransitionEnd || !autoFocus) {
            return;
        }
        inputRef.current?.focus();
    }, [didScreenTransitionEnd, autoFocus]);

    return (
        <AmountWithoutCurrencyInput
            ref={inputRef}
            containerStyles={[styles.ph4, styles.mv2]}
            defaultValue={value}
            onInputChange={setAmount}
            label={label}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            inputMode={CONST.INPUT_MODE.DECIMAL}
            shouldAllowNegative
        />
    );
}

type AmountBetweenInputProps = {
    ref: React.Ref<AmountFilterHandle>;
    filterKey: SearchAmountFilterKeys;
    greaterThanValue: string;
    lessThanValue: string;
    autoFocus?: boolean;
};

function AmountBetweenInput({ref, filterKey, greaterThanValue, lessThanValue, autoFocus}: AmountBetweenInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [greaterThanAmount, setGreaterThanAmount] = useState(greaterThanValue);
    const [lessThanAmount, setLessThanAmount] = useState(lessThanValue);
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const inputRef = useRef<BaseTextInputRef>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`;
            const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`;
            return {[greaterThanKey]: getBackendAmount(greaterThanAmount), [lessThanKey]: getBackendAmount(lessThanAmount)};
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
        <View style={[styles.flexRow, styles.gap1, styles.ph4, styles.mv2]}>
            <AmountWithoutCurrencyInput
                ref={inputRef}
                containerStyles={styles.flex1}
                defaultValue={greaterThanValue}
                onInputChange={setGreaterThanAmount}
                label={greaterThanLabel}
                accessibilityLabel={greaterThanLabel}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                shouldAllowNegative
            />
            <AmountWithoutCurrencyInput
                containerStyles={styles.flex1}
                defaultValue={lessThanValue}
                onInputChange={setLessThanAmount}
                label={lessThanLabel}
                accessibilityLabel={lessThanLabel}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                shouldAllowNegative
            />
        </View>
    );
}

function AmountFilterContent({filterKey, value, autoFocus, largeButton, style, buttonText, onChange}: AmountFilterContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

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
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.EQUAL_TO}`] = undefined;
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`] = undefined;
        formValues[`${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`] = undefined;
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
    const label = translate(FILTER_VIEW_MAP[filterKey].labelKey);

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
                            keyForList={config.keyForList}
                            onSelectRow={() => setSelectedModifier(config.keyForList)}
                            wrapperStyle={styles.optionRowCompact}
                        />
                        {config.isSelected &&
                            (config.keyForList === BETWEEN_MODIFIER ? (
                                <AmountBetweenInput
                                    ref={inputRef}
                                    filterKey={filterKey}
                                    greaterThanValue={getFrontendAmount(value?.[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN])}
                                    lessThanValue={getFrontendAmount(value?.[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN])}
                                    autoFocus={autoFocus}
                                />
                            ) : (
                                <AmountInput
                                    ref={inputRef}
                                    filterKey={filterKey}
                                    modifier={config.keyForList}
                                    value={getFrontendAmount(value?.[config.keyForList])}
                                    label={label}
                                    autoFocus={autoFocus}
                                />
                            ))}
                    </Fragment>
                ))}
            </ScrollView>
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                large={largeButton}
                text={buttonText ?? translate('common.confirm')}
                pressOnEnter
                onPress={updateAmountFilter}
            />
        </View>
    );
}

export default AmountFilterContent;
export type {AmountFilterContentProps};
