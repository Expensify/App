import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import HomeSectionEmptyState from '@pages/home/HomeSectionEmptyState';

import React from 'react';

function EmptyState() {
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MoneyReceipts']);

    return (
        <HomeSectionEmptyState
            testID="recentlyAddedEmptyState"
            illustration={illustrations.MoneyReceipts}
            title={translate('homePage.recentlyAddedSection.emptyStateTitle')}
            description={translate('homePage.recentlyAddedSection.emptyStateMessage')}
        />
    );
}

export default EmptyState;
