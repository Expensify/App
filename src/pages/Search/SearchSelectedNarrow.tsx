import React from 'react';
import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';

type SearchSelectedNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchSelectedNarrow({queryJSON}: SearchSelectedNarrowProps) {
    return <SearchBulkActionsButton queryJSON={queryJSON} />;
}

export default SearchSelectedNarrow;
