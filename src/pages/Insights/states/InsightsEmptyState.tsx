import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/** Stands in for the whole dashboard when the account has expenses but none of them fall inside the filters on screen. */
function InsightsEmptyState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MagnifyingGlassChart']);

    return (
        <GenericEmptyStateComponent
            headerMedia={illustrations.MagnifyingGlassChart}
            headerStyles={styles.emptyStateCardIllustrationContainer}
            headerContentStyles={[styles.insightsEmptyStateIllustration]}
            title={translate('insightsPage.emptyState.title')}
            subtitle={translate('insightsPage.emptyState.subtitle')}
            minModalHeight={0}
        />
    );
}

export default InsightsEmptyState;
