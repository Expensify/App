import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const ILLUSTRATION_NAMES = ['ConciergeBot'] as const;
const ILLUSTRATION_SIZE = 68;

/**
 * Empty state shown in the main Concierge DM before the user asks anything.
 */
function AskConciergeEmptyState() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);

    return (
        <View
            testID="AskConciergeEmptyState"
            style={styles.askConciergeEmptyStateContainer}
        >
            <ImageSVG
                src={illustrations.ConciergeBot}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <Text style={styles.askConciergeEmptyStateTitle}>{translate('reportActionsView.askMeAnything')}</Text>
            <Text style={styles.askConciergeEmptyStateDescription}>{translate('common.concierge.welcomeDescription')}</Text>
        </View>
    );
}

export default AskConciergeEmptyState;
