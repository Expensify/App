import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

const ILLUSTRATION_SIZE = 100;

type EmptyStateMessage = {
    titleKey: TranslationPaths;
    subtitleKey: TranslationPaths;
    illustration: IconAsset;
};

function EmptyState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ThumbsUpStars', 'Fireworks']);

    const defaultEmptyStateMessage: EmptyStateMessage = {
        titleKey: 'homePage.forYouSection.emptyStateMessages.nicelyDone',
        subtitleKey: 'homePage.forYouSection.emptyStateMessages.keepAnEyeOut',
        illustration: illustrations.ThumbsUpStars,
    };

    const emptyStateMessages: EmptyStateMessage[] = [
        defaultEmptyStateMessage,
        {
            titleKey: 'homePage.forYouSection.emptyStateMessages.allCaughtUp',
            subtitleKey: 'homePage.forYouSection.emptyStateMessages.upcomingTodos',
            illustration: illustrations.Fireworks,
        },
    ];

    // Select a random empty state message on mount (will change on refresh/remount)
    // eslint-disable-next-line react-hooks/purity -- Random selection is intentional and should only happen once on mount
    const randomIndex = Math.floor(Math.random() * emptyStateMessages.length);
    const emptyStateMessage = emptyStateMessages.at(randomIndex) ?? defaultEmptyStateMessage;

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

export default EmptyState;
