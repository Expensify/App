import type {SearchQueryJSON} from '@components/Search/types';

import React from 'react';

import SearchPageHeaderCommon from './SearchPageHeaderCommon';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    return <SearchPageHeaderCommon queryJSONType={queryJSON.type} />;
}

export default SearchPageHeaderWide;
