import type {Meta, StoryFn} from '@storybook/react-webpack5';
import React from 'react';
import Section from '@components/Section';
import Text from '@components/Text';

type SectionStory = StoryFn<typeof Section>;

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof Section> = {
    title: 'Layout/Section',
    component: Section,
};

function Template(props: React.ComponentProps<typeof Section>) {
    return (
        <Section {...props}>
            <Text>Section body content goes here.</Text>
        </Section>
    );
}

const Default: SectionStory = Template.bind({});
Default.args = {
    title: 'Getting started',
    subtitle: 'Connect your bank account to start tracking expenses.',
};

const WithMenuItems: SectionStory = Template.bind({});
WithMenuItems.args = {
    title: 'Integrations',
    subtitle: 'Connect your accounting software.',
    menuItems: [
        {title: 'QuickBooks Online', key: 'qbo', shouldShowRightIcon: true},
        {title: 'Xero', key: 'xero', shouldShowRightIcon: true},
    ],
};

export default story;
export {Default, WithMenuItems};
