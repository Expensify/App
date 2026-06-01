import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import CollapsibleSection from '@components/CollapsibleSection';
import Text from '@components/Text';

type CollapsibleSectionStory = StoryFn<typeof CollapsibleSection>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof CollapsibleSection> = {
    title: 'Layout/CollapsibleSection',
    component: CollapsibleSection,
};

function Template(props: React.ComponentProps<typeof CollapsibleSection>) {
    return (
        <CollapsibleSection {...props}>
            <Text>This content is hidden until the section is expanded. Tap the header above to toggle.</Text>
        </CollapsibleSection>
    );
}

const Default: CollapsibleSectionStory = Template.bind({});
Default.args = {
    title: 'Advanced settings',
};

const WithBorder: CollapsibleSectionStory = Template.bind({});
WithBorder.args = {
    title: 'More details',
    shouldShowSectionBorder: true,
};

export default story;
export {Default, WithBorder};
