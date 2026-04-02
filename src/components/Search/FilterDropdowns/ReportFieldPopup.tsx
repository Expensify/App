import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScrollView from '@components/ScrollView';
import type {SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {ReportFieldDateKey, ReportFieldTextKey} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDateRangeDisplayValueFromFormValue, isSearchDatePreset} from '@libs/SearchQueryUtils';
import {getDatePresets} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {createAllPolicyReportFieldsSelector} from '@src/selectors/Policy';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import BasePopup from './BasePopup';
import DateSelectPopup from './DateSelectPopup';
import SingleSelectPopup from './SingleSelectPopup';
import TextInputPopup from './TextInputPopup';

type ReportFieldPopupProps = {
    closeOverlay: () => void;
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

type ReportFieldSubPopupProps = {
    field: PolicyReportField;
    value: string;
    onBackButtonPress: () => void;
    onChange: (newValue: string) => void;
};

type ReportFieldDatePopupProps = {
    field: PolicyReportField;
    value: SearchDateValues;
    onBackButtonPress: () => void;
    onChange: (newValue: SearchDateValues) => void;
};

function getFieldNameAsKey(fieldName: string) {
    return fieldName.toLowerCase().replaceAll(' ', '-');
}

function ReportFieldListPopup({value, field, onBackButtonPress, onChange}: ReportFieldSubPopupProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const items = field.values.map((fieldValue) => ({
        value: fieldValue,
        text: fieldValue,
    }));
    const selectedValue = {text: value, value};

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10]}
                subtitle={field.name}
                onBackButtonPress={onBackButtonPress}
            />
            <SingleSelectPopup
                style={styles.pv0}
                items={items}
                value={selectedValue}
                closeOverlay={onBackButtonPress}
                onChange={(item) => onChange(item?.value ?? '')}
            />
        </View>
    );
}

function ReportFieldDatePopup({value, field, onBackButtonPress, onChange}: ReportFieldDatePopupProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const filterKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${getFieldNameAsKey(field.name)}` as const;

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10]}
                subtitle={field.name}
                onBackButtonPress={onBackButtonPress}
            />
            <DateSelectPopup
                style={styles.pv0}
                value={value}
                onChange={onChange}
                closeOverlay={onBackButtonPress}
                presets={getDatePresets(filterKey, true)}
            />
        </View>
    );
}

function ReportFieldTextPopup({field, value, onBackButtonPress, onChange}: ReportFieldSubPopupProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10]}
                subtitle={field.name}
                onBackButtonPress={onBackButtonPress}
            />
            <TextInputPopup
                style={styles.pv0}
                placeholder={field.name}
                label={field.name}
                defaultValue={value}
                closeOverlay={onBackButtonPress}
                onChange={onChange}
            />
        </View>
    );
}

function ReportFieldPopup({closeOverlay, updateFilterForm}: ReportFieldPopupProps) {
    const {translate, localeCompare} = useLocalize();
    const StyleUtils = useStyleUtils();
    const policyReportFieldsSelector = (policies: OnyxCollection<Policy>) => createAllPolicyReportFieldsSelector(policies, localeCompare);
    const [fieldList] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: policyReportFieldsSelector,
    });
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);
    const [values, setValues] = useState<Record<ReportFieldTextKey | ReportFieldDateKey, string | undefined>>({});

    const getValue = (fieldName: string, fieldType: PolicyReportFieldType) => {
        const suffix = getFieldNameAsKey(fieldName);
        if (fieldType === CONST.REPORT_FIELD_TYPES.DATE) {
            const onKey = `${CONST.SEARCH.REPORT_FIELD.ON_PREFIX}${suffix}` as const;
            const beforeKey = `${CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX}${suffix}` as const;
            const afterKey = `${CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX}${suffix}` as const;
            const rangeKey = `${CONST.SEARCH.REPORT_FIELD.RANGE_PREFIX}${suffix}` as const;
            return {
                [CONST.SEARCH.DATE_MODIFIERS.ON]: values[onKey] ?? searchAdvancedFiltersForm?.[onKey],
                [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: values[beforeKey] ?? searchAdvancedFiltersForm?.[beforeKey],
                [CONST.SEARCH.DATE_MODIFIERS.AFTER]: values[afterKey] ?? searchAdvancedFiltersForm?.[afterKey],
                [CONST.SEARCH.DATE_MODIFIERS.RANGE]: values[rangeKey] ?? searchAdvancedFiltersForm?.[rangeKey],
            };
        }
        const filterKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${suffix}` as const;
        return values[filterKey] ?? searchAdvancedFiltersForm?.[filterKey] ?? '';
    };

    if (selectedField) {
        const goBack = () => {
            setSelectedField(null);
        };

        // We only support list, date, & text for report fields, no other types
        const fieldType = selectedField.type as Exclude<ValueOf<typeof CONST.REPORT_FIELD_TYPES>, typeof CONST.REPORT_FIELD_TYPES.FORMULA>;
        const suffix = getFieldNameAsKey(selectedField.name);
        const filterValue = getValue(selectedField.name, selectedField.type);

        if (fieldType === CONST.REPORT_FIELD_TYPES.DATE) {
            const onKey = `${CONST.SEARCH.REPORT_FIELD.ON_PREFIX}${suffix}`;
            const afterKey = `${CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX}${suffix}`;
            const beforeKey = `${CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX}${suffix}`;
            const rangeKey = `${CONST.SEARCH.REPORT_FIELD.RANGE_PREFIX}${suffix}`;
            return (
                <ReportFieldDatePopup
                    field={selectedField}
                    value={filterValue as SearchDateValues}
                    onBackButtonPress={goBack}
                    onChange={(newValue) =>
                        setValues((prevValues) => ({
                            ...prevValues,
                            [onKey]: newValue[CONST.SEARCH.DATE_MODIFIERS.ON],
                            [afterKey]: newValue[CONST.SEARCH.DATE_MODIFIERS.AFTER],
                            [beforeKey]: newValue[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
                            [rangeKey]: newValue[CONST.SEARCH.DATE_MODIFIERS.RANGE],
                        }))
                    }
                />
            );
        }

        const UpdateReportFieldComponent = {
            [CONST.REPORT_FIELD_TYPES.LIST]: ReportFieldListPopup,
            [CONST.REPORT_FIELD_TYPES.TEXT]: ReportFieldTextPopup,
        }[fieldType];

        const filterKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${suffix}` as const;
        return (
            <UpdateReportFieldComponent
                field={selectedField}
                value={filterValue as string}
                onBackButtonPress={goBack}
                onChange={(newValue) => setValues((prevValues) => ({...prevValues, [filterKey]: newValue.trim()}))}
            />
        );
    }

    const applyChanges = () => {
        updateFilterForm(values);
        closeOverlay();
    };

    const resetChanges = () => {
        const formValues = Object.values(fieldList ?? {}).reduce(
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
        );
        updateFilterForm(formValues);
        closeOverlay();
    };

    const listItems = Object.values(fieldList ?? {}).map((field) => {
        const formValue = getValue(field.name, field.type);

        if (field.type === CONST.REPORT_FIELD_TYPES.DATE) {
            const formDateValue = formValue as SearchDateValues;
            const dateValues: string[] = [];
            const onValue = formDateValue?.[CONST.SEARCH.DATE_MODIFIERS.ON];
            const afterValue = formDateValue?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
            const beforeValue = formDateValue?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
            const rangeValue = formDateValue?.[CONST.SEARCH.DATE_MODIFIERS.RANGE];

            if (onValue) {
                dateValues.push(isSearchDatePreset(onValue) ? translate(`search.filters.date.presets.${onValue}`) : translate('search.filters.date.on', onValue));
            }

            if (afterValue) {
                dateValues.push(translate('search.filters.date.after', afterValue));
            }

            if (beforeValue) {
                dateValues.push(translate('search.filters.date.before', beforeValue));
            }

            if (rangeValue) {
                const rangeDisplay = getDateRangeDisplayValueFromFormValue(rangeValue, undefined, undefined, true);
                if (rangeDisplay) {
                    dateValues.push(rangeDisplay);
                }
            }

            return {key: field.fieldID, name: field.name, value: dateValues.join(', '), field};
        }

        return {key: field.fieldID, name: field.name, value: formValue as string, field};
    });

    return (
        <BasePopup
            label={translate('workspace.common.reportField')}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_REPORT_FIELD}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_REPORT_FIELD}
        >
            <ScrollView style={[StyleUtils.getMaximumHeight(CONST.POPOVER_DROPDOWN_MAX_HEIGHT)]}>
                {listItems.map((item) => (
                    <MenuItem
                        key={item.key}
                        shouldShowRightIcon
                        viewMode={CONST.OPTION_MODE.COMPACT}
                        title={item.name}
                        description={item.value}
                        onPress={() => setSelectedField(item.field)}
                    />
                ))}
            </ScrollView>
        </BasePopup>
    );
}

export default ReportFieldPopup;
