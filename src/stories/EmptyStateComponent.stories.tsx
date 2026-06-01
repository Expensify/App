import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {EmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

type EmptyStateComponentStory = StoryFn<typeof EmptyStateComponent>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof EmptyStateComponent> = {
    title: 'Lists/EmptyStateComponent',
    component: EmptyStateComponent,
};

function DefaultTemplate(props: Omit<EmptyStateComponentProps, 'headerMedia'>) {
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);
    return (
        <EmptyStateComponent
            {...props}
            headerMedia={illustrations.ToddBehindCloud}
        />
    );
}

const Default: EmptyStateComponentStory = DefaultTemplate.bind({});
Default.args = {
    title: 'Nothing to see here',
    subtitle: 'There are no items to display at the moment.',
};

const WithButton: EmptyStateComponentStory = DefaultTemplate.bind({});
WithButton.args = {
    title: 'No expenses yet',
    subtitle: 'Start by creating your first expense.',
    buttons: [
        {
            buttonText: 'Create expense',
            buttonAction: () => {},
            success: true,
        },
    ],
};

export default story;
export {Default, WithButton};
