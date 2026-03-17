import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';
import DisplayPopup from '../FilterDropdowns/DisplayPopup';
import DropdownButton from '../FilterDropdowns/DropdownButton';
import type {SearchQueryJSON} from '../types';

type SearchDisplayDropdownButtonProps = {
    queryJSON: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    onSort: () => void;
};

function SearchDisplayDropdownButton({queryJSON, searchResults, onSort}: SearchDisplayDropdownButtonProps) {
    const {translate} = useLocalize();

    if (queryJSON.type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return null;
    }

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={({closeOverlay}) => (
                <DisplayPopup
                    queryJSON={queryJSON}
                    searchResults={searchResults}
                    closeOverlay={closeOverlay}
                    onSort={onSort}
                />
            )}
        />
    );
}

export default SearchDisplayDropdownButton;
