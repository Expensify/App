import React, {useCallback, useMemo, useRef, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import type {ReportFieldDateKey, SearchDateFilterKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {SearchDatePresetFilterBaseHandle} from './DatePresetFilterBase';
import DatePresetFilterBase from './DatePresetFilterBase';

type DateFilterBaseProps = {
    title: string;
    dateKey: SearchDateFilterKeys;
    back: () => void;
    onSubmit: (values: Record<string, string | null>) => void;
};

function DateFilterBase({title, dateKey, back, onSubmit}: DateFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [searchAdvancedFiltersForm, searchAdvancedFiltersFormMetadata] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const isSearchAdvancedFiltersFormLoading = isLoadingOnyxValue(searchAdvancedFiltersFormMetadata);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const dateOnKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.ON_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}` as const);

    const dateBeforeKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.BEFORE_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}` as const);

    const dateAfterKey = dateKey.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)
        ? (dateKey.replace(CONST.SEARCH.REPORT_FIELD.DEFAULT_PREFIX, CONST.SEARCH.REPORT_FIELD.AFTER_PREFIX) as ReportFieldDateKey)
        : (`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}` as const);

    const dateOnValue = searchAdvancedFiltersForm?.[dateOnKey];
    const dateBeforeValue = searchAdvancedFiltersForm?.[dateBeforeKey];
    const dateAfterValue = searchAdvancedFiltersForm?.[dateAfterKey];

    const defaultDateValues = useMemo(
        () => ({
            [CONST.SEARCH.DATE_MODIFIERS.ON]: dateOnValue,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBeforeValue,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfterValue,
        }),
        [dateAfterValue, dateBeforeValue, dateOnValue],
    );

    const presets = useMemo(() => {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }, [dateKey, searchAdvancedFiltersForm?.feed]);

    const computedTitle = useMemo(() => {
        if (selectedDateModifier) {
            return translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`);
        }

        return title;
    }, [selectedDateModifier, title, translate]);

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

        onSubmit({
            [dateOnKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
            [dateBeforeKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
            [dateAfterKey]: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
        });
    }, [selectedDateModifier, dateOnKey, dateBeforeKey, dateAfterKey, onSubmit]);

    const goBack = () => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            return;
        }

        back();
    };

    return (
        <>
            <HeaderWithBackButton
                title={computedTitle}
                onBackButtonPress={goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={defaultDateValues}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={setSelectedDateModifier}
                    presets={presets}
                    isSearchAdvancedFiltersFormLoading={isSearchAdvancedFiltersFormLoading}
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

export default DateFilterBase;
