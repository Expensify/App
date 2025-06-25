import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {SearchDateFilterKeys} from '@components/Search/types';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchDateFilterBaseCalendarView from './CalendarView';
import SearchDateFilterBaseRootView from './RootView';

type SearchFiltersDatePageValues = Record<SearchDateModifier, string | null>;

type SearchDateFilterBaseProps = {
    /** Key used for the date filter */
    dateKey: SearchDateFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchDateFilterBase({dateKey, titleKey}: SearchDateFilterBaseProps) {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const [view, setView] = useState<SearchDateModifier | null>(null);
    const [localDateValues, setLocalDateValues] = useState<SearchFiltersDatePageValues>({
        After: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`] ?? null,
        Before: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`] ?? null,
        On: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`] ?? null,
    });

    const setDateValue = (key: SearchDateModifier, dateValue: string | null) => {
        setLocalDateValues((currentValue) => {
            // If we are setting the 'on' to 'never', reset the other dates
            if (key === CONST.SEARCH.DATE_MODIFIERS.ON && dateValue === CONST.SEARCH.DATE_PRESETS.NEVER) {
                return {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: dateValue,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: null,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: null,
                };
            }

            // If we are setting any other value while 'on' is set to 'never', reset 'on' to null
            if (key !== CONST.SEARCH.DATE_MODIFIERS.ON && currentValue?.[CONST.SEARCH.DATE_MODIFIERS.ON] === CONST.SEARCH.DATE_PRESETS.NEVER) {
                return {
                    ...currentValue,
                    [key]: dateValue,
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: null,
                };
            }

            return {
                ...currentValue,
                [key]: dateValue,
            };
        });
    };

    const navigateToRootView = useCallback(() => {
        setView(null);
    }, []);

    const resetChanges = useCallback(() => {
        // Reset each field back to null
        setLocalDateValues((prev) => {
            return Object.fromEntries(Object.entries(prev).map(([key]) => [key, null])) as SearchFiltersDatePageValues;
        });
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({
            [`${dateKey}On`]: localDateValues?.[CONST.SEARCH.DATE_MODIFIERS.ON],
            [`${dateKey}After`]: localDateValues?.[CONST.SEARCH.DATE_MODIFIERS.AFTER],
            [`${dateKey}Before`]: localDateValues?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
        });
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [dateKey, localDateValues]);

    if (!view) {
        return (
            <SearchDateFilterBaseRootView
                titleKey={titleKey}
                value={localDateValues}
                setView={setView}
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        );
    }

    return (
        <SearchDateFilterBaseCalendarView
            view={view}
            value={localDateValues[view]}
            setValue={setDateValue}
            navigateBack={navigateToRootView}
        />
    );
}

SearchDateFilterBase.displayName = 'SearchDateFilterBase';

export type {SearchFiltersDatePageValues, SearchDateFilterBaseProps};
export default SearchDateFilterBase;
