import React, {useMemo} from 'react';
import {View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

const ILLUSTRATION_SIZE = 100;

const EMPTY_STATE_MESSAGES = [
    {
        titleKey: 'homePage.forYouSection.emptyStateMessages.nicelyDone',
        subtitleKey: 'homePage.forYouSection.emptyStateMessages.keepAnEyeOut',
        illustration: Illustrations.ThumbsUpStars,
    },
    {
        titleKey: 'homePage.forYouSection.emptyStateMessages.allCaughtUp',
        subtitleKey: 'homePage.forYouSection.emptyStateMessages.upcomingTodos',
        illustration: Illustrations.Fireworks,
    },
] as const;

function EmptyState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Select a random empty state message on mount (will change on refresh/remount)
    const emptyStateMessage = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, react-hooks/purity
        () => EMPTY_STATE_MESSAGES.at(Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length))!,
        [],
    );

    return (
        <View style={styles.forYouEmptyStateContainer}>
            <ImageSVG
                src={emptyStateMessage.illustration}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <Text style={styles.forYouEmptyStateTitle}>{translate(emptyStateMessage.titleKey)}</Text>
            <Text style={styles.forYouEmptyStateSubtitle}>{translate(emptyStateMessage.subtitleKey)}</Text>
        </View>
    );
}

EmptyState.displayName = 'EmptyState';

export default EmptyState;
