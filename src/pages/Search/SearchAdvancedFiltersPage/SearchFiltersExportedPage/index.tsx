import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SearchFiltersExportedCalendarView from './CalendarView';
import SearchFiltersExportedRootView from './RootView';

type SearchFiltersExportedPageValues = Record<SearchDateModifier, string | null>;

function SearchFiltersExportedPage() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    const [view, setView] = useState<SearchDateModifier | null>(null);
    const [localDateValues, setLocalDateValues] = useState<SearchFiltersExportedPageValues>({
        After: searchAdvancedFiltersForm?.exportedAfter ?? null,
        Before: searchAdvancedFiltersForm?.exportedBefore ?? null,
        On: searchAdvancedFiltersForm?.exportedOn ?? null,
    });

    const setDateValue = (key: SearchDateModifier, dateValue: string | null) => {
        setLocalDateValues((currentValue) => {
            // If we are setting the 'on' to 'never', reset the other dates
            if (key === CONST.SEARCH.DATE_MODIFIERS.ON && dateValue === CONST.SEARCH.NEVER) {
                return {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: dateValue,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: null,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: null,
                };
            }

            // If we are setting any other value while 'on' is set to 'never', reset 'on' to null
            if (key !== CONST.SEARCH.DATE_MODIFIERS.ON && currentValue?.[CONST.SEARCH.DATE_MODIFIERS.ON] === CONST.SEARCH.NEVER) {
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
            return Object.fromEntries(Object.entries(prev).map(([key]) => [key, null])) as SearchFiltersExportedPageValues;
        });
    }, []);

    const applyChanges = useCallback(() => {
        updateAdvancedFilters({
            exportedOn: localDateValues?.[CONST.SEARCH.DATE_MODIFIERS.ON],
            exportedAfter: localDateValues?.[CONST.SEARCH.DATE_MODIFIERS.AFTER],
            exportedBefore: localDateValues?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
        });
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [localDateValues]);

    if (!view) {
        return (
            <SearchFiltersExportedRootView
                value={localDateValues}
                setView={setView}
                setValue={setDateValue}
                applyChanges={applyChanges}
                resetChanges={resetChanges}
            />
        );
    }

    return (
        <SearchFiltersExportedCalendarView
            view={view}
            value={localDateValues[view]}
            setValue={setDateValue}
            navigateBack={navigateToRootView}
        />
    );
}

SearchFiltersExportedPage.displayName = 'SearchFiltersExportedPage';

export type {SearchFiltersExportedPageValues};
export default SearchFiltersExportedPage;
