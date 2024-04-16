import React from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type SearchResultsProps = {
    query: string;
};

function SearchResults({query}: SearchResultsProps) {
    const styles = useThemeStyles();

    return <Text style={styles.textHeadlineH1}>Search results for: |{query}| filter</Text>;
}

SearchResults.displayName = 'SearchResults';

export default SearchResults;
