import type {IllustrationName} from '@components/Icon/chunks/illustrations.chunk';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import HomeSectionEmptyState from '@pages/home/HomeSectionEmptyState';

import type {TranslationPaths} from '@src/languages/types';

import React from 'react';

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
] as const;

type EmptyStateConfig = {
    titleKey: TranslationPaths;
    descriptionKey: TranslationPaths;
    illustrationName: IllustrationName;
};

const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const EMPTY_STATE_CONFIGS: EmptyStateConfig[] = ILLUSTRATIONS.map((name) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- lowercasing the first char keeps the literal value, so it matches Uncapitalize<typeof name> which TS can't infer from runtime string ops
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
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);

    return (
        <HomeSectionEmptyState
            illustration={illustrations[CONFIG.illustrationName]}
            title={translate(CONFIG.titleKey)}
            description={translate(CONFIG.descriptionKey)}
        />
    );
}

export default EmptyState;
