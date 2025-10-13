import React, {useCallback, useMemo, useRef, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import ScrollView from '@components/ScrollView';
import type {ReportFieldDateKey, SearchDateFilterKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDatePresetFilterBaseHandle} from './DatePresetFilterBase';
import DatePresetFilterBase from './DatePresetFilterBase';

type DateFilterBaseProps = {
    /** Key used for the date filter */
    dateKey: SearchDateFilterKeys;
};

function DateFilterBase({dateKey}: DateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const dateOnKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX, CONST.SEARCH.REPORT_FIELD.ON_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as const);

    const dateBeforeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX, CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as const);

    const dateAfterKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX, CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as const);

    const defaultDateValues = {
        [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm?.[dateOnKey],
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm?.[dateBeforeKey],
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm?.[dateAfterKey],
    };

    const presets = useMemo(() => {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }, [dateKey, searchAdvancedFiltersForm?.feed]);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            setSelectedDateModifier(null);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier]);

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            setSelectedDateModifier(null);
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        updateAdvancedFilters({
            [dateOnKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
            [dateBeforeKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
            [dateAfterKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
        });
    }, [selectedDateModifier, dateOnKey, dateBeforeKey, dateAfterKey]);

    return (
        <>
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={defaultDateValues}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={setSelectedDateModifier}
                    presets={presets}
                />
            </ScrollView>
            <Button
                text={translate('common.reset')}
                onPress={reset}
                style={[styles.mh4, styles.mt4]}
                large
            />
            <FormAlertWithSubmitButton
                buttonText={translate('common.save')}
                containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                onSubmit={save}
                enabledWhenOffline
            />
        </>
    );
}

DateFilterBase.displayName = 'SearchDatePresetFilterBasePage';

export default DateFilterBase;
