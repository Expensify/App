import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/** Standard "No results found" state, shown inside a rules card when a search filters out every row. */
function RulesTabNoResults() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.EmptyShelves}
            headerContentStyles={styles.emptyShelvesIllustration}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            title={translate('common.noResultsFound')}
            subtitle={translate('common.noResultsFoundSubtitle')}
            minModalHeight={0}
        />
    );
}

export default RulesTabNoResults;
