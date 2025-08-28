import {useCallback, useState} from "react";
import type {ListItem} from "@components/SelectionList/types";
import type {SearchDataTypes} from "@src/types/onyx/SearchResults";
import CONST from "@src/CONST";
import {updateAdvancedFilters} from "@userActions/Search";
import Navigation from "@libs/Navigation/Navigation";
import ROUTES from "@src/ROUTES";
import ONYXKEYS from "@src/ONYXKEYS";
import useOnyx from "./useOnyx";

function useSearchFilters() {
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedItem, setSelectedItem] = useState(searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE);

    const update = useCallback((type: ListItem<SearchDataTypes>) => {
        setSelectedItem(type?.keyForList ?? CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const reset = useCallback(() => {
        setSelectedItem(CONST.SEARCH.DATA_TYPES.EXPENSE);
    }, []);

    const submit = useCallback(() => {
        const hasTypeChanged = selectedItem !== searchAdvancedFiltersForm?.type;
        const updatedFilters = {
            type: selectedItem,
            ...(hasTypeChanged && {
                groupBy: null,
                status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            }),
        };
        updateAdvancedFilters(updatedFilters);
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, [searchAdvancedFiltersForm?.type, selectedItem]);

    return {update, reset, submit}
}

export default useSearchFilters;