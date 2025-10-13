import React, {useCallback, useMemo, useRef, useState} from 'react';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import ScrollView from '@components/ScrollView';
import type {SearchDateFilterKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getDatePresets} from '@libs/SearchUIUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

    const defaultDateValues = {
        [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
    };

    const presets = useMemo(() => {
        const hasFeed = !!searchAdvancedFiltersForm?.feed?.length;
        return getDatePresets(dateKey, hasFeed);
    }, [dateKey, searchAdvancedFiltersForm?.feed]);

    const goBack = useCallback(() => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            return;
        }

        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [selectedDateModifier]);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            goBack();
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier, goBack]);

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            goBack();
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        updateAdvancedFilters({
            [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
            [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
            [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
        });
        goBack();
    }, [selectedDateModifier, goBack, dateKey]);

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
