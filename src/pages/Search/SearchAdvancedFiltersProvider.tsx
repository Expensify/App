import React, {useState} from 'react';
import useUpdateFilterQuery from '@components/Search/hooks/useUpdateFilterQuery';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import useOnyx from '@hooks/useOnyx';
import {exitSavedViewEditMode, saveSavedViewEdits, setSaveAsNewViewQuery, setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON, getAdvancedFiltersToReset} from '@libs/SearchQueryUtils';
import {getSavedViewSaveButtonDisabledStates} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SearchAdvancedFiltersValue = {
    currentDraftFilters: Partial<SearchAdvancedFiltersForm>;
    shouldShowResetFilters: boolean;

    /** Whether the filters page was opened through the saved-view "Edit filters" flow (shows the edit footer) */
    isEditingSavedView: boolean;

    /** Save edits would clobber a different saved view at the edited query's hash */
    isSaveEditsDisabled: boolean;

    /** The edited query already matches a saved view, so saving a "new" one would just rename it */
    isSaveAsNewViewDisabled: boolean;
};

type SearchAdvancedFiltersActionValue = {
    setDraftFilters: (values: Partial<SearchAdvancedFiltersForm>) => void;
    applyFilters: () => void;
    resetFilters: () => void;
    saveEdits: () => void;
    saveAsNewView: () => void;
    cancelEdits: () => void;
};

const SearchAdvancedFiltersContext = React.createContext<SearchAdvancedFiltersValue>({
    currentDraftFilters: {},
    shouldShowResetFilters: false,
    isEditingSavedView: false,
    isSaveEditsDisabled: false,
    isSaveAsNewViewDisabled: false,
});

const SearchAdvancedFiltersActionContext = React.createContext<SearchAdvancedFiltersActionValue>({
    setDraftFilters: () => {},
    applyFilters: () => {},
    resetFilters: () => {},
    saveEdits: () => {},
    saveAsNewView: () => {},
    cancelEdits: () => {},
});

type SearchAdvancedFiltersProviderProps = {
    children: React.ReactNode;
};

function SearchAdvancedFiltersProvider({children}: SearchAdvancedFiltersProviderProps) {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [editingSavedView] = useOnyx(ONYXKEYS.SEARCH_EDITING_SAVED_VIEW);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {getUpdatedFilterFormValues, setFilterQueryParams, buildFilterQueryString} = useUpdateFilterQuery(currentSearchQueryJSON);

    const [values, setValues] = useState<Partial<SearchAdvancedFiltersForm>>(searchAdvancedFiltersForm ?? {});

    const advancedFiltersToReset = searchAdvancedFiltersForm ? getAdvancedFiltersToReset(searchAdvancedFiltersForm) : undefined;

    const isEditingSavedView = !!editingSavedView;
    // The hash the edited draft would save under; used to decide which save buttons to disable.
    const editedQueryHash = buildSearchQueryJSON(buildFilterQueryString(values))?.hash;
    const {isSaveAsNewViewDisabled, isSaveEditsDisabled} = getSavedViewSaveButtonDisabledStates(savedSearches, editedQueryHash, editingSavedView?.hash);

    const applyFilters = () => {
        Navigation.dismissModal({afterTransition: () => setFilterQueryParams(values)});
    };

    const resetFilters = () => {
        if (!advancedFiltersToReset) {
            return;
        }
        Navigation.dismissModal({
            afterTransition: () => {
                setFilterQueryParams(advancedFiltersToReset);
                setSearchContext(false);
            },
        });
    };

    const setDraftFilters = (newValues: Partial<SearchAdvancedFiltersForm>) => {
        setValues((prevValues) => getUpdatedFilterFormValues(prevValues, newValues));
    };

    const saveEdits = () => {
        if (!editingSavedView) {
            return;
        }
        const queryJSON = buildSearchQueryJSON(buildFilterQueryString(values));
        if (!queryJSON) {
            return;
        }
        Navigation.dismissModal({
            afterTransition: () => {
                setFilterQueryParams(values);
                saveSavedViewEdits({queryJSON, editingSavedView});
            },
        });
    };

    const saveAsNewView = () => {
        const queryString = buildFilterQueryString(values);
        if (!queryString) {
            return;
        }
        // Carry the edited query to the save page without changing the active search (mobile filters are a draft), so
        // backing out returns to the edited view.
        setSaveAsNewViewQuery(queryString);
        Navigation.dismissModal({
            afterTransition: () => {
                exitSavedViewEditMode();
                Navigation.navigate(ROUTES.SEARCH_SAVE);
            },
        });
    };

    // The edited draft isn't applied to the search until a save, so cancelling just leaves edit mode on the original view.
    const cancelEdits = () => {
        Navigation.dismissModal({
            afterTransition: () => exitSavedViewEditMode(),
        });
    };

    const searchAdvancedFiltersValue: SearchAdvancedFiltersValue = {
        currentDraftFilters: values,
        shouldShowResetFilters: !isEmptyObject(advancedFiltersToReset),
        isEditingSavedView,
        isSaveEditsDisabled,
        isSaveAsNewViewDisabled,
    };

    const searchAdvancedFiltersActionValue: SearchAdvancedFiltersActionValue = {
        applyFilters,
        resetFilters,
        setDraftFilters,
        saveEdits,
        saveAsNewView,
        cancelEdits,
    };

    return (
        <SearchAdvancedFiltersContext.Provider value={searchAdvancedFiltersValue}>
            <SearchAdvancedFiltersActionContext.Provider value={searchAdvancedFiltersActionValue}>{children}</SearchAdvancedFiltersActionContext.Provider>
        </SearchAdvancedFiltersContext.Provider>
    );
}

export default SearchAdvancedFiltersProvider;
export {SearchAdvancedFiltersContext, SearchAdvancedFiltersActionContext};
