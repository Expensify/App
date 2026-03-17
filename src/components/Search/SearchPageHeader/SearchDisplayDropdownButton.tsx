import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DisplayPopup from '@components/Search/FilterDropdowns/DisplayPopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

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

    const displayPopup = ({closeOverlay}: PopoverComponentProps) => (
        <DisplayPopup
            queryJSON={queryJSON}
            searchResults={searchResults}
            closeOverlay={closeOverlay}
            onSort={onSort}
        />
    );

    return (
        <DropdownButton
            label={translate('search.display.label')}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_DISPLAY}
            value={null}
            PopoverComponent={displayPopup}
        />
    );
}

export default SearchDisplayDropdownButton;
