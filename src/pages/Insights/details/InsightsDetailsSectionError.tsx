import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

import React from 'react';

type InsightsDetailsSectionErrorProps = {
    /** Whether the request got no response, which asks for a refresh instead of reporting an error */
    isStale: boolean;

    /** Requests the section again */
    onRetry: () => void;
};

/** Stands in for a Details panel section whose request failed. */
function InsightsDetailsSectionError({isStale, onRetry}: InsightsDetailsSectionErrorProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    if (isStale) {
        return (
            <FullPageErrorView
                shouldShow
                title={translate('search.searchResults.staleResults.title')}
                subtitle={translate('search.searchResults.staleResults.subtitle')}
                illustration="ChartSync"
                illustrationWidth={variables.iconSizeUltraLarge}
                illustrationHeight={variables.iconSizeUltraLarge}
                buttonTranslationKey="search.searchResults.staleResults.buttonText"
                onButtonPress={onRetry}
            />
        );
    }

    return (
        <FullPageErrorView
            shouldShow
            title={translate('errorPage.title', {isBreakLine: shouldUseNarrowLayout})}
            subtitle={translate('errorPage.subtitle')}
            buttonTranslationKey="common.tryAgain"
            onButtonPress={onRetry}
        />
    );
}

export default InsightsDetailsSectionError;
