import React from 'react';
import {View} from 'react-native';
import type {IllustrationName} from '@components/Icon/chunks/illustrations.chunk';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

const ILLUSTRATION_SIZE = 68;

const MSG = 'homePage.forYouSection.emptyStateMessages' as const;

const ILLUSTRATIONS = [
    'ThumbsUpStars',
    'SmallRocket',
    'CowboyHat',
    'Trophy1',
    'PalmTree',
    'FishbowlBlue',
    'Target',
    'Chair',
    'Broom',
    'House',
    'ConciergeBot',
    'CheckboxText',
    'Flash',
    'Sunglasses',
    'F1Flags',
    'Fireworks',
] as const;

type EmptyStateConfig = {
    titleKey: TranslationPaths;
    descriptionKey: TranslationPaths;
    illustrationName: IllustrationName;
};

const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const EMPTY_STATE_CONFIGS: EmptyStateConfig[] = ILLUSTRATIONS.map((name) => {
    const uncapitalizedName = lcFirst(name) as Uncapitalize<typeof name>;
    const titleKey: TranslationPaths = `${MSG}.${uncapitalizedName}Title`;
    const descriptionKey: TranslationPaths = `${MSG}.${uncapitalizedName}Description`;
    return {
        titleKey,
        descriptionKey,
        illustrationName: name,
    };
});

const ILLUSTRATION_NAMES = EMPTY_STATE_CONFIGS.map((c) => c.illustrationName);

// Selected once at module load so the message stays stable across remounts (e.g. during onboarding modals)
const RANDOM_INDEX = Math.floor(Math.random() * EMPTY_STATE_CONFIGS.length);
// eslint-disable-next-line rulesdir/prefer-at -- Using [0] for definite type since .at() returns T | undefined
const CONFIG = EMPTY_STATE_CONFIGS.at(RANDOM_INDEX) ?? EMPTY_STATE_CONFIGS[0];

function EmptyState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);

    return (
        <View style={styles.forYouEmptyStateContainer}>
            <ImageSVG
                src={illustrations[CONFIG.illustrationName]}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <View style={styles.forYouEmptyStateTextContainer}>
                <Text style={styles.forYouEmptyStateTitle}>{translate(CONFIG.titleKey)}</Text>
                <Text style={styles.forYouEmptyStateDescription}>{translate(CONFIG.descriptionKey)}</Text>
            </View>
        </View>
    );
}

export default EmptyState;
