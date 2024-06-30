import React from 'react';
import * as Illustrations from '@components/Icon/Illustrations';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';

function EmptySearchView() {
    const {translate} = useLocalize();

    return (
        <WorkspaceEmptyStateSection
            icon={Illustrations.EmptyStateExpenses}
            title={translate('search.searchResults.emptyResults.title')}
            subtitle={translate('search.searchResults.emptyResults.subtitle')}
        />
    );
}

EmptySearchView.displayName = 'EmptySearchView';

export default EmptySearchView;
