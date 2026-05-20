import React, {Fragment, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AmountWithoutCurrencyInput from '@components/AmountWithoutCurrencyInput';
import Button from '@components/Button';
import ScrollView from '@components/ScrollView';
import type {SearchAmountFilterKeys, SearchAmountValues} from '@components/Search/types';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToBackendAmount, convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {FILTER_VIEW_MAP} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import useFullscreenAdvancedFilters from './useFullscreenAdvancedFilters';

const BETWEEN_MODIFIER = 'Between';

type AmountFilterComponentProps = {
    filterKey: SearchAmountFilterKeys;
    value: SearchAmountValues;
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
};

function getBackendAmount(amount: string) {
    return amount ? convertToBackendAmount(Number(amount)).toString() : '';
}

function getFrontendAmount(amount: string | undefined) {
    return amount ? convertToFrontendAmountAsString(Number(amount), CONST.DEFAULT_CURRENCY_DECIMALS) : '';
}

function AmountInput({ref, filterKey, modifier, value, label}: AmountInputProps) {
    const styles = useThemeStyles();
    const fullscreen = useFullscreenAdvancedFilters();
    const [amount, setAmount] = useState(value);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            const key = `${filterKey}${modifier}`;
            return {[key]: getBackendAmount(amount)};
        },
    }));

    return (
        <AmountWithoutCurrencyInput
            containerStyles={[styles.ph4, styles.mv2]}
            defaultValue={value}
            onInputChange={setAmount}
            label={label}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            inputMode={CONST.INPUT_MODE.DECIMAL}
            shouldAllowNegative
            autoFocus={fullscreen}
        />
    );
}

type AmountBetweenInputProps = {
    ref: React.Ref<AmountFilterHandle>;
    filterKey: SearchAmountFilterKeys;
    greaterThanValue: string;
    lessThanValue: string;
};

function AmountBetweenInput({ref, filterKey, greaterThanValue, lessThanValue}: AmountBetweenInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const fullscreen = useFullscreenAdvancedFilters();
    const [greaterThanAmount, setGreaterThanAmount] = useState(greaterThanValue);
    const [lessThanAmount, setLessThanAmount] = useState(lessThanValue);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            const greaterThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN}`;
            const lessThanKey = `${filterKey}${CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN}`;
            return {[greaterThanKey]: getBackendAmount(greaterThanAmount), [lessThanKey]: getBackendAmount(lessThanAmount)};
        },
    }));

    const greaterThanLabel = translate('search.filters.amount.greaterThan');
    const lessThanLabel = translate('search.filters.amount.lessThan');

    return (
        <View style={[styles.flexRow, styles.gap1, styles.ph4, styles.mv2]}>
            <AmountWithoutCurrencyInput
                containerStyles={styles.flex1}
                defaultValue={greaterThanValue}
                onInputChange={setGreaterThanAmount}
                label={greaterThanLabel}
                accessibilityLabel={greaterThanLabel}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.DECIMAL}
                shouldAllowNegative
                autoFocus={fullscreen}
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

function AmountFilterComponent({filterKey, value, onChange}: AmountFilterComponentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const fullscreen = useFullscreenAdvancedFilters();

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
        <View style={[styles.flex1, styles.justifyContentBetween, !fullscreen && styles.pv2]}>
            <ScrollView keyboardShouldPersistTaps="handled">
                {modifierConfig.map((config) => (
                    <Fragment key={config.keyForList}>
                        <SingleSelectListItem
                            item={config}
                            showTooltip={false}
                            keyForList={config.keyForList}
                            onSelectRow={() => setSelectedModifier(config.keyForList)}
                        />
                        {config.isSelected &&
                            (config.keyForList === BETWEEN_MODIFIER ? (
                                <AmountBetweenInput
                                    ref={inputRef}
                                    filterKey={filterKey}
                                    greaterThanValue={getFrontendAmount(value?.[CONST.SEARCH.AMOUNT_MODIFIERS.GREATER_THAN])}
                                    lessThanValue={getFrontendAmount(value?.[CONST.SEARCH.AMOUNT_MODIFIERS.LESS_THAN])}
                                />
                            ) : (
                                <AmountInput
                                    ref={inputRef}
                                    filterKey={filterKey}
                                    modifier={config.keyForList}
                                    value={getFrontendAmount(value?.[config.keyForList])}
                                    label={label}
                                />
                            ))}
                    </Fragment>
                ))}
            </ScrollView>
            <Button
                style={[styles.ph5, styles.pb5]}
                success
                medium={!fullscreen}
                large={fullscreen}
                text={translate('common.confirm')}
                onPress={updateAmountFilter}
            />
        </View>
    );
}

export default AmountFilterComponent;
