import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON} from '@components/Search/types';

import React from 'react';

type SearchSelectedNarrowProps = {
    queryJSON: SearchQueryJSON;
};

function SearchSelectedNarrow({queryJSON}: SearchSelectedNarrowProps) {
    return <SearchBulkActionsButton queryJSON={queryJSON} />;
}

export default SearchSelectedNarrow;
