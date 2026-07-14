import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {DateFilterBaseHandle} from '@components/Search/FilterComponents/DateFilterBase';
import type {ReportFieldDateKey, ReportFieldTextKey} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDateModifierTitle} from '@libs/SearchQueryUtils';
import {getDateDisplayValue, getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {createAllPolicyReportFieldsSelector} from '@src/selectors/Policy';
import type {Policy, PolicyReportField} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import React, {useImperativeHandle, useRef, useState} from 'react';

import ReportFieldList from './ReportFieldList';
import ReportFieldText from './ReportFieldText';

type ReportFieldValues = Record<ReportFieldTextKey | ReportFieldDateKey, string | undefined>;

type ReportFieldHandle = {
    getValue: () => ReportFieldValues;
    getEmptyValue: () => ReportFieldValues;
    isDateModifierSelected: () => boolean;
    applySelectedFieldAndGoBack: () => ReportFieldValues | void;
};

type ReportFieldBaseProps = {
    ref: React.Ref<ReportFieldHandle>;
    values: ReportFieldValues | undefined;
    selectedField: PolicyReportField | null;
    hasFeed: boolean;
    style?: StyleProp<ViewStyle>;
    onFieldSelected: (field: PolicyReportField | null) => void;
    onError: (error: string | undefined) => void;
};

type SelectedReportFieldProps = {
    ref: React.Ref<ReportFieldHandle>;
    field: PolicyReportField;
    value: string | undefined;
    onError: (error: string | undefined) => void;
};

type SelectedDateReportFieldProps = {
    ref: React.Ref<ReportFieldHandle>;
    field: PolicyReportField;
    value: Record<ReportFieldDateKey, string | undefined>;
    hasFeed: boolean;
    selectedDateModifier: SearchDateModifier | null;
    onDateModifierSelected: (modifier: SearchDateModifier | null) => void;
};

function getFieldNameAsKey(fieldName: string) {
    return fieldName.toLowerCase().replaceAll(' ', '-');
}

function getFilterKey(fieldName: string) {
    const suffix = getFieldNameAsKey(fieldName);
    return `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${suffix}` as const;
}

function SelectedReportField({ref, field, value: initialValue, onError}: SelectedReportFieldProps) {
    const [value, setValue] = useState(initialValue);
    const fieldType = field.type as Exclude<ValueOf<typeof CONST.REPORT_FIELD_TYPES>, typeof CONST.REPORT_FIELD_TYPES.FORMULA | typeof CONST.REPORT_FIELD_TYPES.DATE>;
    const filterKey = getFilterKey(field.name);

    const UpdateReportFieldComponent = {
        [CONST.REPORT_FIELD_TYPES.LIST]: ReportFieldList,
        [CONST.REPORT_FIELD_TYPES.TEXT]: ReportFieldText,
    }[fieldType];

    useImperativeHandle(ref, () => ({
        getValue: () => {
            return {[filterKey]: value};
        },
        getEmptyValue: () => {
            return {[filterKey]: ''};
        },
        isDateModifierSelected: () => false,
        applySelectedFieldAndGoBack: () => {},
    }));

    return (
        <UpdateReportFieldComponent
            filterKey={filterKey}
            field={field}
            value={value}
            onChange={setValue}
            onError={onError}
        />
    );
}

function SelectedDateReportField({ref, field, value: initialValue, selectedDateModifier, hasFeed, onDateModifierSelected}: SelectedDateReportFieldProps) {
    const filterKey = getFilterKey(field.name);
    const suffix = getFieldNameAsKey(field.name);
    const onKey = `${CONST.SEARCH.REPORT_FIELD.ON_PREFIX}${suffix}` as const;
    const afterKey = `${CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX}${suffix}` as const;
    const beforeKey = `${CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX}${suffix}` as const;
    const rangeKey = `${CONST.SEARCH.REPORT_FIELD.RANGE_PREFIX}${suffix}` as const;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [value, setValue] = useState({
        [CONST.SEARCH.DATE_MODIFIERS.ON]: initialValue[onKey],
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: initialValue[afterKey],
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: initialValue[beforeKey],
        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: initialValue[rangeKey],
    });

    const dateFilterRef = useRef<DateFilterBaseHandle>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => ({
            [onKey]: value[CONST.SEARCH.DATE_MODIFIERS.ON],
            [afterKey]: value[CONST.SEARCH.DATE_MODIFIERS.AFTER],
            [beforeKey]: value[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
            [rangeKey]: value[CONST.SEARCH.DATE_MODIFIERS.RANGE],
        }),
        getEmptyValue: () => ({
            [onKey]: '',
            [afterKey]: '',
            [beforeKey]: '',
            [rangeKey]: '',
        }),
        isDateModifierSelected: () => !!selectedDateModifier,
        applySelectedFieldAndGoBack: () => {
            dateFilterRef.current?.save();
        },
    }));

    return (
        <>
            {!!selectedDateModifier && (
                <HeaderWithBackButton
                    style={[styles.h10]}
                    subtitle={selectedDateModifier ? getDateModifierTitle(selectedDateModifier, '', translate) : ''}
                    onBackButtonPress={() => dateFilterRef.current?.goBack()}
                />
            )}
            <DateFilterBase
                ref={dateFilterRef}
                style={styles.flexShrink1}
                shouldShowHeader={false}
                onDateValuesChange={setValue}
                selectedDateModifier={selectedDateModifier}
                onSelectDateModifier={onDateModifierSelected}
                defaultDateValues={value}
                presets={getDatePresets(filterKey, hasFeed)}
                onSubmit={() => {}}
                shouldShowActionButtons={false}
            />
        </>
    );
}

function ReportFieldBase({ref, values: initialValues = {}, selectedField, hasFeed, style, onFieldSelected, onError}: ReportFieldBaseProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const policyReportFieldsSelector = (policies: OnyxCollection<Policy>) => createAllPolicyReportFieldsSelector(policies, localeCompare);
    const [fieldList] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: policyReportFieldsSelector,
    });
    const [values, setValues] = useState<ReportFieldValues>(initialValues);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const selectedFieldRef = useRef<ReportFieldHandle>(null);

    const getValue = (fieldName: string) => {
        const filterKey = getFilterKey(fieldName);
        return values[filterKey]?.trim();
    };

    const getDateValue = (fieldName: string) => {
        const suffix = getFieldNameAsKey(fieldName);
        const onKey = `${CONST.SEARCH.REPORT_FIELD.ON_PREFIX}${suffix}` as const;
        const beforeKey = `${CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX}${suffix}` as const;
        const afterKey = `${CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX}${suffix}` as const;
        const rangeKey = `${CONST.SEARCH.REPORT_FIELD.RANGE_PREFIX}${suffix}` as const;
        return {
            [onKey]: values[onKey],
            [beforeKey]: values[beforeKey],
            [afterKey]: values[afterKey],
            [rangeKey]: values[rangeKey],
        };
    };

    useImperativeHandle(ref, () => ({
        getValue: () => values,
        getEmptyValue: () =>
            Object.values(fieldList ?? {}).reduce(
                (acc, field) => {
                    const suffix = getFieldNameAsKey(field.name);
                    const filterKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${suffix}` as const;
                    if (field.type === CONST.REPORT_FIELD_TYPES.DATE) {
                        acc[`${CONST.SEARCH.REPORT_FIELD.ON_PREFIX}${suffix}`] = undefined;
                        acc[`${CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX}${suffix}`] = undefined;
                        acc[`${CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX}${suffix}`] = undefined;
                        acc[`${CONST.SEARCH.REPORT_FIELD.RANGE_PREFIX}${suffix}`] = undefined;
                    } else {
                        acc[filterKey] = undefined;
                    }
                    return acc;
                },
                {} as Record<ReportFieldTextKey | ReportFieldDateKey, undefined>,
            ),
        applySelectedFieldAndGoBack: () => {
            if (!selectedFieldRef.current) {
                return;
            }

            if (selectedFieldRef.current.isDateModifierSelected()) {
                selectedFieldRef.current.applySelectedFieldAndGoBack();
                return;
            }

            const selectedValue = selectedFieldRef.current.getValue();
            setValues((prevValues) => ({...prevValues, ...selectedValue}));
            onFieldSelected(null);
            return selectedValue;
        },
        isDateModifierSelected: () => !!selectedFieldRef.current?.isDateModifierSelected(),
    }));

    if (selectedField) {
        return (
            <>
                {!selectedDateModifier && (
                    <HeaderWithBackButton
                        style={[styles.h10]}
                        subtitle={selectedField.name}
                        onBackButtonPress={() => onFieldSelected(null)}
                    />
                )}
                {selectedField.type === CONST.REPORT_FIELD_TYPES.DATE ? (
                    <SelectedDateReportField
                        ref={selectedFieldRef}
                        field={selectedField}
                        value={getDateValue(selectedField.name)}
                        hasFeed={hasFeed}
                        selectedDateModifier={selectedDateModifier}
                        onDateModifierSelected={setSelectedDateModifier}
                    />
                ) : (
                    <SelectedReportField
                        ref={selectedFieldRef}
                        field={selectedField}
                        value={getValue(selectedField.name)}
                        onError={onError}
                    />
                )}
            </>
        );
    }

    const listItems = Object.values(fieldList ?? {}).map((field) => {
        if (field.type === CONST.REPORT_FIELD_TYPES.DATE) {
            return {key: field.fieldID, name: field.name, value: getDateDisplayValue(getFilterKey(field.name), getDateValue(field.name), translate), field};
        }

        return {key: field.fieldID, name: field.name, value: getValue(field.name), field};
    });

    return (
        <ScrollView contentContainerStyle={[style]}>
            {listItems.map((item) => (
                <MenuItem
                    key={item.key}
                    shouldShowRightIcon
                    viewMode={CONST.OPTION_MODE.COMPACT}
                    title={item.name}
                    description={item.value}
                    onPress={() => onFieldSelected(item.field)}
                />
            ))}
        </ScrollView>
    );
}

export default ReportFieldBase;
export type {ReportFieldHandle};
