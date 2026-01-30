import {createAllPolicyReportFieldsSelector} from '@selectors/Policy';
import React, {useCallback, useMemo, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {isSearchDatePreset} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyReportField} from '@src/types/onyx';
import ReportFieldDate from './ReportFieldDate';
import ReportFieldList from './ReportFieldList';
import ReportFieldText from './ReportFieldText';

function SearchFiltersReportFieldPage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();

    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);

    const [advancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: false});
    const policyReportFieldsSelector = useCallback((policies: OnyxCollection<Policy>) => createAllPolicyReportFieldsSelector(policies, localeCompare), [localeCompare]);
    const [fieldList] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: false,
        selector: policyReportFieldsSelector,
    });

    const listItems = useMemo(() => {
        return Object.values(fieldList ?? {}).map((field) => {
            const suffix = field.name.toLowerCase().replaceAll(' ', '-');

            if (field.type === CONST.REPORT_FIELD_TYPES.DATE) {
                const dateValues: string[] = [];
                const onValue = advancedFiltersForm?.[`${CONST.SEARCH.REPORT_FIELD.ON_PREFIX}${suffix}`];
                const afterValue = advancedFiltersForm?.[`${CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX}${suffix}`];
                const beforeValue = advancedFiltersForm?.[`${CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX}${suffix}`];

                if (onValue) {
                    dateValues.push(isSearchDatePreset(onValue) ? translate(`search.filters.date.presets.${onValue}`) : translate('search.filters.date.on', onValue));
                }

                if (afterValue) {
                    dateValues.push(translate('search.filters.date.after', afterValue));
                }

                if (beforeValue) {
                    dateValues.push(translate('search.filters.date.before', beforeValue));
                }

                return {key: field.fieldID, name: field.name, value: dateValues.join(', '), field};
            }

            const formKey = `${CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX}${suffix}` as const;
            const formValue = advancedFiltersForm?.[formKey];
            return {key: field.fieldID, name: field.name, value: formValue, field};
        });
    }, [advancedFiltersForm, fieldList, translate]);

    const resetValues = () => {
        const clearedAdvancedFiltersForm = Object.keys(advancedFiltersForm ?? {}).reduce((acc, key) => {
            if (key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
                return Object.assign(acc, {[key]: null});
            }
            return acc;
        }, {});

        updateAdvancedFilters(clearedAdvancedFiltersForm);
    };

    /**
     * Changes are automatically saved to the advanced filters form, so we can
     * just navigate back
     */
    const saveChanges = () => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    if (selectedField) {
        // We only support list, date, & text for report fields, no other types
        const fieldType = selectedField.type as Exclude<ValueOf<typeof CONST.REPORT_FIELD_TYPES>, typeof CONST.REPORT_FIELD_TYPES.FORMULA>;

        const UpdateReportFieldComponent = {
            [CONST.REPORT_FIELD_TYPES.LIST]: ReportFieldList,
            [CONST.REPORT_FIELD_TYPES.DATE]: ReportFieldDate,
            [CONST.REPORT_FIELD_TYPES.TEXT]: ReportFieldText,
        }[fieldType];

        return (
            <ScreenWrapper
                testID="SearchFiltersReportFieldPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <UpdateReportFieldComponent
                    field={selectedField}
                    close={() => setSelectedField(null)}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="SearchFiltersReportFieldPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.common.reportField')}
                onBackButtonPress={() => {
                    resetValues();
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
                shouldDisplayHelpButton={false}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
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
            <Button
                large
                text={translate('common.reset')}
                style={[styles.mh4, styles.mt4]}
                onPress={resetValues}
            />
            <FormAlertWithSubmitButton
                buttonText={translate('common.save')}
                containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                onSubmit={saveChanges}
                enabledWhenOffline
            />
        </ScreenWrapper>
    );
}

export default SearchFiltersReportFieldPage;
