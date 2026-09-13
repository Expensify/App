import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import HomeSectionEmptyState from '@pages/home/HomeSectionEmptyState';

import React from 'react';

const ILLUSTRATION_NAMES = ['ConciergeBot'] as const;

/**
 * Empty state shown in the main Concierge DM before the user asks anything.
 */
function ConciergeWelcome() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);

    return (
        <HomeSectionEmptyState
            illustration={illustrations.ConciergeBot}
            title={translate('reportActionsView.askMeAnything')}
            description={translate('common.concierge.welcomeDescription')}
            testID="ConciergeWelcome"
            containerStyles={styles.mt0}
            titleStyles={styles.conciergeWelcomeTitle}
        />
    );
}

export default ConciergeWelcome;
