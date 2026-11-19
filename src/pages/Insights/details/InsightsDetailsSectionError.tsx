import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

import React from 'react';

type InsightsDetailsSectionErrorProps = {
    /** Whether the request got no response, in which case we ask the user to refresh instead of showing an error */
    isStale: boolean;

    onRetry: () => void;
};

/** Error state shown in place of the Details panel's content when its request fails */
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
