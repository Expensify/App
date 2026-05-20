import getAutocompleteSelectionSubstitutionKey from './getAutocompleteSelectionSubstitutionKey';
import type {SubstitutionMap} from './getQueryWithSubstitutions';

type UpdateAutocompleteSubstitutionsParams = {
    newSearchQuery: string;
    fieldKey: string | undefined;
    mapKey: string | undefined;
    searchQuery: string;
    autocompleteID: string | undefined;
    substitutions: SubstitutionMap;
    setAutocompleteSubstitutions: (value: SubstitutionMap) => void;
};

function updateAutocompleteSubstitutionsForSelection({
    newSearchQuery,
    fieldKey,
    mapKey,
    searchQuery,
    autocompleteID,
    substitutions,
    setAutocompleteSubstitutions,
}: UpdateAutocompleteSubstitutionsParams) {
    if (!mapKey || !autocompleteID || !fieldKey) {
        return;
    }

    const substitutionKey = getAutocompleteSelectionSubstitutionKey(newSearchQuery, fieldKey, mapKey, searchQuery);
    setAutocompleteSubstitutions({...substitutions, [substitutionKey]: autocompleteID});
}

export default updateAutocompleteSubstitutionsForSelection;
