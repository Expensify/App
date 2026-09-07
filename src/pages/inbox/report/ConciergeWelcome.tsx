import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import HomeSectionEmptyState from '@pages/home/HomeSectionEmptyState';

import React from 'react';

const ILLUSTRATION_NAMES = ['ConciergeBot'] as const;

/**
 * Empty state shown in the main Concierge DM before the user asks anything.
 */
function ConciergeWelcome() {
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);

    return (
        <HomeSectionEmptyState
            illustration={illustrations.ConciergeBot}
            title={translate('reportActionsView.askMeAnything')}
            description={translate('common.concierge.welcomeDescription')}
            testID="ConciergeWelcome"
        />
    );
}

export default ConciergeWelcome;
