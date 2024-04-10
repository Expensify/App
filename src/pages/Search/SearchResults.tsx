import React from 'react';
import Text from '@components/Text';

type SearchResultsProps = {
    filter: string;
};

function SearchResults({filter}: SearchResultsProps) {
    return <Text style={{color: 'white', fontSize: 30}}>Search results for: |{filter}| filter</Text>;
}

SearchResults.displayName = 'SearchResults';

export default SearchResults;
