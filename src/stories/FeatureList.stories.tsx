import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import DotLottieAnimations from '@components/LottieAnimations';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

type FeatureListStory = StoryFn<typeof FeatureList>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof FeatureList> = {
    title: 'Lists/FeatureList',
    component: FeatureList,
};

function DefaultTemplate(props: Omit<React.ComponentProps<typeof FeatureList>, 'menuItems'>) {
    const icons = useMemoizedLazyExpensifyIcons(['Receipt', 'Document', 'Tag']);
    const menuItems: FeatureListItem[] = [
        {
            icon: icons.Receipt,
            translationKey: 'workspace.moreFeatures.expensifyCard.subtitle',
        },
        {
            icon: icons.Document,
            translationKey: 'workspace.moreFeatures.expensifyCard.title',
        },
        {
            icon: icons.Tag,
            translationKey: 'workspace.moreFeatures.tags.subtitle',
        },
    ];
    return (
        <FeatureList
            {...props}
            menuItems={menuItems}
        />
    );
}

const Default: FeatureListStory = DefaultTemplate.bind({});
Default.args = {
    title: 'Unlock features for your workspace',
    subtitle: 'Use the Expensify Card to manage spending in one place.',
    ctaText: 'Get started',
    illustration: DotLottieAnimations.Hands,
};

const WithoutCTA: FeatureListStory = DefaultTemplate.bind({});
WithoutCTA.args = {
    title: 'Feature overview',
    subtitle: 'Everything you need to manage expenses.',
    illustration: DotLottieAnimations.FastMoney,
};

export default story;
export {Default, WithoutCTA};
